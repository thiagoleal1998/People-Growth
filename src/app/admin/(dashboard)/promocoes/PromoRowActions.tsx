"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Edit, Copy, Check, CheckCircle2, Circle } from "lucide-react";
import { ConfirmDeleteButton } from "@/components/admin/ui";
import { buildWhatsAppPromoText } from "@/lib/whatsapp-promo";
import { deletePromo, toggleSent } from "./actions";
import type { Promo } from "@/types/database.types";

export function PromoRowActions({ promo }: { promo: Promo }) {
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  async function copy() {
    const text = buildWhatsAppPromoText({
      productName: promo.product_name,
      oldPrice: promo.old_price,
      newPrice: promo.new_price,
      pixPrice: promo.pix_price,
      paymentTerms: promo.payment_terms,
      couponCode: promo.coupon_code,
      sizesAvailable: promo.sizes_available,
      productLink: promo.product_link,
      affiliateLink: promo.affiliate_link,
      introEmoji: promo.intro_emoji,
      introText: promo.intro_text,
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable, no-op */
    }
  }

  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <button
        onClick={copy}
        style={{ padding: "0.375rem", color: copied ? "#04a87d" : "var(--admin-muted)", background: "none", border: "none", cursor: "pointer", borderRadius: "0.375rem" }}
        title="Copiar texto"
      >
        {copied ? <Check size={15} /> : <Copy size={15} />}
      </button>
      <Link href={`/admin/promocoes/${promo.id}`} style={{ padding: "0.375rem", color: "#4361EE", borderRadius: "0.375rem" }} title="Editar">
        <Edit size={15} />
      </Link>
      <button
        onClick={() => startTransition(() => toggleSent(promo.id, !promo.sent_at))}
        disabled={pending}
        style={{ padding: "0.375rem", color: promo.sent_at ? "#04a87d" : "var(--admin-faint)", background: "none", border: "none", cursor: pending ? "default" : "pointer", borderRadius: "0.375rem", opacity: pending ? 0.5 : 1 }}
        title={promo.sent_at ? "Marcar como não enviada" : "Marcar como enviada"}
      >
        {promo.sent_at ? <CheckCircle2 size={15} /> : <Circle size={15} />}
      </button>
      <ConfirmDeleteButton confirmText={`Excluir a promoção "${promo.product_name}"?`} onDelete={deletePromo.bind(null, promo.id)} />
    </div>
  );
}
