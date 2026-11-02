// JSON.stringify never escapes "</", so a field value containing a literal
// "</script><script>..." breaks out of a <script type="application/ld+json">
// tag and runs as real script. < is valid inside a JSON string and
// browsers decode it before parsing, so this changes nothing about the
// resulting JSON-LD, only closes this injection path.
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
