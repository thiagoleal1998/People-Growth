-- =====================
-- INSTITUTIONAL PAGES (Cookies, Direitos Autorais, Regras de Comentários,
-- Normas de Segurança e Privacidade) — editable from /admin/paginas.
-- =====================
CREATE TABLE institutional_pages (
  slug TEXT PRIMARY KEY,
  title_pt TEXT NOT NULL,
  title_en TEXT,
  body_pt TEXT NOT NULL,
  body_en TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE institutional_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read institutional_pages" ON institutional_pages FOR SELECT USING (true);
CREATE POLICY "Admins have full access to institutional_pages" ON institutional_pages FOR ALL USING (current_user_role() = 'admin');

INSERT INTO institutional_pages (slug, title_pt, body_pt) VALUES
('cookies', 'Política de Cookies', $$## O que são cookies
Cookies são pequenos arquivos de texto armazenados no seu navegador quando você visita um site. Eles ajudam o site a lembrar informações sobre sua visita, como preferências e sessões de login.

## Quais cookies usamos
Usamos apenas cookies essenciais, necessários para o funcionamento do site — por exemplo, o cookie de sessão que mantém o login do painel administrativo. Não usamos cookies de rastreamento, publicidade ou de terceiros para monitorar sua navegação.

## Armazenamento local do navegador
Guardamos localmente, no seu navegador, a informação de que você já visualizou o aviso de cookies, para não exibi-lo novamente. Esse dado fica apenas no seu dispositivo e não é enviado para nossos servidores.

## Seus direitos (LGPD)
De acordo com a Lei Geral de Proteção de Dados (LGPD), você pode solicitar informações sobre os dados que tratamos, bem como sua correção ou exclusão. Entre em contato pela [página de Contato](/contato) para exercer esses direitos.

## Alterações nesta política
Esta política pode ser atualizada caso o site passe a usar novos cookies ou ferramentas de terceiros. Recomendamos revisitar esta página periodicamente.$$),

('direitos-autorais', 'Aviso de Direitos Autorais', $$## Titularidade do conteúdo
Os textos, imagens, vídeos e demais materiais publicados pela People & Growth — incluindo artigos, a coluna Mea Sententia e páginas institucionais — são de titularidade da People & Growth ou de seus autores, e protegidos pela legislação brasileira de direitos autorais (Lei nº 9.610/1998), salvo quando indicada outra fonte.

## Uso permitido
É permitido compartilhar links para o nosso conteúdo e citar trechos curtos, desde que citada a fonte com link para o artigo original. Reprodução integral de artigos, sem autorização prévia, não é permitida.

## Materiais de terceiros
Imagens e vídeos incorporados de terceiros (como YouTube) pertencem a seus respectivos autores ou licenciantes e são utilizados conforme os termos de uso das plataformas de origem.

## Solicitações e denúncias
Caso identifique conteúdo nosso publicado indevidamente em outro site, ou acredite que publicamos algo que viola direitos autorais de terceiros, entre em contato pela [página de Contato](/contato).$$),

('comentarios', 'Regras de Uso dos Comentários', $$A People & Growth mantém um espaço de comentários para que leitores possam reagir e discutir os artigos publicados. Para que esse espaço funcione bem para todo mundo, pedimos que sejam seguidas as regras abaixo.

1. O autor do comentário, e não a People & Growth, é o responsável pelo que escreve. Publicamos comentários assinados por quem os envia, não pela redação.
2. Todo comentário passa por moderação antes de ser publicado. Isso pode levar algumas horas, e nem todo comentário enviado é aprovado.
3. Não publicamos comentários com discurso de ódio, ameaças, assédio ou ataques pessoais a outros leitores, colunistas ou terceiros.
4. Não publicamos comentários com conteúdo ilegal, discriminatório, ou que incentivem violência.
5. Não publicamos spam, propaganda, links suspeitos ou divulgação de dados pessoais de terceiros.
6. Comentários fora do tema do artigo ou repetidos em vários artigos podem ser removidos.
7. A People & Growth pode remover, editar a exibição ou recusar qualquer comentário, a seu critério, sem necessidade de justificar a decisão a quem o enviou.
8. O e-mail informado no formulário de comentário não é publicado — serve apenas para eventual contato sobre a própria mensagem, conforme nossas [Normas de Segurança e Privacidade](/normas-de-seguranca-e-privacidade).

Encontrou um comentário que viola essas regras? Avise a gente pela [página de Contato](/contato).$$),

('normas-de-seguranca-e-privacidade', 'Normas de Segurança e Privacidade', $$## Quais dados coletamos
Ao comentar em um artigo ou preencher um formulário no site (contato, newsletter), coletamos apenas o necessário para viabilizar aquele serviço: nome, e-mail e o conteúdo enviado. Não pedimos dados sensíveis e não é preciso criar conta ou senha.

## Como usamos esses dados
O e-mail informado em um comentário serve só para eventual contato sobre a própria mensagem e não é publicado nem compartilhado. Dados de formulários são usados exclusivamente para responder ao contato ou enviar a newsletter, quando o cadastro é feito voluntariamente.

## Com quem compartilhamos
Não vendemos, alugamos ou compartilhamos dados pessoais com terceiros para fins de marketing. Os dados ficam armazenados em infraestrutura de nuvem (Supabase) com acesso restrito à equipe da People & Growth.

## Moderação de comentários
Todo comentário passa por revisão antes de ser publicado. Isso significa que, entre o envio e a publicação, seu comentário e e-mail ficam visíveis apenas para a equipe responsável pela moderação.

## Base legal e retenção (LGPD)
Tratamos esses dados com base no consentimento dado ao enviar o formulário e no legítimo interesse em manter um espaço de comentários seguro. Mantemos os dados pelo tempo necessário para essa finalidade ou até que você solicite a exclusão.

## Seus direitos
Você pode solicitar a qualquer momento a exclusão do seu comentário, a correção de dados ou informações sobre o que armazenamos, entrando em contato pela [página de Contato](/contato).

## Cookies
O uso de cookies no site é tratado separadamente na nossa [Política de Cookies](/cookies).$$);
