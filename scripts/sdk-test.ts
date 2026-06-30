import { Agent, CursorAgentError } from "@cursor/sdk";

async function main() {
  const apiKey = process.env.CURSOR_API_KEY;

  if (!apiKey) {
    console.error("Missing CURSOR_API_KEY. Set it and rerun.");
    process.exit(1);
  }

  try {
    const result = await Agent.prompt(
      "Reply with exactly: Cursor SDK test successful.",
      {
        apiKey,
        model: { id: "composer-2.5" },
        local: { cwd: process.cwd() },
      },
    );

    if (result.status === "error") {
      console.error(`Run failed: ${result.id}`);
      process.exit(2);
    }

    console.log("Status:", result.status);
    console.log("Result:", result.result ?? "(no text result)");
  } catch (error) {
    if (error instanceof CursorAgentError) {
      console.error(`Cursor SDK startup error: ${error.message}`);
      process.exit(3);
    }
    throw error;
  }
}

void main();
