import Image from "@tiptap/extension-image";
import type { Editor } from "@tiptap/core";

// Credit/source live in data-credit/data-source rather than the image's
// native "title" attribute — a title attribute makes the browser pop its
// own unstyled hover tooltip over the photo, which is exactly the kind of
// native browser chrome this admin UI avoids everywhere else. The node
// view below renders them as a proper caption under the image instead,
// visible immediately rather than only on hover.
export interface ImageWithCreditOptions {
  onEditRequest?: (editor: Editor, pos: number, attrs: Record<string, unknown>) => void;
  onCropRequest?: (editor: Editor, pos: number, attrs: Record<string, unknown>) => void;
}

export const ImageWithCredit = Image.extend<ImageWithCreditOptions>({
  addOptions() {
    return { ...this.parent?.(), onEditRequest: undefined, onCropRequest: undefined };
  },

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
      widthPct: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const value = element.getAttribute("data-width-pct");
          return value ? Number(value) : null;
        },
        renderHTML: (attributes: { widthPct?: number | null }) =>
          attributes.widthPct ? { "data-width-pct": String(attributes.widthPct) } : {},
      },
    };
  },

  addNodeView() {
    const options = this.options;
    return ({ node, getPos, editor }) => {
      let current = node;
      const currentPos = () => getPos() ?? 0;

      const figure = document.createElement("figure");
      figure.style.margin = "1.5rem 0";

      const wrap = document.createElement("div");
      wrap.style.cssText = "position:relative;margin:0 auto";

      const img = document.createElement("img");
      img.style.cssText = "width:100%;border-radius:0.5rem;display:block";
      wrap.appendChild(img);

      // Only shown while the image is selected, so a column of photos reads
      // as plain text-flow until the author actually clicks one.
      const controls = document.createElement("div");
      controls.contentEditable = "false";
      controls.style.cssText = "display:none;position:absolute;top:0.5rem;right:0.5rem;gap:0.375rem;z-index:2";
      const buttonStyle =
        "padding:0.3125rem 0.625rem;border-radius:0.375rem;border:none;background-color:rgba(15,23,42,0.85);color:white;font-size:0.75rem;font-weight:700;cursor:pointer";
      const makeButton = (label: string, onClick: () => void) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = label;
        btn.style.cssText = buttonStyle;
        btn.addEventListener("mousedown", (e) => e.preventDefault());
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          onClick();
        });
        return btn;
      };
      controls.appendChild(
        makeButton("Legenda e créditos", () => options.onEditRequest?.(editor, currentPos(), current.attrs))
      );
      controls.appendChild(makeButton("Recortar", () => options.onCropRequest?.(editor, currentPos(), current.attrs)));
      wrap.appendChild(controls);

      const handle = document.createElement("div");
      handle.style.cssText =
        "display:none;position:absolute;right:-7px;bottom:-7px;width:14px;height:14px;border-radius:3px;background-color:#4361EE;border:2px solid white;cursor:nwse-resize;z-index:2;touch-action:none";
      wrap.appendChild(handle);

      figure.appendChild(wrap);

      const figcaption = document.createElement("figcaption");
      figcaption.style.cssText = "margin-top:0.5rem;font-size:0.8rem;color:var(--admin-muted);line-height:1.6";
      figure.appendChild(figcaption);

      function render(attrs: Record<string, unknown>) {
        img.src = (attrs.src as string) ?? "";
        const alt = (attrs.alt as string | null) ?? "";
        if (alt) img.alt = alt;
        wrap.style.width = `${(attrs.widthPct as number | null) ?? 100}%`;

        figcaption.textContent = "";
        const lines = [
          alt,
          attrs.credit ? `Créditos: ${attrs.credit}` : "",
          attrs.source ? `Fonte: ${attrs.source}` : "",
        ].filter(Boolean);
        figcaption.style.display = lines.length ? "block" : "none";
        for (const text of lines) {
          const line = document.createElement("div");
          line.textContent = text;
          figcaption.appendChild(line);
        }
      }
      render(node.attrs);

      handle.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        handle.setPointerCapture(e.pointerId);
        const containerW = figure.getBoundingClientRect().width;
        const startX = e.clientX;
        const startPct = (current.attrs.widthPct as number | null) ?? 100;
        let pct = startPct;

        const onMove = (ev: PointerEvent) => {
          pct = Math.min(100, Math.max(10, Math.round(startPct + ((ev.clientX - startX) / containerW) * 100)));
          wrap.style.width = `${pct}%`;
        };
        const onUp = () => {
          handle.removeEventListener("pointermove", onMove);
          handle.removeEventListener("pointerup", onUp);
          const pos = currentPos();
          const existing = editor.state.doc.nodeAt(pos);
          if (!existing) return;
          editor.view.dispatch(editor.state.tr.setNodeMarkup(pos, undefined, { ...existing.attrs, widthPct: pct }));
        };
        handle.addEventListener("pointermove", onMove);
        handle.addEventListener("pointerup", onUp);
      });

      return {
        dom: figure,
        update(updated) {
          if (updated.type.name !== "image") return false;
          current = updated;
          render(updated.attrs);
          return true;
        },
        selectNode() {
          controls.style.display = "flex";
          handle.style.display = "block";
          img.style.outline = "2px solid #4361EE";
        },
        deselectNode() {
          controls.style.display = "none";
          handle.style.display = "none";
          img.style.outline = "none";
        },
        // Our own DOM changes (width while dragging, caption text) must not
        // make ProseMirror re-parse the node — only selection changes flow through.
        ignoreMutation(mutation) {
          return mutation.type !== "selection";
        },
        stopEvent(event) {
          const target = event.target as Node | null;
          return Boolean(target && (controls.contains(target) || handle === target));
        },
      };
    };
  },
});
