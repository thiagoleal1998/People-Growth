import Image from "@tiptap/extension-image";

// Credit/source live in data-credit/data-source rather than the image's
// native "title" attribute — a title attribute makes the browser pop its
// own unstyled hover tooltip over the photo, which is exactly the kind of
// native browser chrome this admin UI avoids everywhere else. The node
// view below renders them as a proper caption under the image instead,
// visible immediately rather than only on hover.
export const ImageWithCredit = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      credit: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("data-credit"),
        renderHTML: (attributes: { credit?: string | null }) =>
          attributes.credit ? { "data-credit": attributes.credit } : {},
      },
      source: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("data-source"),
        renderHTML: (attributes: { source?: string | null }) =>
          attributes.source ? { "data-source": attributes.source } : {},
      },
    };
  },

  addNodeView() {
    return ({ node }) => {
      const figure = document.createElement("figure");
      figure.style.margin = "1.5rem 0";

      const img = document.createElement("img");
      img.src = node.attrs.src;
      if (node.attrs.alt) img.alt = node.attrs.alt;
      img.style.cssText = "width:100%;border-radius:0.5rem;display:block";
      figure.appendChild(img);

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
