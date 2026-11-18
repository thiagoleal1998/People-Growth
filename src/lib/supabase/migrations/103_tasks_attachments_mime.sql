-- O bucket "site-assets" tinha allowed_mime_types restrito a imagem/áudio
-- (criado assim desde o início, ver 060/075), o que rejeitava com 415
-- qualquer anexo de documento nas Tarefas (ex: "mime type text/plain is
-- not supported" ao testar um .txt). Mesmo padrão de widen já usado em
-- 060_tts_audio_bucket_mime.sql / 075_message_audio.sql — adiciona os
-- tipos de documento comuns usados como anexo de card, sem remover nada
-- do que já estava liberado.
UPDATE storage.buckets
SET allowed_mime_types = array(SELECT DISTINCT unnest(allowed_mime_types || ARRAY[
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
  'application/zip'
]))
WHERE id = 'site-assets';
