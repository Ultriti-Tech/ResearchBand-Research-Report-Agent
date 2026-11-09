import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const safeFilename = (topic) =>
  topic
    .replace(/[<>:"/\\|?*]/g, "-")
    .split("")
    .map((character) => {
      const code = character.charCodeAt(0);
      return code < 32 || (code >= 0x7f && code <= 0x9f)
        ? "-"
        : character;
    })
    .join("")
    .trim()
    .slice(0, 60) ||
  "research-report";

const reportMarkup = (report) =>
  renderToStaticMarkup(
    React.createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, report),
  );

const reportStyles = `
  body { color: #242424; font: 11pt/1.6 Arial, sans-serif; margin: 0; }
  article { max-width: 760px; margin: 0 auto; }
  h1 { font-size: 24pt; line-height: 1.2; margin: 0 0 22pt; }
  h2 { font-size: 18pt; margin: 26pt 0 10pt; }
  h3 { font-size: 14pt; margin: 20pt 0 8pt; }
  h4, h5, h6 { font-size: 12pt; margin: 16pt 0 6pt; }
  p, ul, ol, blockquote, pre, table { margin: 0 0 12pt; }
  li { margin: 0 0 4pt; }
  hr { border: 0; border-top: 1px solid #d1d5db; margin: 22pt 0; }
  a { color: #9a4c13; }
  pre, code { font-family: Consolas, monospace; }
  pre { background: #f3f4f6; padding: 10pt; white-space: pre-wrap; }
  blockquote { border-left: 3px solid #d1d5db; color: #555; padding-left: 12pt; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #d1d5db; padding: 6pt; text-align: left; }
  th { background: #f3f4f6; }
  @page { margin: 0.7in; }
`;

const htmlDocument = (title, markup) => `<!doctype html>
<html><head><meta charset="utf-8"><title>${title}</title>
<style>${reportStyles}</style></head>
<body><article>${markup}</article></body></html>`;

export function downloadMarkdown(topic, report) {
  const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
  downloadBlob(blob, `${safeFilename(topic)}.md`);
}

export function printReport(topic, report) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    throw new Error("Allow pop-ups to open the PDF print dialog.");
  }

  printWindow.document.open();
  printWindow.document.write(
    htmlDocument(safeFilename(topic), reportMarkup(report)),
  );
  printWindow.document.close();
  printWindow.focus();
  window.setTimeout(() => printWindow.print(), 300);
}

export async function downloadWord(topic, report) {
  const [{ Lexer }, docx] = await Promise.all([
    import("marked"),
    import("docx"),
  ]);
  const {
    AlignmentType,
    BorderStyle,
    Document,
    ExternalHyperlink,
    HeadingLevel,
    Packer,
    Paragraph,
    ShadingType,
    Table,
    TableCell,
    TableRow,
    TextRun,
    WidthType,
  } = docx;

  const renderInline = (tokens = [], style = {}) =>
    tokens.flatMap((token) => {
      if (token.type === "strong" || token.type === "em" || token.type === "del") {
        return renderInline(token.tokens, {
          ...style,
          bold: style.bold || token.type === "strong",
          italics: style.italics || token.type === "em",
          strike: style.strike || token.type === "del",
        });
      }

      if (token.type === "link") {
        return [
          new ExternalHyperlink({
            link: token.href,
            children: renderInline(token.tokens, { ...style, color: "9A4C13" }),
          }),
        ];
      }

      if (token.type === "br") {
        return [new TextRun({ break: 1 })];
      }

      if (token.type === "image") {
        return [new TextRun({ text: token.text, ...style })];
      }

      if (token.type === "codespan") {
        return [
          new TextRun({
            text: token.text,
            font: "Consolas",
            color: "9A4C13",
            ...style,
          }),
        ];
      }

      if (token.tokens) return renderInline(token.tokens, style);

      return token.text
        ? [new TextRun({ text: token.text, ...style })]
        : [];
    });

  const blocks = (tokens, listDepth = 0) =>
    tokens.flatMap((token) => {
      switch (token.type) {
        case "heading": {
          const heading = [
            HeadingLevel.HEADING_1,
            HeadingLevel.HEADING_2,
            HeadingLevel.HEADING_3,
            HeadingLevel.HEADING_4,
            HeadingLevel.HEADING_5,
            HeadingLevel.HEADING_6,
          ][token.depth - 1];
          return [
            new Paragraph({
              heading,
              children: renderInline(token.tokens),
              spacing: { before: 240, after: 120 },
              keepNext: true,
            }),
          ];
        }
        case "paragraph":
          return [
            new Paragraph({
              children: renderInline(token.tokens),
              spacing: { after: 180 },
            }),
          ];
        case "text":
          return [
            new Paragraph({
              children: renderInline(token.tokens || [{ text: token.text }]),
              spacing: { after: 180 },
            }),
          ];
        case "list":
          return token.items.flatMap((item, index) => {
            const content = item.tokens.filter((part) => part.type !== "list");
            const prefix = token.ordered ? `${index + 1}. ` : "• ";
            return [
              new Paragraph({
                children: [
                  new TextRun({ text: prefix }),
                  ...renderInline(content),
                ],
                indent: { left: 360 * (listDepth + 1) },
                spacing: { after: 80 },
              }),
              ...item.tokens
                .filter((part) => part.type === "list")
                .flatMap((nested) => blocks([nested], listDepth + 1)),
            ];
          });
        case "blockquote":
          return [
            new Paragraph({
              children: renderInline(Lexer.lexInline(token.text)),
              indent: { left: 360 },
              spacing: { after: 140 },
            }),
          ];
        case "code":
          return token.text.split("\n").map(
            (line) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: line || " ",
                    font: "Consolas",
                    size: 20,
                  }),
                ],
                shading: { type: ShadingType.CLEAR, fill: "F3F4F6" },
              }),
          );
        case "hr":
          return [
            new Paragraph({
              border: {
                bottom: {
                  color: "D1D5DB",
                  style: BorderStyle.SINGLE,
                  size: 4,
                  space: 6,
                },
              },
              spacing: { before: 120, after: 240 },
            }),
          ];
        case "table": {
          const rows = [token.header, ...token.rows].map(
            (cells, rowIndex) =>
              new TableRow({
                children: cells.map(
                  (cell) =>
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: renderInline(cell.tokens),
                          alignment:
                            cell.align === "center"
                              ? AlignmentType.CENTER
                              : cell.align === "right"
                                ? AlignmentType.RIGHT
                                : AlignmentType.LEFT,
                        }),
                      ],
                      ...(rowIndex === 0
                        ? {
                            shading: {
                              type: ShadingType.CLEAR,
                              fill: "F3F4F6",
                            },
                          }
                        : {}),
                    }),
                ),
              }),
          );
          return [
            new Table({
              rows,
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
                left: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
                right: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
                insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
              },
            }),
          ];
        }
        default:
          return [];
      }
    });

  const document = new Document({
    sections: [
      {
        properties: {},
        children: blocks(Lexer.lex(report)),
      },
    ],
  });
  const blob = await Packer.toBlob(document);
  downloadBlob(
    blob,
    `${safeFilename(topic)}.docx`,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  );
}

function downloadBlob(blob, filename, type = blob.type) {
  const url = URL.createObjectURL(new Blob([blob], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
