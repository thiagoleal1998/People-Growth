import { Mark, mergeAttributes } from "@tiptap/core";
import { HIGHLIGHT_CLASS } from "@/lib/markdown-lite";

// Brand-tinted highlighter for passages inside an article body. Stored as
// "==texto==" (see markdown-lite.ts), so the editor only needs to render and
// toggle it — the public output comes from the same HIGHLIGHT_STYLE constant.
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    brandHighlight: {
      toggleBrandHighlight: () => ReturnType;
    };
  }
}

export const BrandHighlight = Mark.create({
  name: "highlight",

  parseHTML() {
    return [{ tag: "mark" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["mark", mergeAttributes(HTMLAttributes, { class: HIGHLIGHT_CLASS }), 0];
  },

  addCommands() {
    return {
      toggleBrandHighlight:
        () =>
        ({ commands }) =>
          commands.toggleMark(this.name),
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-h": () => this.editor.commands.toggleBrandHighlight(),
    };
  },
});
