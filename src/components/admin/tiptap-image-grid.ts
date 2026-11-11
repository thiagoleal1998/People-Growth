import { Node, mergeAttributes } from "@tiptap/core";

// 2 or 3 photos side by side — a container node whose content IS real
// "image" nodes (ImageWithCredit, see tiptap-image-with-credit.ts), not a
// separate flat data structure. That's deliberate: each photo in the grid
// gets the exact same node view as a normal inline image for free — the
// drag-to-resize handle, the "Legenda e créditos"/"Recortar" buttons — with
// zero duplicated UI. The node view below only renders the CSS-grid
// wrapper; ProseMirror renders the 2-3 child image nodes into it itself via
// `contentDOM`.
export interface ImageGridOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageGrid: {
      setImageGrid: (options: { cols: 2 | 3; images: { src: string; alt?: string | null }[] }) => ReturnType;
    };
  }
}

export const ImageGrid = Node.create<ImageGridOptions>({
  name: "imageGrid",
  group: "block",
  // Exactly 2 or 3 "image" children — matches the ":::grid-2"/":::grid-3"
  // markdown-lite fence, which only ever holds 2 or 3 photos (see the
  // matching comment in markdown-lite.ts for why: a column split wider
  // than 3 reads as cramped, and this is meant for a quick side-by-side
  // comparison, not a full gallery).
  content: "image{2,3}",
  draggable: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      cols: {
        default: 2,
        parseHTML: (element: HTMLElement) => Number(element.getAttribute("data-cols")) || 2,
        renderHTML: (attributes: { cols?: number }) => ({ "data-cols": String(attributes.cols ?? 2) }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "image-grid" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["image-grid", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setImageGrid:
        ({ cols, images }) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { cols },
            content: images.map((img) => ({ type: "image", attrs: { src: img.src, alt: img.alt || null } })),
          }),
    };
  },

  addNodeView() {
    return ({ node }) => {
      const wrapper = document.createElement("div");
      // Inline styles here (not the "article-img-grid-N" class the public
      // page's renderMarkdownLite output uses) — same reasoning as every
      // other custom node view in this editor (VideoGif, ImageWithCredit):
      // this DOM is the live Tiptap editor's own preview, a completely
      // separate rendering path from the public page's styled HTML string,
      // so it needs its own styling rather than depending on a stylesheet
      // that may not even be loaded wherever the editor is mounted.
      wrapper.style.cssText = `display:grid;gap:1rem;grid-template-columns:repeat(${node.attrs.cols as number},1fr);margin:1rem 0`;
      // Where ProseMirror renders this node's own children (the 2-3 image
      // nodes) — not a plain innerHTML slot, so their own node views
      // (drag handle, caption buttons) keep working inside it.
      return { dom: wrapper, contentDOM: wrapper };
    };
  },
});
