-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- CATEGORIES
-- =====================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_pt TEXT NOT NULL,
  name_en TEXT,
  slug TEXT NOT NULL UNIQUE,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- TAGS
-- =====================
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_pt TEXT NOT NULL,
  name_en TEXT,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- ARTICLES
-- =====================
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_pt TEXT NOT NULL,
  title_en TEXT,
  slug TEXT NOT NULL UNIQUE,
  content_pt TEXT NOT NULL DEFAULT '',
  content_en TEXT,
  excerpt_pt TEXT,
  excerpt_en TEXT,
  cover_image TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  author_id UUID,
  views INTEGER NOT NULL DEFAULT 0,
  read_time INTEGER,
  seo_title_pt TEXT,
  seo_title_en TEXT,
  seo_desc_pt TEXT,
  seo_desc_en TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE article_tags (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- =====================
-- PORTFOLIO CASES
-- =====================
CREATE TABLE portfolio_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_pt TEXT NOT NULL,
  title_en TEXT,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('marketing', 'growth', 'data', 'ai', 'consulting')),
  challenge_pt TEXT,
  challenge_en TEXT,
  solution_pt TEXT,
  solution_en TEXT,
  tools TEXT[],
  results_pt TEXT,
  results_en TEXT,
  cover_image TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft')),
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- SERVICES
-- =====================
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_pt TEXT NOT NULL,
  title_en TEXT,
  slug TEXT NOT NULL UNIQUE,
  description_pt TEXT NOT NULL DEFAULT '',
  description_en TEXT,
  methodology_pt TEXT,
  methodology_en TEXT,
  benefits TEXT[],
  results_pt TEXT,
  results_en TEXT,
  icon TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- TESTIMONIALS
-- =====================
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  text_pt TEXT NOT NULL,
  text_en TEXT,
  avatar_url TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  "order" INTEGER NOT NULL DEFAULT 0,
  linkedin_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- LEADS (CRM)
-- =====================
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  service_interest TEXT,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'proposal', 'closed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- NEWSLETTER SUBSCRIBERS
-- =====================
CREATE TABLE newsletter_subs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  source TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- COURSES
-- =====================
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_pt TEXT NOT NULL,
  title_en TEXT,
  slug TEXT NOT NULL UNIQUE,
  description_pt TEXT,
  description_en TEXT,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'coming_soon' CHECK (status IN ('coming_soon', 'active', 'draft')),
  cover_image TEXT,
  price NUMERIC(10, 2),
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- RESOURCES (Downloads)
-- =====================
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_pt TEXT NOT NULL,
  title_en TEXT,
  description_pt TEXT,
  description_en TEXT,
  type TEXT NOT NULL CHECK (type IN ('ebook', 'template', 'guide', 'checklist', 'prompt')),
  file_url TEXT,
  cover_image TEXT,
  download_count INTEGER NOT NULL DEFAULT 0,
  lead_required BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- MEDIA ITEMS
-- =====================
CREATE TABLE media_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  url TEXT,
  date DATE,
  type TEXT NOT NULL CHECK (type IN ('interview', 'event', 'podcast', 'article')),
  thumbnail TEXT,
  outlet TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- SITE CONFIG
-- =====================
CREATE TABLE site_config (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default config
INSERT INTO site_config (key, value) VALUES
  ('site_url', 'https://peopleandgrowth.com.br'),
  ('contact_email', 'contato.neurobotics@gmail.com'),
  ('whatsapp', ''),
  ('linkedin', 'https://www.linkedin.com/in/thiagoleal98/'),
  ('instagram', ''),
  ('calendly_url', ''),
  ('hero_photo', '');

-- =====================
-- SEED: CATEGORIES
-- =====================
INSERT INTO categories (name_pt, name_en, slug, color) VALUES
  ('Marketing', 'Marketing', 'marketing', '#4361EE'),
  ('Growth', 'Growth', 'growth', '#06D6A0'),
  ('Inteligência Artificial', 'Artificial Intelligence', 'ia', '#FFB703'),
  ('Estratégia', 'Strategy', 'estrategia', '#4361EE'),
  ('Liderança', 'Leadership', 'lideranca', '#06D6A0'),
  ('Dados', 'Data', 'dados', '#FFB703'),
  ('Carreira', 'Career', 'carreira', '#4361EE');

-- =====================
-- SEED: TAGS
-- =====================
INSERT INTO tags (name_pt, name_en, slug) VALUES
  ('Marketing', 'Marketing', 'marketing'),
  ('IA', 'AI', 'ia'),
  ('Liderança', 'Leadership', 'lideranca'),
  ('Dados', 'Data', 'dados'),
  ('Growth', 'Growth', 'growth'),
  ('Carreira', 'Career', 'carreira'),
  ('OKR', 'OKR', 'okr'),
  ('KPI', 'KPI', 'kpi'),
  ('Neuromarketing', 'Neuromarketing', 'neuromarketing');

-- =====================
-- SEED: SERVICES
-- =====================
INSERT INTO services (title_pt, title_en, slug, description_pt, description_en, benefits, "order", icon) VALUES
  ('Consultoria Estratégica', 'Strategic Consulting', 'consultoria-estrategica',
   'Diagnóstico completo do negócio, análise de mercado e desenvolvimento de plano estratégico personalizado com foco em crescimento sustentável.',
   'Complete business diagnosis, market analysis and development of a personalized strategic plan focused on sustainable growth.',
   ARRAY['Diagnóstico completo do negócio', 'Plano estratégico personalizado', 'Acompanhamento de implementação', 'Métricas de sucesso definidas'],
   1, 'Target'),
  ('Marketing Digital', 'Digital Marketing', 'marketing-digital',
   'Estratégias integradas de marketing digital, desde posicionamento de marca até geração de demanda e gestão de campanhas de performance.',
   'Integrated digital marketing strategies, from brand positioning to demand generation and performance campaign management.',
   ARRAY['Estratégia de conteúdo', 'Campanhas de performance', 'Gestão de redes sociais', 'Email marketing'],
   2, 'TrendingUp'),
  ('Growth Hacking', 'Growth Hacking', 'growth',
   'Estratégias de crescimento acelerado com foco em aquisição, ativação e retenção de clientes através de experimentação rápida e dados.',
   'Accelerated growth strategies focused on customer acquisition, activation and retention through rapid experimentation and data.',
   ARRAY['Funil de crescimento otimizado', 'Experimentação rápida (A/B tests)', 'Métricas de retenção', 'Playbooks de crescimento'],
   3, 'Rocket'),
  ('Business Intelligence', 'Business Intelligence', 'business-intelligence',
   'Implementação de dashboards, KPIs e cultura data-driven com Power BI, Looker Studio e ferramentas de analytics.',
   'Implementation of dashboards, KPIs and data-driven culture with Power BI, Looker Studio and analytics tools.',
   ARRAY['Dashboards executivos', 'KPIs estratégicos', 'Relatórios automatizados', 'Treinamento do time'],
   4, 'BarChart3'),
  ('Inteligência Artificial', 'Artificial Intelligence', 'inteligencia-artificial',
   'Implementação de soluções de IA para automação de processos, criação de agentes GPT e integração de IA no fluxo de trabalho.',
   'Implementation of AI solutions for process automation, creation of GPT agents and AI integration into the workflow.',
   ARRAY['Agentes GPT personalizados', 'Automações com n8n/Make', 'IA integrada ao negócio', 'Treinamento da equipe'],
   5, 'Brain'),
  ('Treinamentos Corporativos', 'Corporate Training', 'treinamentos',
   'Capacitação personalizada em Marketing, IA, OKR, KPI, 5W2H e Neuromarketing para times e líderes empresariais.',
   'Personalized training in Marketing, AI, OKR, KPI, 5W2H and Neuromarketing for teams and business leaders.',
   ARRAY['Trilhas customizadas', 'Material didático incluso', 'Certificado de conclusão', 'Suporte pós-treinamento'],
   6, 'Users'),
  ('Mentoria', 'Mentoring', 'mentoria',
   'Acompanhamento individual para profissionais que querem se posicionar como referência em suas áreas de atuação.',
   'Individual mentoring for professionals who want to position themselves as references in their areas of expertise.',
   ARRAY['Sessões semanais 1:1', 'Plano de desenvolvimento', 'Acesso a materiais exclusivos', 'Comunidade de mentorados'],
   7, 'Sparkles');

-- =====================
-- SEED: COURSES
-- =====================
INSERT INTO courses (title_pt, title_en, slug, description_pt, category, status, "order") VALUES
  ('KPI na Prática', 'KPI in Practice', 'kpi-na-pratica',
   'Aprenda a definir, acompanhar e apresentar KPIs que realmente orientam decisões estratégicas.', 'Estratégia', 'coming_soon', 1),
  ('OKR na Prática', 'OKR in Practice', 'okr-na-pratica',
   'Implemente OKRs do zero com metodologia comprovada e exemplos reais.', 'Estratégia', 'coming_soon', 2),
  ('5W2H aplicado a Projetos', '5W2H Applied to Projects', '5w2h',
   'Domine o framework 5W2H para planejamento e gestão de projetos com eficiência.', 'Gestão', 'coming_soon', 3),
  ('IA para Negócios', 'AI for Business', 'ia-para-negocios',
   'Como aplicar IA generativa no dia a dia do seu negócio sem precisar ser técnico.', 'IA', 'coming_soon', 4),
  ('Neuromarketing Aplicado', 'Applied Neuromarketing', 'neuromarketing',
   'Entenda como o cérebro decide e aplique esses princípios nas suas estratégias de marketing.', 'Marketing', 'coming_soon', 5);

-- =====================
-- Row Level Security
-- =====================
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subs ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can read published articles" ON articles FOR SELECT USING (status = 'published');
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can read tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Public can read article_tags" ON article_tags FOR SELECT USING (true);
CREATE POLICY "Public can read active portfolio cases" ON portfolio_cases FOR SELECT USING (status = 'active');
CREATE POLICY "Public can read active services" ON services FOR SELECT USING (status = 'active');
CREATE POLICY "Public can read active testimonials" ON testimonials FOR SELECT USING (status = 'active');
CREATE POLICY "Public can read active resources" ON resources FOR SELECT USING (status = 'active');
CREATE POLICY "Public can read active courses" ON courses FOR SELECT USING (status != 'draft');
CREATE POLICY "Public can read media items" ON media_items FOR SELECT USING (true);

-- Public insert policies (forms)
CREATE POLICY "Anyone can insert leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can subscribe newsletter" ON newsletter_subs FOR INSERT WITH CHECK (true);

-- Admin full access (authenticated users)
CREATE POLICY "Authenticated users have full access to articles" ON articles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users have full access to categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users have full access to tags" ON tags FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users have full access to article_tags" ON article_tags FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users have full access to portfolio" ON portfolio_cases FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users have full access to services" ON services FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users have full access to testimonials" ON testimonials FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users have full access to leads" ON leads FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users have full access to newsletter" ON newsletter_subs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users have full access to courses" ON courses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users have full access to resources" ON resources FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users have full access to media" ON media_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users have full access to site_config" ON site_config FOR ALL USING (auth.role() = 'authenticated');
