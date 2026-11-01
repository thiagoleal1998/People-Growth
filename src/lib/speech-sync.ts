// Read-along word highlighting for TextToSpeechButton.tsx — kept in its own
// module since the DOM-walking and alignment logic doesn't belong mixed
// into the player's own state machine.

export type WordTiming = { text: string; offsetMs: number; durationMs: number };
export type AlignedWord = { offsetMs: number; durationMs: number; span: HTMLElement };

// Builds one <span class="tts-word"> per word inside `container` (the
// rendered article body), skipping image/video captions (<figcaption>) and
// the blockquote attribution line (data-speech-skip, set in
// markdown-lite.ts) — neither is part of what stripMarkdownLite() actually
// sends to the TTS reader, so neither should ever end up highlighted.
// Returns the spans in document order, ready for alignWords() below.
export function buildWordSpans(container: HTMLElement): HTMLElement[] {
  function isSkipped(node: Node): boolean {
    let el: HTMLElement | null = node.parentElement;
    while (el && el !== container) {
      if (el.tagName === "FIGCAPTION" || el.hasAttribute("data-speech-skip")) return true;
      el = el.parentElement;
    }
    return false;
  }

  // Collected up front — mutating the tree while the TreeWalker is still
  // traversing it is unreliable across browsers.
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.nodeValue?.trim() && !isSkipped(node)) textNodes.push(node as Text);
  }

  const spans: HTMLElement[] = [];
  for (const textNode of textNodes) {
    const pieces = textNode.nodeValue!.split(/(\s+)/);
    const fragment = document.createDocumentFragment();
    for (const piece of pieces) {
      if (!piece) continue;
      if (/^\s+$/.test(piece)) {
        // Whitespace stays as a plain text node — only words need to be
        // individually addressable.
        fragment.appendChild(document.createTextNode(piece));
        continue;
      }
      const span = document.createElement("span");
      span.className = "tts-word";
      span.textContent = piece;
      fragment.appendChild(span);
      spans.push(span);
    }
    textNode.parentNode?.replaceChild(fragment, textNode);
  }
  return spans;
}

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

// Aligns the TTS service's own word list against the DOM word spans from
// buildWordSpans(). Deliberately not a straight index-to-index mapping — the
// service's own tokenization (numbers, hyphens, punctuation) isn't
// guaranteed to match ours word-for-word, and a straight mapping would let
// any single mismatch drift the highlight further out of sync for the rest
// of the article. Instead this walks a cursor forward through domSpans and,
// for each TTS word, searches a short lookahead window for a text match; an
// unmatched word is just skipped and the next one still re-syncs.
export function alignWords(ttsWords: WordTiming[], domSpans: HTMLElement[]): AlignedWord[] {
  const LOOKAHEAD = 8;
  // A handful of misses in a row is normal (a date read out as several
  // spoken words against one DOM token — "1984" vs. "mil novecentos e
  // oitenta e quatro" — or a hyphenated/linked word tokenized differently).
  // But once that many land back to back, the narrow window alone can never
  // recover: it's anchored at a cursor that's stuck before a genuinely
  // bigger gap (several consecutive mismatched words, or a whole synthesis
  // chunk whose metadata never arrived — see /api/tts's best-effort
  // metadata draining). Without this, the highlight would freeze on its
  // last successful match for the rest of the article while the audio kept
  // playing normally — seen on a real article. Escalating to a much wider
  // forward search only in that case keeps the common path cheap while
  // still guaranteeing recovery.
  const RESYNC_AFTER_MISSES = 3;
  const RESYNC_WINDOW = 400;

  function findMatch(target: string, cursor: number, window: number): number {
    const end = Math.min(domSpans.length, cursor + window);
    for (let i = cursor; i < end; i++) {
      if (normalize(domSpans[i].textContent ?? "") === target) return i;
    }
    return -1;
  }

  const aligned: AlignedWord[] = [];
  let cursor = 0;
  let misses = 0;
  for (const word of ttsWords) {
    const target = normalize(word.text);
    if (!target) continue;
    let matchIndex = findMatch(target, cursor, LOOKAHEAD);
    if (matchIndex === -1 && misses >= RESYNC_AFTER_MISSES) {
      matchIndex = findMatch(target, cursor, RESYNC_WINDOW);
    }
    if (matchIndex === -1) {
      misses++;
      continue;
    }
    misses = 0;
    aligned.push({ offsetMs: word.offsetMs, durationMs: word.durationMs, span: domSpans[matchIndex] });
    cursor = matchIndex + 1;
  }
  return aligned;
}

// How long past the end of the trailing aligned word a frozen highlight is
// still shown before it's cleared instead. Covers a genuine untranscribable
// tail (a sources section that's mostly bare URLs, nothing left to align)
// without leaving the highlight visibly stuck on a stale word indefinitely.
const STALE_AFTER_MS = 5000;

// Last aligned word whose offset has already passed — the one currently
// being spoken. `aligned` is already offset-sorted (ttsWords arrives in
// speech order), so this is a binary search rather than a linear scan.
export function findActiveWord(aligned: AlignedWord[], nowMs: number): AlignedWord | null {
  if (aligned.length === 0 || nowMs < aligned[0].offsetMs) return null;
  let lo = 0;
  let hi = aligned.length - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2);
    if (aligned[mid].offsetMs <= nowMs) lo = mid;
    else hi = mid - 1;
  }
  const match = aligned[lo];
  if (lo === aligned.length - 1 && nowMs - (match.offsetMs + match.durationMs) > STALE_AFTER_MS) return null;
  return match;
}
