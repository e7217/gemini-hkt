// scripts/test-gemini.ts
import { callGemini } from "../lib/gemini";
import { z } from "zod";

// Load environment variables for local testing if needed
// In a real Next.js environment, this is handled automatically
// For a standalone script, we might need dotenv or similar
// But we'll assume the environment has it set or we'll pass it

const TestSchema = z.object({ message: z.string() });

async function main() {
  console.log("Starting Gemini SDK test...");
  try {
    const result = await callGemini({
      prompt: 'Respond with JSON: { "message": "hello from Gemini" }',
      schema: TestSchema,
    });
    console.log("✅ Success:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("❌ Test failed:");
    console.error(err);
    process.exit(1);
  }
}

main().catch(console.error);
