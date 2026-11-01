// Read-along word highlighting for TextToSpeechButton.tsx — kept in its own
// module since the DOM-walking and alignment logic doesn't belong mixed
// into the player's own state machine.

export type WordTiming = { text: string; offsetMs: number; durationMs: number };
export type AlignedWord = { offsetMs: number; span: HTMLElement };

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
  const LOOKAHEAD = 6;
  const aligned: AlignedWord[] = [];
  let cursor = 0;
  for (const word of ttsWords) {
    const target = normalize(word.text);
    if (!target) continue;
    let matchIndex = -1;
    for (let i = cursor; i < Math.min(domSpans.length, cursor + LOOKAHEAD); i++) {
      if (normalize(domSpans[i].textContent ?? "") === target) {
        matchIndex = i;
        break;
      }
    }
    if (matchIndex === -1) continue;
    aligned.push({ offsetMs: word.offsetMs, span: domSpans[matchIndex] });
    cursor = matchIndex + 1;
  }
  return aligned;
}

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
  return aligned[lo];
}
