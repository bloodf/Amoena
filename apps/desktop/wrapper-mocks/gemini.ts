const args = process.argv.slice(2);

if (args.includes("--version")) {
  console.log("gemini 0.9.0");
  process.exit(0);
}

const promptIndex = args.indexOf("--prompt");
const prompt = promptIndex >= 0 ? args[promptIndex + 1] ?? "" : "";

for (const token of prompt.split(/\s+/).filter(Boolean)) {
  console.log(JSON.stringify({ class: "message", text: token }));
}
console.log(JSON.stringify({ class: "result", text: prompt, promptTokens: prompt.length, completionTokens: prompt.split(/\s+/).filter(Boolean).length }));
