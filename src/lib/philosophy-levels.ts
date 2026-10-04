export type PhilosophyLevel = { title: string; description: string };

// Reads the four levels out of the "O que é a People & Growth" text: each one
// is a "### N. Title" heading inside the levels section, and its description is
// the first paragraph under it. Returns nothing if the section can't be found,
// so the caller can fall back to the built-in wording.
export function extractPhilosophyLevels(body: string): PhilosophyLevel[] {
  const lines = body.replace(/\r\n?/g, "\n").split("\n");
  const sectionStart = lines.findIndex((line) => /^## .*(níveis|levels)/i.test(line));
  if (sectionStart < 0) return [];

  let sectionEnd = lines.length;
  for (let i = sectionStart + 1; i < lines.length; i++) {
    if (/^## /.test(lines[i])) {
      sectionEnd = i;
      break;
    }
  }

  const levels: PhilosophyLevel[] = [];
  for (let i = sectionStart + 1; i < sectionEnd; i++) {
    const heading = lines[i].match(/^### (.+)$/);
    if (!heading) continue;
    const title = heading[1].replace(/^\d+\.\s*/, "").replace(/\*\*/g, "").trim();

    let j = i + 1;
    while (j < sectionEnd && lines[j].trim() === "") j++;
    const paragraph: string[] = [];
    while (j < sectionEnd && lines[j].trim() !== "" && !/^(###? |- |> |\*\*)/.test(lines[j])) {
      paragraph.push(lines[j].trim());
      j++;
    }
    levels.push({ title, description: paragraph.join(" ").replace(/\*\*/g, "") });
  }
  return levels;
}
