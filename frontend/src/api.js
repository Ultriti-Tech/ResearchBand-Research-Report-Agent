const BASE = import.meta.env.VITE_BASE_URL;
const token = localStorage.getItem("RHD_v1_dashed_t");


export async function runResearch(topic, reportFormat = "", onEvent) {

  try {

    const res = await fetch(`${BASE}/api/v1/research/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        topic,
        reportFormat:
          reportFormat ||
          "- Introduction - Key Findings (minimum 3 well-explained points) - Conclusion",
      }),
    });


    if (!res.ok || !res.body) {
      const error = await res.text();
      console.error("Research API error:", res.status, error);
      const retryAfter = res.headers.get("Retry-After");

      return {
        ok: false,
        status: res.status,
        error,
        data: res,
        retryafter: retryAfter,
      };
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const parts = buffer.split("\n\n");
      buffer = parts.pop();

      for (const part of parts) {
        if (part.startsWith("data: ")) {
          const event = JSON.parse(part.slice(6));
          console.log("SSE event:", event);
          onEvent?.(event);
        }
      }
    }

    return res;
  } catch (error) {
    console.error("Research fetch failed:", error);
    throw error;
  }
}

// -------------------------- Report Editing Agent ----------------------
export async function suggestReportEdit(instruction, report) {
  const res = await fetch(`${BASE}/api/v1/chatagent/editchat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      code: report,
      instruction,
      file_name: "research-report.md",
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail || `Edit request failed (${res.status})`);
  }

  const proposal = await res.json();
  if (
    proposal.success &&
    (typeof proposal.updated_code !== "string" ||
      !Array.isArray(proposal.changes))
  ) {
    throw new Error("The edit response did not include a valid report update.");
  }
  return proposal;
}


// -------------------------- Report Info Agent -----------------------
export async function suggestReportInfo(topic, report, messages = []) {
  const payload = {
    topic,
    report,
    messages: messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  };

  const res = await fetch(`${BASE}/api/v1/chatagent/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(
      body?.detail || `Report chat request failed (${res.status})`,
    );
  }

  const answer = await res.json();
  if (typeof answer.answer !== "string") {
    throw new Error("The report chat response did not include an answer.");
  }
  return answer;
}
