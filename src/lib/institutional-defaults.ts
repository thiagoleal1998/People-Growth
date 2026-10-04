// Built-in text for the institutional pages. Shown on the public site until
// an admin saves a version in the database, and pre-filled in the admin editor
// so there's always something to start from.
export type InstitutionalDefaults = { titlePt?: string; titleEn?: string; bodyPt: string; bodyEn?: string };

export const INSTITUTIONAL_DEFAULTS: Record<string, InstitutionalDefaults> = {
  "cookies": {
    titlePt: "Política de Cookies",
    titleEn: "Cookie Policy",
    bodyPt: `## O que são cookies
Cookies são pequenos arquivos de texto armazenados no seu navegador quando você visita um site. Eles ajudam o site a lembrar informações sobre sua visita, como preferências e sessões de login.

## Quais cookies usamos
Usamos apenas cookies essenciais, necessários para o funcionamento do site — por exemplo, o cookie de sessão que mantém o login do painel administrativo. Não usamos cookies de rastreamento, publicidade ou de terceiros para monitorar sua navegação.

## Armazenamento local do navegador
Guardamos localmente, no seu navegador, a informação de que você já visualizou o aviso de cookies, para não exibi-lo novamente. Esse dado fica apenas no seu dispositivo e não é enviado para nossos servidores.

## Seus direitos (LGPD)
De acordo com a Lei Geral de Proteção de Dados (LGPD), você pode solicitar informações sobre os dados que tratamos, bem como sua correção ou exclusão. Entre em contato pela [página de Contato](/contato) para exercer esses direitos.

## Alterações nesta política
Esta política pode ser atualizada caso o site passe a usar novos cookies ou ferramentas de terceiros. Recomendamos revisitar esta página periodicamente.`,
    bodyEn: `## What cookies are
Cookies are small text files stored in your browser when you visit a website. They help the site remember information about your visit, such as preferences and login sessions.

## Which cookies we use
We only use essential cookies, necessary for the site to work — for example, the session cookie that keeps the admin panel login active. We do not use tracking, advertising or third-party cookies to monitor your browsing.

## Local browser storage
We store locally, in your browser, the information that you've already seen the cookie notice, so it isn't shown again. This data stays only on your device and is never sent to our servers.

## Your rights (LGPD)
Under Brazil's General Data Protection Law (LGPD), you can request information about the data we process, as well as its correction or deletion. Contact us via the [Contact page](/contato) to exercise these rights.

## Changes to this policy
This policy may be updated if the site starts using new cookies or third-party tools. We recommend revisiting this page periodically.`,
  },
  "direitos-autorais": {
    titlePt: "Aviso de Direitos Autorais",
    titleEn: "Copyright Notice",
    bodyPt: `## Titularidade do conteúdo
Os textos, imagens, vídeos e demais materiais publicados pela People & Growth — incluindo artigos, a coluna Mea Sententia e páginas institucionais — são de titularidade da People & Growth ou de seus autores, e protegidos pela legislação brasileira de direitos autorais (Lei nº 9.610/1998), salvo quando indicada outra fonte.

## Uso permitido
É permitido compartilhar links para o nosso conteúdo e citar trechos curtos, desde que citada a fonte com link para o artigo original. Reprodução integral de artigos, sem autorização prévia, não é permitida.

## Materiais de terceiros
Imagens e vídeos incorporados de terceiros (como YouTube) pertencem a seus respectivos autores ou licenciantes e são utilizados conforme os termos de uso das plataformas de origem.

## Solicitações e denúncias
Caso identifique conteúdo nosso publicado indevidamente em outro site, ou acredite que publicamos algo que viola direitos autorais de terceiros, entre em contato pela [página de Contato](/contato).`,
    bodyEn: `## Content ownership
The text, images, videos and other materials published by People & Growth — including articles, the Mea Sententia column and institutional pages — are owned by People & Growth or its authors, and protected by Brazilian copyright law (Law No. 9,610/1998), unless another source is indicated.

## Permitted use
You may share links to our content and quote short excerpts, provided the source is cited with a link to the original article. Full reproduction of articles without prior authorization is not permitted.

## Third-party materials
Images and videos embedded from third parties (such as YouTube) belong to their respective authors or licensors and are used according to the terms of use of the originating platforms.

## Requests and reports
If you find our content published without authorization on another site, or believe we've published something that infringes a third party's copyright, please contact us via the [Contact page](/contato).`,
  },
  "comentarios": {
    titlePt: "Regras de Uso dos Comentários",
    titleEn: "Comment Guidelines",
    bodyPt: `A People & Growth mantém um espaço de comentários para que leitores possam reagir e discutir os artigos publicados. Para que esse espaço funcione bem para todo mundo, pedimos que sejam seguidas as regras abaixo.

1. O autor do comentário, e não a People & Growth, é o responsável pelo que escreve. Publicamos comentários assinados por quem os envia, não pela redação.
2. Todo comentário passa por moderação antes de ser publicado. Isso pode levar algumas horas, e nem todo comentário enviado é aprovado.
3. Não publicamos comentários com discurso de ódio, ameaças, assédio ou ataques pessoais a outros leitores, colunistas ou terceiros.
4. Não publicamos comentários com conteúdo ilegal, discriminatório, ou que incentivem violência.
5. Não publicamos spam, propaganda, links suspeitos ou divulgação de dados pessoais de terceiros.
6. Comentários fora do tema do artigo ou repetidos em vários artigos podem ser removidos.
7. A People & Growth pode remover, editar a exibição ou recusar qualquer comentário, a seu critério, sem necessidade de justificar a decisão a quem o enviou.
8. O e-mail informado no formulário de comentário não é publicado — serve apenas para eventual contato sobre a própria mensagem, conforme nossas [Normas de Segurança e Privacidade](/normas-de-seguranca-e-privacidade).

Encontrou um comentário que viola essas regras? Avise a gente pela [página de Contato](/contato).`,
    bodyEn: `People & Growth maintains a comment space so readers can react to and discuss published articles. For this space to work well for everyone, we ask that the rules below be followed.

1. The author of the comment, not People & Growth, is responsible for what they write. We publish comments signed by whoever sends them, not by the editorial team.
2. Every comment goes through moderation before being published. This can take a few hours, and not every submitted comment is approved.
3. We do not publish comments containing hate speech, threats, harassment, or personal attacks against other readers, columnists or third parties.
4. We do not publish comments with illegal or discriminatory content, or content that incites violence.
5. We do not publish spam, advertising, suspicious links, or disclosure of third parties' personal data.
6. Comments off-topic from the article, or repeated across multiple articles, may be removed.
7. People & Growth may remove, edit the display of, or decline any comment at its discretion, with no obligation to justify the decision to whoever submitted it.
8. The email provided in the comment form is not published — it's used only for possible contact about the message itself, per our [Security and Privacy Standards](/normas-de-seguranca-e-privacidade).

Found a comment that violates these rules? Let us know via the [Contact page](/contato).`,
  },
  "normas-de-seguranca-e-privacidade": {
    titlePt: "Normas de Segurança e Privacidade",
    titleEn: "Security and Privacy Standards",
    bodyPt: `## Quais dados coletamos
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
O uso de cookies no site é tratado separadamente na nossa [Política de Cookies](/cookies).`,
    bodyEn: `## What data we collect
When you comment on an article or fill in a form on the site (contact, newsletter), we only collect what's needed to provide that service: name, email and the content you send. We don't ask for sensitive data, and no account or password is required.

## How we use this data
The email given in a comment is only used for possible follow-up about that message itself and is never published or shared. Form data is used exclusively to respond to your contact request or send the newsletter, when you sign up voluntarily.

## Who we share it with
We do not sell, rent or share personal data with third parties for marketing purposes. Data is stored on cloud infrastructure (Supabase) with access restricted to the People & Growth team.

## Comment moderation
Every comment is reviewed before publication. This means that, between submission and publication, your comment and email are visible only to the team responsible for moderation.

## Legal basis and retention (LGPD)
We process this data based on the consent given when submitting the form and on the legitimate interest in keeping a safe comment space. We keep the data for as long as necessary for that purpose, or until you request its deletion.

## Your rights
You can request at any time the deletion of your comment, correction of data, or information about what we store, by contacting us via the [Contact page](/contato).

## Cookies
The use of cookies on the site is covered separately in our [Cookie Policy](/cookies).`,
  },
  "termos-de-uso": {
    titlePt: "Termos de Uso",
    titleEn: "Terms of Use",
    bodyPt: `## Aceitação dos termos
Ao acessar e usar o site da People & Growth, você concorda com estes Termos de Uso. Se não concordar com algum ponto, pedimos que não utilize o site.

## Sobre o conteúdo
Os artigos, análises e materiais publicados aqui — incluindo os da seção Mea Sententia — representam a opinião de seus autores e têm caráter informativo. Não constituem aconselhamento profissional individualizado (jurídico, financeiro, contábil ou de outra natureza) para o caso concreto de cada leitor.

## Propriedade intelectual
Textos, imagens, marca e demais materiais do site são de propriedade da People & Growth ou de terceiros licenciados, protegidos por direitos autorais. A reprodução total ou parcial sem autorização prévia não é permitida — veja também nosso [Aviso de Direitos Autorais](/direitos-autorais).

## Comentários e conduta do usuário
Ao comentar em um artigo, você concorda em não publicar conteúdo ofensivo, ilegal, difamatório ou que viole direitos de terceiros. Reservamo-nos o direito de moderar, editar ou remover comentários que descumpram essas regras — veja as [Regras de Uso dos Comentários](/comentarios) para mais detalhes.

## Limitação de responsabilidade
O site é fornecido "como está". Fazemos o possível para manter as informações atualizadas e corretas, mas não garantimos que o conteúdo esteja livre de erros a qualquer momento, nem nos responsabilizamos por decisões tomadas exclusivamente com base no que é publicado aqui.

## Links externos
Podemos linkar para sites de terceiros por conveniência. Não somos responsáveis pelo conteúdo, políticas ou práticas desses sites.

## Alterações nestes termos
Podemos atualizar estes Termos de Uso periodicamente. A versão vigente é sempre a publicada nesta página, com a data da última atualização indicada no topo.

## Legislação aplicável
Estes termos são regidos pelas leis da República Federativa do Brasil. Dúvidas podem ser enviadas pela [página de Contato](/contato).`,
    bodyEn: `## Acceptance of terms
By accessing and using the People & Growth website, you agree to these Terms of Use. If you disagree with any part, please do not use the site.

## About the content
The articles, analyses and materials published here — including those in the Mea Sententia section — represent the opinion of their authors and are informational in nature. They do not constitute individualized professional advice (legal, financial, accounting or otherwise) for any reader's specific situation.

## Intellectual property
Text, images, brand and other site materials are the property of People & Growth or licensed third parties, protected by copyright. Full or partial reproduction without prior authorization is not permitted — see also our [Copyright Notice](/direitos-autorais).

## Comments and user conduct
By commenting on an article, you agree not to post offensive, illegal, defamatory content or content that violates third-party rights. We reserve the right to moderate, edit or remove comments that break these rules — see the [Comment Guidelines](/comentarios) for more details.

## Limitation of liability
The site is provided "as is". We do our best to keep the information up to date and accurate, but we do not guarantee the content is error-free at all times, nor are we liable for decisions made solely based on what is published here.

## External links
We may link to third-party sites for convenience. We are not responsible for the content, policies or practices of those sites.

## Changes to these terms
We may update these Terms of Use periodically. The version in effect is always the one published on this page, with the last-updated date shown at the top.

## Applicable law
These terms are governed by the laws of the Federative Republic of Brazil. Questions can be sent via the [Contact page](/contato).`,
  },
  "o-que-e-people-and-growth": {
    titlePt: "O que é a People & Growth",
    titleEn: "What is People & Growth",
    bodyPt: `## 4 níveis de desenvolvimento: Pessoa, Liderança, Equipe e Negócio

O People & Growth parte da compreensão de que desenvolvimento não acontece de forma isolada. Pessoas, relações, equipes e negócios estão conectados, e compreender essa relação é fundamental para construir possibilidades reais de desenvolvimento.

Nossa abordagem se organiza em quatro níveis:

**Pessoa → Liderança → Equipe → Negócio**

### 1. Pessoa — compreender a si

O desenvolvimento pessoal parte do autoconhecimento, mas não se limita a ele. Abordamos temas como valores, escolhas, carreira, comunicação, inteligência emocional, tomada de decisão, potencial, limites e propósito, sempre considerando a relação entre indivíduo e contexto.

Esse desenvolvimento também pode acompanhar diferentes momentos da trajetória profissional, desde a entrada no mercado de trabalho até processos de transição, reposicionamento e crescimento na carreira. Nesse contexto, também abordamos posturas profissionais, relações no ambiente de trabalho, comunicação e a construção de uma atuação profissional mais consciente.

Propomos um desenvolvimento pessoal mais crítico, sem reproduzir a lógica de que toda responsabilidade pelo sucesso ou fracasso está exclusivamente no indivíduo.

Desenvolver-se também significa compreender o próprio contexto: reconhecer quem somos, nossas capacidades e limites, mas também perceber como condições sociais, econômicas, culturais e relacionais influenciam nossas possibilidades.

A questão não é pensar "eu posso tudo se me esforçar", nem assumir que "nada depende de mim". É compreender o que está ou não sob nosso controle e, a partir disso, reconhecer nossa margem real de ação. Desenvolvimento pessoal é ampliar a consciência sobre si e sobre o contexto para agir de forma mais consciente sobre aquilo que podemos transformar.

### 2. Liderança — compreender as relações

Quando passamos do indivíduo para a liderança, surge uma questão fundamental: eu não lidero apenas tarefas; eu me relaciono com pessoas. Liderar envolve compreender relações, expectativas, interesses e diferentes formas de enxergar uma mesma situação.

Por isso, trabalhamos temas como:

- comunicação
- confiança
- conflitos
- negociação
- tomada de decisão
- responsabilidade
- influência
- poder
- cultura organizacional
- desenvolvimento de pessoas
- utilização de dados e informações na tomada de decisão
- desenvolvimento de lideranças em contextos de mudança

A liderança deixa de ser compreendida apenas como autoridade ou capacidade de comando e passa a ser também a capacidade de construir relações e criar condições para que outras pessoas possam se desenvolver e agir.

### 3. Equipe — compreender o coletivo

No nível das equipes, a unidade de análise deixa de ser o indivíduo isolado. Uma equipe possui uma dinâmica própria, formada por papéis, interesses, objetivos, conflitos, relações de poder, comunicação, confiança, cultura e formas de tomada de decisão. Por isso, nem todo problema de desempenho de uma pessoa é necessariamente um problema daquela pessoa. É preciso compreender o sistema em que ela está inserida.

Trabalhamos temas como:

- integração
- comunicação
- cultura organizacional
- conflitos
- colaboração
- definição de objetivos
- definição de papéis
- construção de confiança
- compartilhamento e aplicação de conhecimento
- utilização de informações para apoiar decisões e ações

Desenvolver uma equipe é compreender as relações que a constituem e criar condições para que o coletivo funcione melhor.

### 4. Negócio — compreender e transformar contextos

No nível dos negócios, desenvolvimento não significa simplesmente "vender mais". Um negócio está inserido em um contexto formado por mercado, pessoas, organizações, relações, oportunidades, concorrentes, parceiros e mudanças constantes.

Desenvolvimento de negócios pode envolver:

- estratégia
- posicionamento
- inovação
- relacionamento
- parcerias
- negociação
- leitura de cenários
- identificação de oportunidades
- utilização de dados para apoiar decisões
- criação e interpretação de informações
- desenvolvimento de soluções a partir do conhecimento
- cultura organizacional
- criação de valor
- desenvolvimento organizacional

A pergunta central deixa de ser apenas "como crescer?" e passa a ser: que contexto estamos inseridos, quais possibilidades existem e como podemos criar valor a partir delas?

## Informação, conhecimento e ação

Vivemos em um contexto de excesso de informações. Ter acesso a dados não significa necessariamente compreender uma situação, assim como acumular conhecimento não significa necessariamente saber aplicá-lo.

Por isso, o People & Growth também busca desenvolver a capacidade de selecionar, interpretar e utilizar informações de forma consciente, transformando dados em conhecimento e conhecimento em ação.

A questão não é apenas ter mais informação, mas compreender o que é relevante, como interpretar aquilo que está disponível e como transformar esse conhecimento em decisões e práticas que façam sentido para cada contexto.

## Para quem é?

O People & Growth se destina a pessoas e organizações que reconhecem o desenvolvimento como um processo contínuo de compreensão e transformação. Atuamos com pessoas que estão entrando no mercado de trabalho, profissionais que buscam desenvolvimento e novas possibilidades de atuação, líderes que desejam aprimorar sua forma de liderar e equipes e organizações que buscam desenvolver suas pessoas, relações, cultura e negócios.

## Onde podemos atuar?

A partir desses quatro níveis, o People & Growth pode desenvolver conteúdos, palestras, workshops e consultorias direcionados a diferentes públicos.

### Para pessoas

- Autoconhecimento e carreira
- Entrada e desenvolvimento no mercado de trabalho
- Desenvolvimento profissional
- Postura profissional
- Tomada de decisão
- Comunicação
- Relações profissionais
- Liderança pessoal
- Inteligência emocional
- Desenvolvimento de novas possibilidades de atuação

### Para líderes

- Desenvolvimento de liderança
- Comunicação e conflitos
- Gestão de pessoas
- Tomada de decisão
- Construção de confiança
- Cultura organizacional
- Utilização de dados e informações
- Liderança em contextos de mudança
- Desenvolvimento de pessoas

### Para equipes

- Integração
- Comunicação
- Cultura organizacional
- Conflitos
- Colaboração
- Construção de confiança
- Definição de objetivos e papéis
- Compartilhamento e aplicação de conhecimento
- Tomada de decisão

### Para negócios

- Estratégia
- Desenvolvimento de negócios
- Posicionamento
- Inovação
- Cultura organizacional
- Dados e tomada de decisão
- Relações e parcerias
- Leitura de cenários e oportunidades
- Desenvolvimento organizacional
- Criação de valor

## Nossa perspectiva

- Desenvolvimento pessoal para compreender a si.
- Liderança para compreender e mobilizar relações.
- Desenvolvimento de equipes para construir possibilidades coletivas.
- Desenvolvimento de negócios para compreender e transformar contextos.

> Pessoas que compreendem a si.
> Líderes que compreendem relações.
> Equipes que constroem juntas.
> Conhecimento que se transforma em ação.
> Negócios que compreendem e transformam contextos.
> — People & Growth

## Visão

Ampliar a forma como pessoas e organizações compreendem o desenvolvimento, conectando indivíduo, relações, equipes e negócios para transformar contextos.

## Missão

Criar conteúdos, experiências e soluções que desenvolvam pessoas, fortaleçam relações, potencializem equipes e contribuam para a transformação dos negócios.

## Valores

Consciência, Responsabilidade, Desenvolvimento contínuo, Relações, Pensamento crítico, Colaboração, Inovação e Criação de valor.

> Compreender para transformar.
> — People & Growth

[Conheça o time por trás da People & Growth](/sobre)`,
    bodyEn: `## 4 levels of development: Person, Leadership, Team and Business

People & Growth starts from the understanding that development doesn't happen in isolation. People, relationships, teams and businesses are connected, and understanding that relationship is essential to building real possibilities for development.

Our approach is organized into four levels:

**Person → Leadership → Team → Business**

### 1. Person — understanding yourself

Personal development starts with self-knowledge, but isn't limited to it. We address topics such as values, choices, career, communication, emotional intelligence, decision-making, potential, limits and purpose, always considering the relationship between the individual and their context.

This development can also follow different moments of a professional journey, from entering the job market to processes of transition, repositioning and career growth. In this context, we also address professional posture, workplace relationships, communication and building a more conscious professional practice.

We propose a more critical approach to personal development, one that doesn't reproduce the logic that all responsibility for success or failure lies exclusively with the individual.

Developing also means understanding one's own context: recognizing who we are, our capabilities and limits, but also perceiving how social, economic, cultural and relational conditions influence our possibilities.

The question isn't to think "I can do anything if I try hard enough," nor to assume that "nothing depends on me." It's about understanding what is or isn't within our control and, from there, recognizing our real room for action. Personal development means expanding our awareness of ourselves and our context in order to act more consciously on what we can actually transform.

### 2. Leadership — understanding relationships

When we move from the individual to leadership, a fundamental question arises: I don't just lead tasks; I relate to people. Leading involves understanding relationships, expectations, interests and different ways of seeing the same situation.

That's why we work with topics such as:

- communication
- trust
- conflict
- negotiation
- decision-making
- responsibility
- influence
- power
- organizational culture
- people development
- using data and information in decision-making
- developing leadership in contexts of change

Leadership stops being understood only as authority or command, and becomes the ability to build relationships and create the conditions for other people to develop and act.

### 3. Team — understanding the collective

At the team level, the unit of analysis stops being the isolated individual. A team has its own dynamic, shaped by roles, interests, goals, conflicts, power relations, communication, trust, culture and ways of making decisions. That's why not every performance problem is necessarily that person's problem alone — it's necessary to understand the system they're part of.

We work with topics such as:

- onboarding and integration
- communication
- organizational culture
- conflict
- collaboration
- defining goals
- defining roles
- building trust
- sharing and applying knowledge
- using information to support decisions and actions

Developing a team means understanding the relationships that shape it and creating the conditions for the collective to work better.

### 4. Business — understanding and transforming contexts

At the business level, development doesn't simply mean "selling more." A business exists within a context shaped by the market, people, organizations, relationships, opportunities, competitors, partners and constant change.

Business development can involve:

- strategy
- positioning
- innovation
- relationship-building
- partnerships
- negotiation
- reading scenarios
- identifying opportunities
- using data to support decisions
- creating and interpreting information
- developing solutions from knowledge
- organizational culture
- creating value
- organizational development

The central question stops being just "how do we grow?" and becomes: what context are we in, what possibilities exist, and how can we create value from them?

## Information, knowledge and action

We live in a context of information overload. Having access to data doesn't necessarily mean understanding a situation, just as accumulating knowledge doesn't necessarily mean knowing how to apply it.

That's why People & Growth also seeks to develop the ability to select, interpret and use information consciously, turning data into knowledge and knowledge into action.

The question isn't just about having more information, but understanding what's relevant, how to interpret what's available, and how to turn that knowledge into decisions and practices that make sense for each context.

## Who is it for?

People & Growth is for people and organizations that recognize development as a continuous process of understanding and transformation. We work with people entering the job market, professionals seeking development and new ways of working, leaders who want to improve how they lead, and teams and organizations looking to develop their people, relationships, culture and business.

## Where can we help?

Based on these four levels, People & Growth develops content, talks, workshops and consulting aimed at different audiences.

### For individuals

- Self-knowledge and career
- Entering and developing in the job market
- Professional development
- Professional posture
- Decision-making
- Communication
- Professional relationships
- Personal leadership
- Emotional intelligence
- Developing new ways of working

### For leaders

- Leadership development
- Communication and conflict
- People management
- Decision-making
- Building trust
- Organizational culture
- Using data and information
- Leadership in contexts of change
- People development

### For teams

- Integration
- Communication
- Organizational culture
- Conflict
- Collaboration
- Building trust
- Defining goals and roles
- Sharing and applying knowledge
- Decision-making

### For businesses

- Strategy
- Business development
- Positioning
- Innovation
- Organizational culture
- Data and decision-making
- Relationships and partnerships
- Reading scenarios and opportunities
- Organizational development
- Creating value

## Our perspective

- Personal development to understand yourself.
- Leadership to understand and mobilize relationships.
- Team development to build collective possibilities.
- Business development to understand and transform contexts.

> People who understand themselves.
> Leaders who understand relationships.
> Teams that build together.
> Knowledge turned into action.
> Businesses that understand and transform contexts.
> — People & Growth

## Vision

To broaden how people and organizations understand development, connecting the individual, relationships, teams and businesses to transform contexts.

## Mission

To create content, experiences and solutions that develop people, strengthen relationships, empower teams and contribute to business transformation.

## Values

Awareness, Responsibility, Continuous development, Relationships, Critical thinking, Collaboration, Innovation and Value creation.

> Understanding to transform.
> — People & Growth

[Meet the team behind People & Growth](/sobre)`,
  },
};
