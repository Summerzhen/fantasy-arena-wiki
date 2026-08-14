import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Swords } from "lucide-react";
import { getMessages } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { AdUnitBox, DesktopLeftStickyAd } from "@/components/ad-units";
import { getAllContent, getAllContentPaths, getContent, getDynamicNavigation, type ContentItem } from "@/lib/content";
import { Breadcrumbs, JsonLd, WikiSidebar, localizeHref } from "@/components/site";
import { MobileTOC, SidebarTOC } from "@/components/table-of-contents";
import { CONTENT_TYPES } from "@/config/navigation";
import { routing, type Locale } from "@/i18n/routing";
import en from "@/locales/en.json";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fantasyarena.wiki";
type Messages = typeof en;

function languageAlternates(pathname: string) {
  return Object.fromEntries(routing.locales.map((locale) => [locale, `/${locale}${pathname}`]));
}

const workingCodes = [
  { code: "750Likes", reward: "Burger Points reward", notes: "Like milestone code" },
  { code: "Magma", reward: "Burger Points reward", notes: "Magma update code" },
  { code: "HardMode", reward: "In-game reward", notes: "Hard mode related reward" },
  { code: "gullible", reward: "100 Burgers", notes: "Good early upgrade boost" },
];

const codesOverviewLabels = {
  en: { checked: "Last checked: August 12, 2026", badge: "Working Codes", code: "Code", reward: "Reward", status: "Status", notes: "Notes", active: "Active", redeem: "How to redeem codes", tier: "Tier list", classes: "Classes" },
  "pt-br": { checked: "Ultima verificacao: 12 de agosto de 2026", badge: "Codigos ativos", code: "Codigo", reward: "Recompensa", status: "Status", notes: "Observacao", active: "Ativo", redeem: "Como resgatar codigos", tier: "Tier list", classes: "Classes" },
  es: { checked: "Ultima revision: 12 de agosto de 2026", badge: "Codigos activos", code: "Codigo", reward: "Recompensa", status: "Estado", notes: "Notas", active: "Activo", redeem: "Como canjear codigos", tier: "Tier list", classes: "Clases" },
  vi: { checked: "Lan kiem tra gan nhat: 12 thang 8 2026", badge: "Ma dang hoat dong", code: "Ma", reward: "Phan thuong", status: "Trang thai", notes: "Ghi chu", active: "Dang hoat dong", redeem: "Cach nhap ma", tier: "Tier list", classes: "Classes" },
} satisfies Record<Locale, Record<string, string>>;

export async function generateStaticParams() {
  const paths = await getAllContentPaths("en");
  const listingPages = CONTENT_TYPES.map((ct) => ({ slug: [ct] }));
  return [...listingPages, ...paths.map((item) => ({ slug: [item.contentType, ...item.slug] }))];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; slug: string[] }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const messages = (await getMessages({ locale })) as Messages;
  if (slug.length === 1 && CONTENT_TYPES.includes(slug[0])) {
    const ct = slug[0];
    const ctTitle = ct.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const ctMessages = (messages as unknown as Record<string, { overviewTitle?: string; overviewDescription?: string; meta?: { title?: string; description?: string } }>)[ct];
    const title = ctMessages?.meta?.title || ctMessages?.overviewTitle || `${ctTitle} - Fantasy Arena Wiki`;
    const description = ctMessages?.meta?.description || ctMessages?.overviewDescription || `Browse all ${ctTitle.toLowerCase()} guides and resources for Fantasy Arena.`;
    return { title, description, alternates: { canonical: `/${locale}/${ct}`, languages: languageAlternates(`/${ct}`) }, openGraph: { title, description, url: `${siteUrl}/${locale}/${ct}`, images: [`${siteUrl}/images/hero.webp`] } };
  }
  const [contentType, ...articleSlug] = slug;
  const item = await getContent(contentType, articleSlug, locale);
  if (!item) return { title: "Not Found" };
  const pathname = `/${contentType}/${articleSlug.join("/")}`;
  const image = item.metadata.image?.startsWith("http") ? item.metadata.image : `${siteUrl}${item.metadata.image ?? "/images/hero.webp"}`;
  return { title: `${item.metadata.title} - Fantasy Arena Wiki`, description: item.metadata.description, alternates: { canonical: `/${locale}${pathname}`, languages: languageAlternates(pathname) }, openGraph: { type: "article", title: item.metadata.title, description: item.metadata.description, url: `${siteUrl}/${locale}${pathname}`, images: [image] }, twitter: { card: "summary_large_image", images: [image] } };
}

export default async function SlugPage({ params }: { params: Promise<{ locale: Locale; slug: string[] }> }) {
  const { locale, slug } = await params;
  const navGroups = getDynamicNavigation(locale);
  if (slug.length === 1) return <NavigationPage locale={locale} contentType={slug[0]} navGroups={navGroups} />;
  return <DetailPage locale={locale} contentType={slug[0]} slug={slug.slice(1)} navGroups={navGroups} />;
}

async function NavigationPage({ locale, contentType, navGroups }: { locale: Locale; contentType: string; navGroups: import("@/lib/content").NavGroup[] }) {
  if (!CONTENT_TYPES.includes(contentType)) notFound();
  const messages = (await getMessages({ locale })) as Messages;
  const items = await getAllContent(contentType, locale);
  const listData = { "@context": "https://schema.org", "@type": "ItemList", name: `${contentType} - Fantasy Arena Wiki`, itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, url: `${siteUrl}/${locale}/${contentType}/${item.slug}`, name: item.metadata.title })) };

  // 读取分类标题（优先用 locale JSON 里的，没有就转 slug）
  const sectionTitle = (messages as unknown as Record<string, Record<string, string>>)[contentType]?.overviewTitle
    || contentType.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const sectionDesc = (messages as unknown as Record<string, Record<string, string>>)[contentType]?.overviewDescription || "";

  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><JsonLd data={listData} /><div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]"><article><Breadcrumbs items={[{ label: messages.shared.home, href: localizeHref("/", locale) }, { label: sectionTitle }]} /><h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">{sectionTitle}</h1>{sectionDesc && <p className="mt-5 text-lg leading-8 text-muted-foreground">{sectionDesc}</p>}{contentType === "codes" && <CodesOverview locale={locale} />}{locale === "en" && <HubNextSteps contentType={contentType} />}<AdUnitBox unit="native" className="mt-8" />{items.length > 0 && <><div className="mt-10 grid gap-4 sm:grid-cols-2">{items.map((item) => <Link key={`/${contentType}/${item.slug}`} href={localizeHref(`/${contentType}/${item.slug}`, locale)} className="group rounded-2xl border border-border bg-card/70 p-5 transition hover:-translate-y-0.5 hover:border-[hsl(var(--nav-theme-light))]"><div className="mb-4 flex items-center justify-between gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-[hsl(var(--nav-theme))]"><Swords className="h-5 w-5" /></span>{item.metadata.badge && <Badge variant="secondary">{item.metadata.badge}</Badge>}</div><h3 className="text-lg font-bold text-foreground group-hover:text-[hsl(var(--nav-theme))]">{item.metadata.title}</h3><p className="mt-2 min-h-[3rem] text-sm leading-6 text-muted-foreground">{item.metadata.description}</p><span className="mt-4 inline-flex items-center text-sm font-semibold text-[hsl(var(--nav-theme))]">{messages.shared.readMore}<ChevronRight className="ml-1 h-4 w-4" /></span></Link>)}</div></>}{items.length === 0 && <p className="mt-8 text-muted-foreground">{messages.shared.noGuidesAvailable}</p>}</article><aside className="space-y-6"><div className="hidden lg:block"><AdUnitBox unit="tower" className="lg:sticky lg:top-24" /></div><WikiSidebar locale={locale} navGroups={navGroups} currentPath={`/${contentType}`} /></aside></div></main>;
}

function CodesOverview({ locale }: { locale: Locale }) {
  const labels = codesOverviewLabels[locale];
  return <section className="mt-8 rounded-2xl border border-border bg-card/70 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-semibold text-[hsl(var(--nav-theme))]">{labels.checked}</p><Badge className="bg-emerald-600 text-white">{labels.badge}</Badge></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="border-b border-border text-muted-foreground"><tr><th className="py-3 pr-4 font-semibold">{labels.code}</th><th className="py-3 pr-4 font-semibold">{labels.reward}</th><th className="py-3 pr-4 font-semibold">{labels.status}</th><th className="py-3 font-semibold">{labels.notes}</th></tr></thead><tbody>{workingCodes.map((item) => <tr key={item.code} className="border-b border-border/70 last:border-0"><td className="py-3 pr-4"><code className="rounded-md bg-background px-2 py-1 font-mono font-bold text-foreground">{item.code}</code></td><td className="py-3 pr-4 text-muted-foreground">{item.reward}</td><td className="py-3 pr-4"><Badge variant="secondary">{labels.active}</Badge></td><td className="py-3 text-muted-foreground">{item.notes}</td></tr>)}</tbody></table></div><div className="mt-5 flex flex-wrap gap-3"><Link href={localizeHref("/codes/fantasy-arena-codes", locale)} className="inline-flex items-center text-sm font-semibold text-[hsl(var(--nav-theme))] hover:underline">{labels.redeem}<ChevronRight className="ml-1 h-4 w-4" /></Link><Link href={localizeHref("/tier", locale)} className="inline-flex items-center text-sm font-semibold text-[hsl(var(--nav-theme))] hover:underline">{labels.tier}<ChevronRight className="ml-1 h-4 w-4" /></Link><Link href={localizeHref("/classes", locale)} className="inline-flex items-center text-sm font-semibold text-[hsl(var(--nav-theme))] hover:underline">{labels.classes}<ChevronRight className="ml-1 h-4 w-4" /></Link></div></section>;
}

const hubNextSteps: Record<string, { title: string; answer: string; links: Array<{ href: string; label: string }> }> = {
  classes: {
    title: "Which Fantasy Arena class is best?",
    answer: "Mage-style setups are the safest starting recommendation in the current class tier list, but the best choice still depends on your wand, traits, and wave goal.",
    links: [
      { href: "/tier/fantasy-arena-class-tier-list", label: "Compare the class tier list" },
      { href: "/wands", label: "Match a wand" },
      { href: "/builds", label: "Finish the build" },
    ],
  },
  tier: {
    title: "Start with the class tier list",
    answer: "The class tier list is the strongest validated long-tail page in this section. Use it first, then compare wands and complete builds instead of treating a tier ranking as a standalone answer.",
    links: [
      { href: "/tier/fantasy-arena-class-tier-list", label: "Fantasy Arena class tier list" },
      { href: "/classes", label: "Browse classes" },
      { href: "/wands", label: "Compare wands" },
    ],
  },
  wands: {
    title: "Which Fantasy Arena wand is best?",
    answer: "There is no single best wand for every run. Compare the wand's damage role, range, cooldown, class fit, and trait fit before choosing a build.",
    links: [
      { href: "/wands/fantasy-arena-best-wands", label: "Best wands guide" },
      { href: "/tier/fantasy-arena-wand-tier-list", label: "Wand tier list" },
      { href: "/wands/fantasy-arena-rolled-phoenix-wand", label: "Rolled Phoenix Wand" },
    ],
  },
  builds: {
    title: "Choose a build by your run goal",
    answer: "Use the build hub to move directly into an overall, solo, high-wave, or boss setup, then check that its class, wand, and traits all support the same job.",
    links: [
      { href: "/builds/fantasy-arena-best-builds", label: "Best builds" },
      { href: "/builds/fantasy-arena-solo-build", label: "Solo build" },
      { href: "/builds/fantasy-arena-high-waves-build", label: "High-waves build" },
    ],
  },
  guide: {
    title: "Fantasy Arena tips, waves, and how to play",
    answer: "Use this section for progression and wave guidance. Current redemption codes live on the dedicated Codes page so guide and reward searches have one clear destination each.",
    links: [
      { href: "/guide/fantasy-arena-tips", label: "Beginner tips" },
      { href: "/guide/fantasy-arena-waves", label: "Wave guide" },
      { href: "/codes", label: "Working codes" },
    ],
  },
};

function HubNextSteps({ contentType }: { contentType: string }) {
  const content = hubNextSteps[contentType];
  if (!content) return null;

  return <section className="mt-8 rounded-2xl border border-border bg-card/70 p-5"><h2 className="text-xl font-bold text-foreground">{content.title}</h2><p className="mt-2 leading-7 text-muted-foreground">{content.answer}</p><div className="mt-4 flex flex-wrap gap-3">{content.links.map((link) => <Link key={link.href} href={`/en${link.href}`} className="inline-flex items-center text-sm font-semibold text-[hsl(var(--nav-theme))] hover:underline">{link.label}<ChevronRight className="ml-1 h-4 w-4" /></Link>)}</div></section>;
}

async function DetailPage({ locale, contentType, slug, navGroups }: { locale: Locale; contentType: string; slug: string[]; navGroups: import("@/lib/content").NavGroup[] }) {
  if (!CONTENT_TYPES.includes(contentType)) notFound();
  const messages = (await getMessages({ locale })) as Messages;
  const item = await getContent(contentType, slug, locale);
  if (!item) notFound();
  const pathname = `/${contentType}/${slug.join("/")}`;
  const tocLabel = messages.shared.tableOfContents || messages.shared.inThisSection || "Table of Contents";
  const sectionLabel = contentType.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const articleImage = item.metadata.image?.startsWith("http") ? item.metadata.image : `${siteUrl}${item.metadata.image ?? "/images/hero.webp"}`;
  const articleData = { "@context": "https://schema.org", "@type": "Article", headline: item.metadata.title, description: item.metadata.description, image: articleImage, datePublished: item.metadata.date, dateModified: item.metadata.lastModified ?? item.metadata.date, mainEntityOfPage: `${siteUrl}/${locale}${pathname}`, author: { "@type": "Organization", name: "Fantasy Arena Wiki" }, publisher: { "@type": "Organization", name: "Fantasy Arena Wiki", logo: { "@type": "ImageObject", url: `${siteUrl}/android-chrome-512x512.png` } } };
  const breadcrumbData = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/${locale}` }, { "@type": "ListItem", position: 2, name: sectionLabel, item: `${siteUrl}/${locale}/${contentType}` }, { "@type": "ListItem", position: 3, name: item.metadata.title, item: `${siteUrl}/${locale}${pathname}` }] };

  const relatedLabel = messages.shared.relatedGuides || "Related Guides";

  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><DesktopLeftStickyAd /><JsonLd data={articleData} /><JsonLd data={breadcrumbData} /><div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]"><article><Breadcrumbs items={[{ label: messages.shared.home, href: localizeHref("/", locale) }, { label: sectionLabel, href: localizeHref(`/${contentType}`, locale) }, { label: item.metadata.title }]} /><h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">{item.metadata.title}</h1><p className="mt-5 text-lg leading-8 text-muted-foreground">{item.metadata.summary ?? item.metadata.description}</p><MobileTOC headings={item.headings} label={tocLabel} /><AdUnitBox unit="rectangle" className="mt-8" /><div className="prose-invert mt-10 max-w-none"><item.MDXContent /></div><ArticleCards locale={locale} contentType={contentType} currentSlug={slug.join("/")} relatedLabel={relatedLabel} /></article><aside className="space-y-6"><div className="hidden lg:block"><AdUnitBox unit="tower" className="lg:sticky lg:top-24" /></div><SidebarTOC headings={item.headings} label={tocLabel} currentPathname={pathname} /><WikiSidebar locale={locale} navGroups={navGroups} currentPath={pathname} /></aside></div></main>;
}

async function ArticleCards({ locale, contentType, currentSlug, relatedLabel }: { locale: string; contentType: string; currentSlug: string; relatedLabel: string }) {
  // 动态获取同分类其他文章（排除当前文章）
  const allItems = await getAllContent(contentType, locale as Locale);
  const related = allItems.filter((item) => item.slug !== currentSlug).slice(0, 4);

  if (related.length === 0) return null;

  return <div className="mt-12 space-y-8"><section><h3 className="text-xl font-bold text-foreground">{relatedLabel}</h3><div className="mt-4 grid gap-4 sm:grid-cols-2">{related.map((item) => <SmallCard key={item.slug} icon={<Swords className="h-5 w-5" />} title={item.metadata.title} description={item.metadata.description} href={localizeHref(`/${contentType}/${item.slug}`, locale)} />)}</div></section></div>;
}

function SmallCard({ title, description, href, icon }: { title: string; description: string; href: string; icon?: React.ReactNode }) { return <Link href={href} className="block rounded-2xl border border-border bg-card/70 p-5 transition hover:border-[hsl(var(--nav-theme-light))]">{icon && <div className="mb-3 text-[hsl(var(--nav-theme))]">{icon}</div>}<h4 className="font-bold text-foreground">{title}</h4><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></Link>; }
