const args = process.argv.slice(2);

if (args.includes("--version")) {
  console.log("opencode 0.9.0");
  process.exit(0);
}

const promptIndex = args.indexOf("--prompt");
const prompt = promptIndex >= 0 ? args[promptIndex + 1] ?? "" : "";

for (const token of prompt.split(/\s+/).filter(Boolean)) {
  console.log(JSON.stringify({ type: "delta", text: token }));
}
console.log(JSON.stringify({ type: "usage", inputTokens: prompt.length, outputTokens: prompt.split(/\s+/).filter(Boolean).length }));
console.log(JSON.stringify({ type: "result", finalText: prompt }));
