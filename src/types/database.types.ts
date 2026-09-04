export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type ArticleRow = {
  id: string;
  title_pt: string;
  title_en: string | null;
  slug: string;
  content_pt: string;
  content_en: string | null;
  excerpt_pt: string | null;
  excerpt_en: string | null;
  cover_image: string | null;
  cover_image_caption: string | null;
  cover_image_credit: string | null;
  video_url: string | null;
  summary_pt: string | null;
  summary_en: string | null;
  category_id: string | null;
  status: "draft" | "pending" | "scheduled" | "published";
  format: "noticia" | "opiniao";
  published_at: string | null;
  scheduled_for: string | null;
  author_id: string | null;
  views: number;
  read_time: number | null;
  seo_title_pt: string | null;
  seo_title_en: string | null;
  seo_desc_pt: string | null;
  seo_desc_en: string | null;
  created_at: string;
  updated_at: string;
};

type CategoryRow = {
  id: string;
  name_pt: string;
  name_en: string | null;
  slug: string;
  color: string | null;
  icon: string | null;
  created_at: string;
};

type TagRow = {
  id: string;
  name_pt: string;
  name_en: string | null;
  slug: string;
  created_at: string;
};

type ArticleTagRow = { article_id: string; tag_id: string };

type PortfolioCaseRow = {
  id: string;
  title_pt: string;
  title_en: string | null;
  slug: string;
  category: "marketing" | "growth" | "data" | "ai" | "consulting";
  challenge_pt: string | null;
  challenge_en: string | null;
  solution_pt: string | null;
  solution_en: string | null;
  tools: string[] | null;
  results_pt: string | null;
  results_en: string | null;
  cover_image: string | null;
  status: "active" | "draft";
  order: number;
  created_at: string;
  updated_at: string;
};

type ServiceRow = {
  id: string;
  title_pt: string;
  title_en: string | null;
  slug: string;
  description_pt: string;
  description_en: string | null;
  methodology_pt: string | null;
  methodology_en: string | null;
  benefits: string[] | null;
  results_pt: string | null;
  results_en: string | null;
  icon: string | null;
  order: number;
  status: "active" | "draft";
  created_at: string;
  updated_at: string;
};

type TestimonialRow = {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  text_pt: string;
  text_en: string | null;
  avatar_url: string | null;
  rating: number | null;
  status: "active" | "inactive";
  order: number;
  linkedin_url: string | null;
  created_at: string;
};

type LeadRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  service_interest: string | null;
  source: string | null;
  status: "new" | "contacted" | "proposal" | "closed";
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type NewsletterSubRow = {
  id: string;
  email: string;
  name: string | null;
  status: "active" | "unsubscribed";
  source: string | null;
  subscribed_at: string;
};

type CourseRow = {
  id: string;
  title_pt: string;
  title_en: string | null;
  slug: string;
  description_pt: string | null;
  description_en: string | null;
  category: string | null;
  status: "coming_soon" | "active" | "draft";
  cover_image: string | null;
  price: number | null;
  order: number;
  created_at: string;
  updated_at: string;
};

type ResourceRow = {
  id: string;
  title_pt: string;
  title_en: string | null;
  description_pt: string | null;
  description_en: string | null;
  type: "ebook" | "template" | "guide" | "checklist" | "prompt";
  file_url: string | null;
  cover_image: string | null;
  download_count: number;
  lead_required: boolean;
  status: "active" | "draft";
  created_at: string;
  updated_at: string;
};

type MediaItemRow = {
  id: string;
  title: string;
  url: string | null;
  date: string | null;
  type: "interview" | "event" | "podcast" | "article";
  thumbnail: string | null;
  outlet: string | null;
  order: number;
  created_at: string;
};

type SiteConfigRow = { key: string; value: string | null; updated_at: string };

type ErrorReportRow = {
  id: string;
  page_url: string;
  description: string;
  email: string | null;
  status: "new" | "reviewing" | "resolved";
  created_at: string;
};

type UserProfileRow = {
  id: string;
  email: string;
  role: "admin" | "author";
  author_id: string | null;
  last_seen_at: string | null;
  created_at: string;
};

type ActivityLogRow = {
  id: string;
  user_id: string | null;
  user_email: string;
  action: string;
  entity_type: string;
  entity_label: string | null;
  details: { field: string; before: string; after: string }[] | null;
  created_at: string;
};

type PasswordResetRequestRow = {
  id: string;
  email: string;
  status: "pending" | "resolved";
  created_at: string;
  resolved_at: string | null;
};

type InternalTicketRow = {
  id: string;
  created_by: string | null;
  created_by_name: string;
  created_by_role: "admin" | "author";
  type: "bug" | "suggestion";
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved";
  admin_response: string | null;
  created_at: string;
  updated_at: string;
};

type CommentRow = {
  id: string;
  article_id: string;
  parent_id: string | null;
  name: string;
  email: string;
  body: string;
  likes: number;
  reports: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

type InstitutionalPageRow = {
  slug: string;
  title_pt: string;
  title_en: string | null;
  body_pt: string;
  body_en: string | null;
  updated_at: string;
};

type AuthorRow = {
  id: string;
  name: string;
  slug: string;
  gender: "masculino" | "feminino";
  role_pt: string | null;
  role_en: string | null;
  tagline_pt: string | null;
  tagline_en: string | null;
  bio_pt: string | null;
  bio_en: string | null;
  milestones_pt: string | null;
  milestones_en: string | null;
  photo_url: string | null;
  email: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  status: "active" | "inactive";
  order: number;
  created_at: string;
  updated_at: string;
};

type PageViewRow = {
  id: string;
  path: string;
  page_type: "page" | "article";
  article_id: string | null;
  visitor_id: string;
  locale: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  scroll_depth: number | null;
  visitor_country: string | null;
  visitor_region: string | null;
  visitor_city: string | null;
  created_at: string;
};

type AdSlotRow = {
  key: string;
  label: string;
  updated_at: string;
};

type AdRow = {
  id: string;
  slot_key: string;
  title: string;
  image_url: string | null;
  link_url: string | null;
  alt_text: string | null;
  target_mode: "all" | "specific";
  active: boolean;
  created_at: string;
  updated_at: string;
};

type AdTargetRow = {
  ad_id: string;
  article_id: string;
};

type AdEventRow = {
  id: string;
  ad_slot_key: string;
  ad_id: string | null;
  event_type: "impression" | "click";
  path: string | null;
  visitor_id: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      articles: { Row: ArticleRow; Insert: Omit<ArticleRow, "id" | "created_at" | "updated_at" | "views">; Update: Partial<Omit<ArticleRow, "id" | "created_at" | "updated_at">>; Relationships: [] };
      categories: { Row: CategoryRow; Insert: Omit<CategoryRow, "id" | "created_at">; Update: Partial<Omit<CategoryRow, "id" | "created_at">>; Relationships: [] };
      tags: { Row: TagRow; Insert: Omit<TagRow, "id" | "created_at">; Update: Partial<Omit<TagRow, "id" | "created_at">>; Relationships: [] };
      article_tags: { Row: ArticleTagRow; Insert: ArticleTagRow; Update: Partial<ArticleTagRow>; Relationships: [] };
      portfolio_cases: { Row: PortfolioCaseRow; Insert: Omit<PortfolioCaseRow, "id" | "created_at" | "updated_at">; Update: Partial<Omit<PortfolioCaseRow, "id" | "created_at" | "updated_at">>; Relationships: [] };
      services: { Row: ServiceRow; Insert: Omit<ServiceRow, "id" | "created_at" | "updated_at">; Update: Partial<Omit<ServiceRow, "id" | "created_at" | "updated_at">>; Relationships: [] };
      testimonials: { Row: TestimonialRow; Insert: Omit<TestimonialRow, "id" | "created_at">; Update: Partial<Omit<TestimonialRow, "id" | "created_at">>; Relationships: [] };
      leads: { Row: LeadRow; Insert: Omit<LeadRow, "id" | "created_at" | "updated_at">; Update: Partial<Omit<LeadRow, "id" | "created_at" | "updated_at">>; Relationships: [] };
      newsletter_subs: { Row: NewsletterSubRow; Insert: Omit<NewsletterSubRow, "id" | "subscribed_at">; Update: Partial<Omit<NewsletterSubRow, "id" | "subscribed_at">>; Relationships: [] };
      courses: { Row: CourseRow; Insert: Omit<CourseRow, "id" | "created_at" | "updated_at">; Update: Partial<Omit<CourseRow, "id" | "created_at" | "updated_at">>; Relationships: [] };
      resources: { Row: ResourceRow; Insert: Omit<ResourceRow, "id" | "created_at" | "updated_at" | "download_count">; Update: Partial<Omit<ResourceRow, "id" | "created_at" | "updated_at">>; Relationships: [] };
      media_items: { Row: MediaItemRow; Insert: Omit<MediaItemRow, "id" | "created_at">; Update: Partial<Omit<MediaItemRow, "id" | "created_at">>; Relationships: [] };
      site_config: { Row: SiteConfigRow; Insert: Omit<SiteConfigRow, "updated_at">; Update: Partial<Omit<SiteConfigRow, "updated_at">>; Relationships: [] };
      authors: { Row: AuthorRow; Insert: Omit<AuthorRow, "id" | "created_at" | "updated_at">; Update: Partial<Omit<AuthorRow, "id" | "created_at" | "updated_at">>; Relationships: [] };
      error_reports: { Row: ErrorReportRow; Insert: Omit<ErrorReportRow, "id" | "created_at">; Update: Partial<Omit<ErrorReportRow, "id" | "created_at">>; Relationships: [] };
      user_profiles: { Row: UserProfileRow; Insert: Omit<UserProfileRow, "created_at">; Update: Partial<Omit<UserProfileRow, "id" | "created_at">>; Relationships: [] };
      internal_tickets: { Row: InternalTicketRow; Insert: Omit<InternalTicketRow, "id" | "created_at" | "updated_at" | "status" | "admin_response">; Update: Partial<Omit<InternalTicketRow, "id" | "created_at">>; Relationships: [] };
      password_reset_requests: { Row: PasswordResetRequestRow; Insert: Omit<PasswordResetRequestRow, "id" | "created_at" | "status" | "resolved_at">; Update: Partial<Omit<PasswordResetRequestRow, "id" | "created_at">>; Relationships: [] };
      activity_log: { Row: ActivityLogRow; Insert: Omit<ActivityLogRow, "id" | "created_at">; Update: Partial<Omit<ActivityLogRow, "id" | "created_at">>; Relationships: [] };
      comments: { Row: CommentRow; Insert: Omit<CommentRow, "id" | "created_at" | "likes" | "reports">; Update: Partial<Omit<CommentRow, "id" | "created_at">>; Relationships: [] };
      institutional_pages: { Row: InstitutionalPageRow; Insert: Omit<InstitutionalPageRow, "updated_at">; Update: Partial<Omit<InstitutionalPageRow, "slug" | "updated_at">>; Relationships: [] };
      page_views: { Row: PageViewRow; Insert: Omit<PageViewRow, "id" | "created_at">; Update: Partial<Omit<PageViewRow, "id" | "created_at">>; Relationships: [] };
      ad_slots: { Row: AdSlotRow; Insert: Omit<AdSlotRow, "updated_at">; Update: Partial<Omit<AdSlotRow, "key" | "updated_at">>; Relationships: [] };
      ads: { Row: AdRow; Insert: Omit<AdRow, "id" | "created_at" | "updated_at">; Update: Partial<Omit<AdRow, "id" | "created_at" | "updated_at">>; Relationships: [] };
      ad_targets: { Row: AdTargetRow; Insert: AdTargetRow; Update: Partial<AdTargetRow>; Relationships: [] };
      ad_events: { Row: AdEventRow; Insert: Omit<AdEventRow, "id" | "created_at">; Update: Partial<Omit<AdEventRow, "id" | "created_at">>; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

export type Article = ArticleRow;
export type Category = CategoryRow;
export type Tag = TagRow;
export type PortfolioCase = PortfolioCaseRow;
export type Service = ServiceRow;
export type Testimonial = TestimonialRow;
export type Lead = LeadRow;
export type NewsletterSub = NewsletterSubRow;
export type Course = CourseRow;
export type Resource = ResourceRow;
export type MediaItem = MediaItemRow;
export type Author = AuthorRow;
export type ErrorReport = ErrorReportRow;
export type UserProfile = UserProfileRow;
export type InternalTicket = InternalTicketRow;
export type PasswordResetRequest = PasswordResetRequestRow;
export type ActivityLog = ActivityLogRow;
export type Comment = CommentRow;
export type PageView = PageViewRow;
export type AdSlot = AdSlotRow;
export type Ad = AdRow;
export type AdTarget = AdTargetRow;
export type AdEvent = AdEventRow;
export type InstitutionalPage = InstitutionalPageRow;
