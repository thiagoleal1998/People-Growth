import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { renderMarkdownLite } from "@/lib/markdown-lite";
import { pickLocale } from "@/lib/locale-content";

export const revalidate = 300;

const DEFAULT_TITLE_PT = "O que é a People & Growth";
const DEFAULT_TITLE_EN = "What is People & Growth";

const DEFAULT_BODY_PT = `## 4 níveis de desenvolvimento: Pessoa, Liderança, Equipe e Negócio

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

[Conheça o time por trás da People & Growth](/sobre)`;

const DEFAULT_BODY_EN = `## 4 levels of development: Person, Leadership, Team and Business

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

[Meet the team behind People & Growth](/sobre)`;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "en" ? DEFAULT_TITLE_EN : DEFAULT_TITLE_PT,
    description: locale === "en" ? "The four levels of development behind People & Growth: Person, Leadership, Team and Business." : "Os quatro níveis de desenvolvimento por trás da People & Growth: Pessoa, Liderança, Equipe e Negócio.",
  };
}

export default async function OQueEPeopleAndGrowthPage() {
  const locale = await getLocale();
  const tNav = await getTranslations("nav");
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("institutional_pages").select("*").eq("slug", "o-que-e-people-and-growth").single();

  const title = pickLocale(locale, data?.title_pt, data?.title_en) || (locale === "en" ? DEFAULT_TITLE_EN : DEFAULT_TITLE_PT);
  const body = pickLocale(locale, data?.body_pt, data?.body_en) || (locale === "en" ? DEFAULT_BODY_EN : DEFAULT_BODY_PT);

  return (
    <>
      <section
        style={{
          background: "linear-gradient(135deg, #0d1b2a 0%, #1a1f3e 100%)",
          paddingTop: "6rem",
          paddingBottom: "3.5rem",
          color: "white",
        }}
      >
        <div className="container-xl" style={{ maxWidth: "720px" }}>
          <Link
            href="/sobre"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.875rem",
              marginBottom: "2rem",
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={16} /> {tNav("about")}
          </Link>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800 }}>{title}</h1>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: "var(--site-bg)" }}>
        <div className="container-xl" style={{ maxWidth: "720px" }}>
          <div
            style={{ color: "var(--site-text-secondary)", fontSize: "1.0625rem", lineHeight: 1.75 }}
            dangerouslySetInnerHTML={{ __html: renderMarkdownLite(body) }}
          />
        </div>
      </section>
    </>
  );
}
