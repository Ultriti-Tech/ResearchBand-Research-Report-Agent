# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## ResearchMind application notes

The Home page loads the signed-in user's credit balance from
`GET /api/v1/users/getUser` and displays it in the navigation bar. Research
requests stream progress and a result through Server-Sent Events; the Home page
updates the displayed balance from the result event's `credits_balance` field.
Use the **History** navigation link to view saved reports, including their
title, short content preview, creation date, and critique. The history page
loads data from the authenticated `GET /api/v1/research/history` endpoint.
Selecting a report opens a dedicated detail route that loads its saved content
and sources and renders it with the same report viewer and report assistant as
the Home workspace.
See the repository [README](../README.md) for the credit rules and API overview.
