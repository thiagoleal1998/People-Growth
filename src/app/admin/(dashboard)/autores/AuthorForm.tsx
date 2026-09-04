"use client";

import { useState } from "react";
import Link from "next/link";
import { Field, Input, Textarea, Select, SubmitButton, FieldGrid } from "@/components/admin/ui";
import { upsertAuthor } from "./actions";
import type { Author } from "@/types/database.types";

const TAGLINE_MAX = 80;

function TaglineField({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  const remaining = TAGLINE_MAX - value.length;

  return (
    <Field
      label={label}
      hint={`Aparece na tira de colunistas, no lugar do cargo. ${remaining} caractere${remaining === 1 ? "" : "s"} restante${remaining === 1 ? "" : "s"}.`}
    >
      <Textarea
        name={name}
        rows={2}
        maxLength={TAGLINE_MAX}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ borderColor: remaining < 0 ? "#ef4444" : undefined }}
      />
    </Field>
  );
}

const tabs = [
  { id: "perfil", label: "Perfil" },
  { id: "bio", label: "Bio & Trajetória" },
  { id: "contato", label: "Contato & redes" },
  { id: "config", label: "Configurações" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function AuthorForm({ item }: { item?: Author }) {
  const action = upsertAuthor.bind(null, item?.id ?? null);
  const [active, setActive] = useState<TabId>("perfil");

  return (
    <div style={{ maxWidth: "900px" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/admin/autores" style={{ color: "var(--admin-muted)", fontSize: "0.875rem", textDecoration: "none" }}>
          &larr; Voltar
        </Link>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--admin-text)", marginTop: "0.5rem" }}>
          {item ? "Editar autor" : "Novo autor"}
        </h1>
      </div>

      <form action={action}>
        <div style={{ display: "flex", gap: "0.25rem", borderBottom: "1px solid var(--admin-border)", marginBottom: "1.75rem", flexWrap: "wrap" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              style={{
                padding: "0.75rem 1.25rem",
                fontSize: "0.875rem",
                fontWeight: 700,
                color: active === tab.id ? "#4361EE" : "var(--admin-muted)",
                background: "none",
                border: "none",
                borderBottom: active === tab.id ? "2px solid #4361EE" : "2px solid transparent",
                cursor: "pointer",
                marginBottom: "-1px",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", padding: "1.75rem" }}>
          <div style={{ display: active === "perfil" ? "block" : "none" }}>
            <FieldGrid>
              <Field label="Nome">
                <Input name="name" defaultValue={item?.name} required />
              </Field>
              <Field label="Gênero" hint='Usado para escrever "Sobre o autor" ou "Sobre a autora" corretamente na página do artigo.'>
                <Select name="gender" defaultValue={item?.gender ?? "masculino"}>
                  <option value="masculino">Masculino (autor)</option>
                  <option value="feminino">Feminino (autora)</option>
                </Select>
              </Field>
              <Field label="Slug" hint="Usado na URL da página do autor — deixe em branco para gerar automaticamente">
                <Input name="slug" defaultValue={item?.slug ?? ""} />
              </Field>
              <Field label="Cargo (PT)" hint='Usado como reserva quando não há frase de destaque nem artigo publicado. Ex: "Especialista em Growth e Dados"'>
                <Input name="role_pt" defaultValue={item?.role_pt ?? ""} />
              </Field>
              <Field label="Cargo (EN)">
                <Input name="role_en" defaultValue={item?.role_en ?? ""} />
              </Field>
              <Field label="Foto (URL)">
                <Input name="photo_url" defaultValue={item?.photo_url ?? ""} />
              </Field>
            </FieldGrid>
            <FieldGrid>
              <TaglineField name="tagline_pt" label="Frase de destaque (PT)" defaultValue={item?.tagline_pt ?? ""} />
              <TaglineField name="tagline_en" label="Frase de destaque (EN)" defaultValue={item?.tagline_en ?? ""} />
            </FieldGrid>
          </div>

          <div style={{ display: active === "bio" ? "block" : "none" }}>
            <FieldGrid>
              <Field label="Bio (PT)">
                <Textarea name="bio_pt" rows={5} defaultValue={item?.bio_pt ?? ""} />
              </Field>
              <Field label="Bio (EN)">
                <Textarea name="bio_en" rows={5} defaultValue={item?.bio_en ?? ""} />
              </Field>
            </FieldGrid>
            <FieldGrid>
              <Field
                label="Trajetória / Marcos (PT)"
                hint='Aparece na página "Sobre" da pessoa. Um marco por linha, no formato "Ano | Descrição". Ex: 2022 | Fundou a People & Growth'
              >
                <Textarea name="milestones_pt" rows={5} defaultValue={item?.milestones_pt ?? ""} placeholder={"2022 | Fundou a People & Growth\n2024 | Expandiu a atuação para o mercado internacional"} />
              </Field>
              <Field label="Trajetória / Marcos (EN)" hint='Mesmo formato: "Year | Description".'>
                <Textarea name="milestones_en" rows={5} defaultValue={item?.milestones_en ?? ""} />
              </Field>
            </FieldGrid>
          </div>

          <div style={{ display: active === "contato" ? "block" : "none" }}>
            <FieldGrid>
              <Field label="E-mail">
                <Input name="email" type="email" defaultValue={item?.email ?? ""} />
              </Field>
              <Field label="LinkedIn (URL)">
                <Input name="linkedin_url" defaultValue={item?.linkedin_url ?? ""} />
              </Field>
              <Field label="Instagram (URL)">
                <Input name="instagram_url" defaultValue={item?.instagram_url ?? ""} />
              </Field>
            </FieldGrid>
          </div>

          <div style={{ display: active === "config" ? "block" : "none" }}>
            <FieldGrid>
              <Field label="Ordem">
                <Input name="order" type="number" defaultValue={item?.order ?? 0} />
              </Field>
              <Field label="Status">
                <Select name="status" defaultValue={item?.status ?? "active"}>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </Select>
              </Field>
            </FieldGrid>
          </div>
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <SubmitButton>{item ? "Salvar alterações" : "Criar autor"}</SubmitButton>
        </div>
      </form>
    </div>
  );
}
