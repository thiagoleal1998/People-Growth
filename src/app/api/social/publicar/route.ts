import { NextRequest, NextResponse } from "next/server";

async function postLinkedIn(caption: string): Promise<{ success: boolean; url?: string; error?: string }> {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const personId = process.env.LINKEDIN_PERSON_ID;

  if (!accessToken || !personId) {
    return { success: false, error: "LinkedIn não configurado. Adicione LINKEDIN_ACCESS_TOKEN e LINKEDIN_PERSON_ID ao .env.local" };
  }

  const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: `urn:li:person:${personId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: caption },
          shareMediaCategory: "NONE",
        },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return { success: false, error: `LinkedIn API error: ${err}` };
  }

  const data = await response.json();
  return { success: true, url: `https://www.linkedin.com/feed/update/${data.id}` };
}

async function postInstagram(caption: string, imageUrl?: string): Promise<{ success: boolean; error?: string }> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  if (!accessToken || !userId) {
    return { success: false, error: "Instagram não configurado. Adicione INSTAGRAM_ACCESS_TOKEN e INSTAGRAM_USER_ID ao .env.local" };
  }

  if (!imageUrl) {
    return { success: false, error: "Instagram requer uma imagem ou vídeo para publicar" };
  }

  const containerRes = await fetch(
    `https://graph.instagram.com/v18.0/${userId}/media?image_url=${encodeURIComponent(imageUrl)}&caption=${encodeURIComponent(caption)}&access_token=${accessToken}`,
    { method: "POST" }
  );

  if (!containerRes.ok) {
    const err = await containerRes.text();
    return { success: false, error: `Instagram container error: ${err}` };
  }

  const { id: creationId } = await containerRes.json();

  const publishRes = await fetch(
    `https://graph.instagram.com/v18.0/${userId}/media_publish?creation_id=${creationId}&access_token=${accessToken}`,
    { method: "POST" }
  );

  if (!publishRes.ok) {
    const err = await publishRes.text();
    return { success: false, error: `Instagram publish error: ${err}` };
  }

  return { success: true };
}

export async function POST(request: NextRequest) {
  try {
    const { platform, caption, imageUrl } = await request.json();

    if (!platform || !caption) {
      return NextResponse.json({ error: "Plataforma e conteúdo são obrigatórios" }, { status: 400 });
    }

    let result: { success: boolean; url?: string; error?: string };

    switch (platform) {
      case "linkedin":
        result = await postLinkedIn(caption);
        break;
      case "instagram":
        result = await postInstagram(caption, imageUrl);
        break;
      case "tiktok":
        result = { success: false, error: "TikTok requer upload de vídeo. Copie o roteiro e publique pelo app." };
        break;
      case "youtube":
        result = { success: false, error: "YouTube requer upload de vídeo. Copie o roteiro e publique pelo YouTube Studio." };
        break;
      default:
        result = { success: false, error: "Plataforma não suportada" };
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Erro ao publicar" },
      { status: 500 }
    );
  }
}
