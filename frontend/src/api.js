const BASE = import.meta.env.VITE_BASE_URL;
const getToken = () => localStorage.getItem("RHD_v1_dashed_t");

// ---------------------
// get current user details
export async function getUser() {
  try {
    const res = await fetch(`${BASE}/api/v1/users/getUser`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: data,
      };
    }

    return {
      ok: true,
      status: res.status,
      user: data.user,
      credits: data.credits,
    };
  } catch (error) {
    console.error("Get User Error:", error);

    return {
      ok: false,
      error: error.message,
    };
  }
}

// --------------------------
// get report history
export async function getReportHistory() {
  try {
    const res = await fetch(`${BASE}/api/v1/research/history`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: data,
      };
    }

    return {
      ok: true,
      status: res.status,
      reports: data,
    };
  } catch (error) {
    console.error("Get Report History Error:", error);
    return {
      ok: false,
      error: error.message,
    };
  }
}

export async function getReportHistoryItem(reportId) {
  try {
    const res = await fetch(
      `${BASE}/api/v1/research/history/${encodeURIComponent(reportId)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await res.json();
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: data,
      };
    }

    return {
      ok: true,
      status: res.status,
      report: data,
    };
  } catch (error) {
    console.error("Get Report History Item Error:", error);
    return {
      ok: false,
      error: error.message,
    };
  }
}

export async function runResearch(
  topic,
  reportFormat = "",
  onEvent,
  setCredits,
) {
  try {
    const res = await fetch(`${BASE}/api/v1/research/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
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

          if (event.type === "credits") {
            console.log("credit balance : ", event.balance);
            console.log("reserved baance : ", event.reserved_credits);
            setCredits(event.balance);
          }
          onEvent?.(event);
        }
      }
    }

    return res
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
      Authorization: `Bearer ${getToken()}`,
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
      Authorization: `Bearer ${getToken()}`,
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
