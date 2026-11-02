-- Mensagens de voz (botão de microfone no composer). audio_url aponta pro
-- arquivo no bucket site-assets, gravado pelo MediaRecorder do navegador
-- (webm/opus no Chrome/Edge, mp4/aac no Safari) — por isso o widening de
-- allowed_mime_types abaixo, igual ao já feito pro TTS em 060.
ALTER TABLE messages ADD COLUMN audio_url TEXT;

-- Já aplicado diretamente via Storage admin API ao construir a feature —
-- este arquivo documenta a mudança, mesmo padrão da 060.
UPDATE storage.buckets
SET allowed_mime_types = array(SELECT DISTINCT unnest(allowed_mime_types || ARRAY['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav']))
WHERE id = 'site-assets';
