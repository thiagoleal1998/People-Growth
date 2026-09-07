import { Node, mergeAttributes } from "@tiptap/core";

// Some "gif" links (common on news CDNs like Globo's) are actually served
// as a silent looping video, not a real image — the file extension says
// ".gif" but the server responds with Content-Type: video/mp4, which an
// <img> tag simply cannot display (broken image icon, no error). This node
// renders those as an autoplaying, looped, muted <video> instead — visually
// identical to a real gif — inserted via its own toolbar button so the
// choice is explicit rather than guessed from the URL/extension (which is
// exactly what's unreliable here).
export interface VideoGifOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    videoGif: {
      setVideoGif: (options: { src: string; alt?: string | null; credit?: string | null; source?: string | null }) => ReturnType;
    };
  }
}

export const VideoGif = Node.create<VideoGifOptions>({
  name: "videoGif",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      src: { default: null },
      alt: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("alt"),
        renderHTML: (attributes: { alt?: string | null }) => (attributes.alt ? { alt: attributes.alt } : {}),
      },
      credit: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("data-credit"),
        renderHTML: (attributes: { credit?: string | null }) => (attributes.credit ? { "data-credit": attributes.credit } : {}),
      },
      source: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("data-source"),
        renderHTML: (attributes: { source?: string | null }) => (attributes.source ? { "data-source": attributes.source } : {}),
      },
    };
  },

  parseHTML() {
    return [{ tag: "video[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["video", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addCommands() {
    return {
      setVideoGif:
        (options) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: options }),
    };
  },

  addNodeView() {
    return ({ node }) => {
      const figure = document.createElement("figure");
      figure.style.margin = "1.5rem 0";

      const video = document.createElement("video");
      video.src = node.attrs.src;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.style.cssText = "width:100%;border-radius:0.5rem;display:block";
      figure.appendChild(video);

      const alt = node.attrs.alt as string | null;
      const credit = node.attrs.credit as string | null;
      const source = node.attrs.source as string | null;
      if (alt || credit || source) {
        const figcaption = document.createElement("figcaption");
        figcaption.style.cssText = "margin-top:0.5rem;font-size:0.8rem;color:var(--admin-muted);line-height:1.6";
        if (alt) {
          const line = document.createElement("div");
          line.textContent = alt;
          figcaption.appendChild(line);
        }
        if (credit) {
          const line = document.createElement("div");
          line.textContent = `Créditos: ${credit}`;
          figcaption.appendChild(line);
        }
        if (source) {
          const line = document.createElement("div");
          line.textContent = `Fonte: ${source}`;
          figcaption.appendChild(line);
        }
        figure.appendChild(figcaption);
      }

      return { dom: figure };
    };
  },
});
