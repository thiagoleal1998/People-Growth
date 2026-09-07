import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";

// Lets the author's edit form show, directly inside the content they're
// editing, exactly which passage an admin flagged when requesting changes —
// not just the quoted excerpt sitting in a sidebar card disconnected from
// its actual location in a (possibly long) article. Pure decorations: never
// touches the document, so it can't affect what gets saved.
export interface HighlightQuotesOptions {
  quotes: string[];
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    highlightQuotes: {
      setHighlightQuotes: (quotes: string[]) => ReturnType;
    };
  }
}

const key = new PluginKey("highlightQuotes");

type PluginState = { quotes: string[]; decorations: DecorationSet };

// Flattens the doc into one plain-text string (one "\n" marker per
// text-bearing block, so a quote can't accidentally match across a
// paragraph break) with a parallel array mapping each string index back to
// its document position, then does plain indexOf() per quote. The admin's
// own selection is always taken from a single rendered block already (a
// cross-paragraph pick fails to surround there too — see ArticleReview.tsx)
// so quotes should always resolve to a single contiguous run here.
function buildDecorations(doc: ProseMirrorNode, quotes: string[]): DecorationSet {
  let text = "";
  const posMap: number[] = [];
  doc.descendants((node, pos) => {
    if (node.isText) {
      const nodeText = node.text ?? "";
      for (let i = 0; i < nodeText.length; i++) posMap.push(pos + i);
      text += nodeText;
    } else if (node.isTextblock) {
      text += "\n";
      posMap.push(-1);
    }
  });

  const decorations: Decoration[] = [];
  for (const quote of quotes) {
    const trimmed = quote.trim();
    if (!trimmed) continue;
    const idx = text.indexOf(trimmed);
    if (idx === -1) continue; // content was edited since the feedback was left — nothing to point at anymore
    const from = posMap[idx];
    const to = posMap[idx + trimmed.length - 1];
    if (from == null || to == null || from < 0 || to < 0) continue;
    decorations.push(
      Decoration.inline(from, to + 1, {
        style: "background-color: rgba(255,183,3,0.45); border-radius: 0.15rem;",
      })
    );
  }
  return DecorationSet.create(doc, decorations);
}

export const HighlightQuotes = Extension.create<HighlightQuotesOptions>({
  name: "highlightQuotes",

  addOptions() {
    return { quotes: [] };
  },

  addProseMirrorPlugins() {
    const initialQuotes = this.options.quotes;
    return [
      new Plugin<PluginState>({
        key,
        state: {
          init: (_, state) => ({ quotes: initialQuotes, decorations: buildDecorations(state.doc, initialQuotes) }),
          apply(tr, prev) {
            const meta = tr.getMeta(key) as { quotes: string[] } | undefined;
            if (meta) return { quotes: meta.quotes, decorations: buildDecorations(tr.doc, meta.quotes) };
            if (tr.docChanged) return { quotes: prev.quotes, decorations: buildDecorations(tr.doc, prev.quotes) };
            return prev;
          },
        },
        props: {
          decorations(state) {
            return key.getState(state)?.decorations;
          },
        },
      }),
    ];
  },

  addCommands() {
    return {
      setHighlightQuotes:
        (quotes: string[]) =>
        ({ tr, dispatch }) => {
          if (dispatch) dispatch(tr.setMeta(key, { quotes }));
          return true;
        },
    };
  },
});
