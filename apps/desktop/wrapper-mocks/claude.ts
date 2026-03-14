const args = process.argv.slice(2);

if (args.includes("--version")) {
  console.log("claude-code 1.2.3");
  process.exit(0);
}

const promptIndex = args.indexOf("-p");
const prompt = promptIndex >= 0 ? args[promptIndex + 1] ?? "" : "";

if (prompt.startsWith("slow:")) {
  console.log(JSON.stringify({ type: "delta", text: "slow" }));
  await new Promise((resolve) => setTimeout(resolve, 250));
  console.log(JSON.stringify({ type: "usage", prompt_tokens: prompt.length, completion_tokens: 1 }));
  console.log(JSON.stringify({ type: "result", final_text: prompt.replace(/^slow:/, "").trim() }));
  process.exit(0);
}

if (prompt.startsWith("tool:")) {
  const payload = prompt.replace(/^tool:/, "");
  console.log(JSON.stringify({ type: "tool_call", id: "call-1", name: "echo", args: { text: payload } }));
  console.log(JSON.stringify({ type: "tool_result", id: "call-1", name: "echo", result: { text: payload } }));
  console.log(JSON.stringify({ type: "delta", text: "Tool" }));
  console.log(JSON.stringify({ type: "delta", text: "echo" }));
  console.log(JSON.stringify({ type: "delta", text: "returned:" }));
  console.log(JSON.stringify({ type: "delta", text: payload }));
  console.log(JSON.stringify({ type: "usage", prompt_tokens: prompt.length, completion_tokens: 4 }));
  console.log(JSON.stringify({ type: "result", final_text: `Tool echo returned: ${payload}` }));
  process.exit(0);
}

for (const token of prompt.split(/\s+/).filter(Boolean)) {
  console.log(JSON.stringify({ type: "delta", text: token }));
}
console.log(
  JSON.stringify({
    type: "usage",
    prompt_tokens: prompt.length,
    completion_tokens: prompt.split(/\s+/).filter(Boolean).length,
  }),
);
console.log(JSON.stringify({ type: "result", final_text: prompt }));
