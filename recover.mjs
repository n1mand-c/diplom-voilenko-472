
import fs from "fs";
const logFile = "C:/Users/ihave/.gemini/antigravity/brain/24e162b5-19af-4276-a684-564a369fee5a/.system_generated/logs/overview.txt";
const logText = fs.readFileSync(logFile, "utf-8");
const lines = logText.split("\n").filter(l => l.trim().length > 0);

const files = {}; // absolutePath -> content

for (const line of lines) {
    try {
        const entry = JSON.parse(line);
        if (entry.tool_calls) {
            for (const call of entry.tool_calls) {
                if (call.name === "write_to_file" || call.name === "replace_file_content" || call.name === "multi_replace_file_content") {
                    const args = typeof call.arguments === "string" ? JSON.parse(call.arguments) : call.arguments;
                    if (args.TargetFile) {
                        let f = args.TargetFile.replace(/\\/g, "/").toLowerCase();
                        if (!files[f]) {
                            // Try to read the base file from current disk (before we modify it in replay)
                            // But actually, we don`t need full replay if we just want to see what we wrote.
                            // If it`s write_to_file, we get full content.
                            // If it`s replace_file_content, we can`t easily replay without the original base.
                        }
                    }
                }
            }
        }
    } catch (e) {}
}

