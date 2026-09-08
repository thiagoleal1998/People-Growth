"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";
import { Field, Input, Textarea, SubmitButton } from "@/components/admin/ui";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { WhatsAppPromoPreview } from "@/components/admin/WhatsAppPromoPreview";
import { buildWhatsAppPromoText } from "@/lib/whatsapp-promo";
import { upsertPromo } from "./actions";
import type { Promo } from "@/types/database.types";

function CopyPromoTextButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable, no-op */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        backgroundColor: copied ? "rgba(6,214,160,0.12)" : "var(--admin-surface-alt)",
        color: copied ? "#04a87d" : "var(--admin-text)",
        border: "1px solid var(--admin-border-strong)",
        padding: "0.625rem 1.125rem",
        borderRadius: "0.625rem",
        fontWeight: 700,
        fontSize: "0.875rem",
        cursor: "pointer",
      }}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? "Copiado!" : "Copiar texto"}
    </button>
  );
}

export function PromoForm({ item, imageError }: { item?: Promo; imageError?: string }) {
  const action = upsertPromo.bind(null, item?.id ?? null);

  const [productName, setProductName] = useState(item?.product_name ?? "");
  const [oldPrice, setOldPrice] = useState(item?.old_price != null ? String(item.old_price) : "");
  const [newPrice, setNewPrice] = useState(item?.new_price != null ? String(item.new_price) : "");
  const [pixPrice, setPixPrice] = useState(item?.pix_price != null ? String(item.pix_price) : "");
  const [paymentTerms, setPaymentTerms] = useState(item?.payment_terms ?? "");
  const [couponCode, setCouponCode] = useState(item?.coupon_code ?? "");
  const [sizesAvailable, setSizesAvailable] = useState(item?.sizes_available ?? "");
  const [productLink, setProductLink] = useState(item?.product_link ?? "");
  const [affiliateLink, setAffiliateLink] = useState(item?.affiliate_link ?? "");
  const [introEmoji, setIntroEmoji] = useState(item?.intro_emoji ?? "");
  const [introText, setIntroText] = useState(item?.intro_text ?? "");
  const [imagePreview, setImagePreview] = useState<string | null>(item?.image_url ?? null);

  const previewText = useMemo(
    () =>
      buildWhatsAppPromoText({
        productName: productName || "Nome do produto",
        oldPrice: oldPrice ? Number(oldPrice) : null,
        newPrice: newPrice ? Number(newPrice) : 0,
        pixPrice: pixPrice ? Number(pixPrice) : null,
        paymentTerms: paymentTerms || null,
        couponCode: couponCode || null,
        sizesAvailable: sizesAvailable || null,
        productLink: productLink || "https://...",
        affiliateLink: affiliateLink || null,
        introEmoji: introEmoji || null,
        introText: introText || null,
      }),
    [productName, oldPrice, newPrice, pixPrice, paymentTerms, couponCode, sizesAvailable, productLink, affiliateLink, introEmoji, introText]
  );

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setImagePreview(URL.createObjectURL(file));
  }

  return (
    <div style={{ maxWidth: "1100px" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/admin/promocoes" style={{ color: "var(--admin-muted)", fontSize: "0.875rem", textDecoration: "none" }}>
          &larr; Voltar
        </Link>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--admin-text)", marginTop: "0.5rem" }}>
          {item ? "Editar promoção" : "Nova promoção"}
        </h1>
        {item?.source === "mercado_livre" && (
          <p style={{ fontSize: "0.8125rem", color: "var(--admin-faint)", marginTop: "0.25rem" }}>
            Encontrada automaticamente no Mercado Livre — complete PIX, cupom, tamanhos e link de afiliado antes de copiar.
          </p>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "1.5rem", alignItems: "start" }} className="promo-form-grid">
        <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", padding: "1.75rem" }}>
          <form action={action}>
            <Field label="Nome do produto">
              <Input name="product_name" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Ex: Nike Precision 8 Low" required />
            </Field>

            <Field label="Imagem do produto" hint="PNG, JPG ou WEBP.">
              {imagePreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreview}
                  alt="Prévia"
                  style={{ maxHeight: "8rem", display: "block", marginBottom: "0.625rem", borderRadius: "0.375rem", border: "1px solid var(--admin-border)" }}
                />
              )}
              <input className="admin-file-input" type="file" name="image_file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} />
              {item?.image_url && (
                <div style={{ marginTop: "0.5rem" }}>
                  <a href={item.image_url} download target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.8125rem", color: "#4361EE", fontWeight: 600 }}>
                    Baixar imagem atual
                  </a>
                </div>
              )}
              <ErrorBanner message={imageError} />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1.5rem" }}>
              <Field label="Preço antigo (R$)" hint="Opcional — deixe em branco se não houver desconto.">
                <Input name="old_price" type="number" step="0.01" min="0" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} />
              </Field>
              <Field label="Preço novo (R$)">
                <Input name="new_price" type="number" step="0.01" min="0" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} required />
              </Field>
            </div>

            <Field label="Preço no PIX (R$)" hint="Opcional.">
              <Input name="pix_price" type="number" step="0.01" min="0" value={pixPrice} onChange={(e) => setPixPrice(e.target.value)} />
            </Field>

            <Field label="Condições de pagamento" hint='Texto livre, ex: "7x de R$ 74,28 sem juros".'>
              <Input name="payment_terms" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
            </Field>

            <Field label="Cupom" hint="Opcional.">
              <Input name="coupon_code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
            </Field>

            <Field label="Tamanhos disponíveis" hint='Opcional, ex: "38 ao 43".'>
              <Input name="sizes_available" value={sizesAvailable} onChange={(e) => setSizesAvailable(e.target.value)} />
            </Field>

            <Field label="Link do produto">
              <Input name="product_link" value={productLink} onChange={(e) => setProductLink(e.target.value)} placeholder="https://..." required />
            </Field>

            <Field
              label="Link de afiliado"
              hint="Opcional — cole aqui o link gerado nas ferramentas de afiliado do Mercado Livre (painel, extensão ou bot). O Mercado Livre não tem API para gerar isso automaticamente. Se preenchido, substitui o link comum no texto final."
            >
              <Input name="affiliate_link" value={affiliateLink} onChange={(e) => setAffiliateLink(e.target.value)} placeholder="https://mercadolivre.com/sec/..." />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "5rem 1fr", gap: "0 1.5rem" }}>
              <Field label="Emoji" hint="Padrão: 🔥">
                <Input name="intro_emoji" value={introEmoji} onChange={(e) => setIntroEmoji(e.target.value)} />
              </Field>
              <Field label="Chamada" hint='Padrão: "PROMOÇÃO"'>
                <Input name="intro_text" value={introText} onChange={(e) => setIntroText(e.target.value)} placeholder="Ex: CAIU O PREÇO" />
              </Field>
            </div>

            <SubmitButton>{item ? "Salvar alterações" : "Criar promoção"}</SubmitButton>
          </form>
        </div>

        <div style={{ position: "sticky", top: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <WhatsAppPromoPreview text={previewText} imageUrl={imagePreview} />
          <CopyPromoTextButton text={previewText} />
          <Textarea readOnly value={previewText} rows={10} style={{ fontFamily: "monospace", fontSize: "0.8125rem" }} />
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .promo-form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
