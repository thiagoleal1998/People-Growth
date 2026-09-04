"use client";

import { useState } from "react";
import { Linkedin, Instagram, Award } from "lucide-react";
import { Field, Input, Textarea, SubmitButton } from "@/components/admin/ui";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { parseMilestones } from "@/lib/founder-data";
import { updateOwnAuthorProfile } from "./actions";
import type { Author } from "@/types/database.types";

export function MeuPerfilForm({ author, photoError }: { author: Author | null; photoError?: string }) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(author?.photo_url ?? null);
  const [taglinePt, setTaglinePt] = useState(author?.tagline_pt ?? "");
  const [bioPt, setBioPt] = useState(author?.bio_pt ?? "");
  const [milestonesPt, setMilestonesPt] = useState(author?.milestones_pt ?? "");
  const taglineRemaining = 80 - taglinePt.length;
  const milestones = parseMilestones(milestonesPt);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }} className="perfil-grid">
      <form action={updateOwnAuthorProfile} style={{ backgroundColor: "white", borderRadius: "1rem", border: "1px solid #eef1f4", padding: "1.75rem" }}>
        <Field label="Foto" hint="PNG, JPG, WEBP ou GIF, até 5MB. É a foto usada na tira de colunistas da home e na sua página de perfil.">
          {photoPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoPreview}
              alt="Foto atual"
              style={{ width: "4rem", height: "4rem", borderRadius: "50%", objectFit: "cover", display: "block", marginBottom: "0.625rem" }}
            />
          )}
          <input className="admin-file-input" type="file" name="photo_file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handlePhotoChange} />
          <ErrorBanner message={photoError} />
        </Field>

        <Field
          label="Frase de destaque (PT)"
          hint={`Aparece na home, embaixo do seu nome na tira de colunistas — substitui o cargo ali. Ex: "Estratégia, dados e IA para negócios que querem crescer de verdade". ${taglineRemaining} caractere${taglineRemaining === 1 ? "" : "s"} restante${taglineRemaining === 1 ? "" : "s"}.`}
        >
          <Textarea
            name="tagline_pt"
            rows={2}
            maxLength={80}
            value={taglinePt}
            onChange={(e) => setTaglinePt(e.target.value)}
          />
        </Field>
        <Field label="Frase de destaque (EN)" hint="Mesma ideia, em inglês. Deixe em branco se o site em inglês puder repetir a frase em português.">
          <Textarea name="tagline_en" rows={2} maxLength={80} defaultValue={author?.tagline_en ?? ""} />
        </Field>

        <Field
          label="Bio (PT)"
          hint='Um parágrafo maior sobre você, exibido na sua página "Sobre" completa. Ex: "Empreendedor e especialista em growth, ajudo empresas a crescerem com dados e tecnologia há mais de 10 anos."'
        >
          <Textarea name="bio_pt" rows={5} value={bioPt} onChange={(e) => setBioPt(e.target.value)} />
        </Field>
        <Field label="Bio (EN)" hint="Mesmo texto, em inglês.">
          <Textarea name="bio_en" rows={5} defaultValue={author?.bio_en ?? ""} />
        </Field>

        <Field
          label="Trajetória / Marcos (PT)"
          hint='Aparece como uma linha do tempo na sua página "Sobre". Um marco por linha, no formato "Ano | Descrição". Ex: "2019 | Comecei minha carreira em marketing digital" — cada linha vira um item da linha do tempo.'
        >
          <Textarea name="milestones_pt" rows={4} value={milestonesPt} onChange={(e) => setMilestonesPt(e.target.value)} placeholder={"2019 | Comecei minha carreira em marketing digital\n2024 | Entrei para a People & Growth"} />
        </Field>
        <Field label="Trajetória / Marcos (EN)" hint='Mesmo formato: "Year | Description", uma por linha.'>
          <Textarea name="milestones_en" rows={4} defaultValue={author?.milestones_en ?? ""} />
        </Field>

        <Field label="LinkedIn (URL)" hint="Link completo do seu perfil.">
          <Input name="linkedin_url" defaultValue={author?.linkedin_url ?? ""} placeholder="https://linkedin.com/in/seu-usuario" />
        </Field>
        <Field label="Instagram (URL)" hint="Link completo do seu perfil.">
          <Input name="instagram_url" defaultValue={author?.instagram_url ?? ""} placeholder="https://instagram.com/seu-usuario" />
        </Field>

        <SubmitButton>Salvar alterações</SubmitButton>
      </form>

      <div style={{ position: "sticky", top: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ backgroundColor: "#f8fafc", borderRadius: "1rem", border: "1px solid #eef1f4", padding: "1.25rem" }}>
          <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.875rem" }}>
            Prévia — tira de colunistas (home)
          </p>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
            <div
              style={{
                width: "3.5rem",
                height: "3.5rem",
                borderRadius: "0.375rem",
                flexShrink: 0,
                background: photoPreview ? `url(${photoPreview}) center/cover` : "linear-gradient(135deg, #4361EE, #06D6A0)",
              }}
            />
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.8125rem", color: "#4361EE", marginBottom: "0.25rem" }}>
                {author?.name ?? "Seu nome"}
              </div>
              <div style={{ color: "#475569", fontSize: "0.75rem", lineHeight: 1.35 }}>
                {taglinePt.trim() || "Sua frase de destaque aparece aqui"}
              </div>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: "#0d1b2a", borderRadius: "1rem", padding: "1.25rem" }}>
          <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.875rem" }}>
            Prévia — página &quot;Sobre&quot;
          </p>
          <div style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start", marginBottom: "0.875rem" }}>
            <div
              style={{
                width: "3rem",
                height: "3rem",
                borderRadius: "50%",
                flexShrink: 0,
                background: photoPreview ? `url(${photoPreview}) center/cover` : "linear-gradient(135deg, #4361EE, #06D6A0)",
              }}
            />
            <div style={{ color: "white", fontWeight: 800, fontSize: "0.9375rem", marginTop: "0.375rem" }}>
              {author?.name ?? "Seu nome"}
            </div>
          </div>
          {taglinePt.trim() && (
            <p style={{ color: "#06D6A0", fontSize: "0.8125rem", fontStyle: "italic", marginBottom: "0.75rem" }}>
              &ldquo;{taglinePt.trim()}&rdquo;
            </p>
          )}
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.8125rem", lineHeight: 1.6 }}>
            {bioPt.trim() || "Sua bio aparece aqui, contando sua trajetória para quem visita a página Sobre."}
          </p>
          <div style={{ display: "flex", gap: "0.625rem", marginTop: "0.875rem", marginBottom: milestones.length > 0 ? "1.125rem" : 0 }}>
            <Linkedin size={15} color="rgba(255,255,255,0.4)" />
            <Instagram size={15} color="rgba(255,255,255,0.4)" />
          </div>

          {milestones.length > 0 && (
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1rem" }}>
              <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
                Trajetória
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {milestones.map((m, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
                    <div
                      style={{
                        width: "1.5rem",
                        height: "1.5rem",
                        borderRadius: "50%",
                        backgroundColor: "#4361EE",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Award size={9} color="white" />
                    </div>
                    <div>
                      <div style={{ color: "white", fontWeight: 700, fontSize: "0.75rem" }}>{m.year}</div>
                      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", lineHeight: 1.4 }}>{m.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 780px) {
          .perfil-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
