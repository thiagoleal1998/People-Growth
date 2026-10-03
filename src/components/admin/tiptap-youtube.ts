import { Node, mergeAttributes } from "@tiptap/core";
import { getYouTubeThumbnail } from "@/lib/youtube";

// Lets an author paste a YouTube link directly into the body and get a
// clickable thumbnail right there in the flow of the article — the same
// click-to-play facade used for the homepage hero/featured video
// (VideoFacade.tsx) — instead of only being able to set one video for the
// whole article via the separate "Vídeo de capa" field.
export interface YoutubeEmbedOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    youtubeEmbed: {
      setYoutubeEmbed: (options: { url: string; caption?: string | null }) => ReturnType;
    };
  }
}

export const YoutubeEmbed = Node.create<YoutubeEmbedOptions>({
  name: "youtubeEmbed",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      url: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("data-url"),
        renderHTML: (attributes: { url?: string | null }) => (attributes.url ? { "data-url": attributes.url } : {}),
      },
      caption: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("data-caption"),
        renderHTML: (attributes: { caption?: string | null }) => (attributes.caption ? { "data-caption": attributes.caption } : {}),
      },
    };
  },

  parseHTML() {
    return [{ tag: "youtube-embed[data-url]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["youtube-embed", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addCommands() {
    return {
      setYoutubeEmbed:
        (options) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: options }),
    };
  },

  // Editor-only preview — a static thumbnail with a play icon, not an
  // actual iframe (no reason to load YouTube's player while just editing).
  addNodeView() {
    return ({ node }) => {
      const figure = document.createElement("figure");
      figure.style.margin = "1.5rem 0";

      const url = node.attrs.url as string | null;
      const thumbnail = url ? getYouTubeThumbnail(url) : null;

      const thumbWrap = document.createElement("div");
      thumbWrap.style.cssText =
        "position:relative;padding-top:56.25%;border-radius:0.5rem;overflow:hidden;background-color:#000" +
        (thumbnail ? `;background-image:url(${thumbnail});background-size:cover;background-position:center` : "");
      figure.appendChild(thumbWrap);

      const playBtn = document.createElement("div");
      playBtn.style.cssText =
        "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:3.25rem;height:3.25rem;border-radius:50%;background-color:rgba(67,97,238,0.9);display:flex;align-items:center;justify-content:center";
      playBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="white" style="margin-left:2px"><path d="M8 5v14l11-7z"/></svg>';
      thumbWrap.appendChild(playBtn);

      const caption = node.attrs.caption as string | null;
      if (caption) {
        const figcaption = document.createElement("figcaption");
        figcaption.style.cssText = "margin-top:0.5rem;font-size:0.8rem;color:var(--admin-muted);line-height:1.6";
        figcaption.textContent = caption;
        figure.appendChild(figcaption);
      }

      return { dom: figure };
    };
  },
});
