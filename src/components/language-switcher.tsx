"use client";

import { usePathname, useRouter } from "next/navigation";
import { Check, Globe } from "lucide-react";
import { routing, type Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  "pt-br": "Portuguese",
  es: "Spanish",
  vi: "Vietnamese",
};

export function LanguageSwitcher({ locale }: { locale: string }) {
  const pathname = usePathname();
  const router = useRouter();

  if (!routing.locales.includes(locale as Locale)) return null;
  if (routing.locales.length <= 1) return null;

  const handleSwitch = (nextLocale: Locale) => {
    if (nextLocale === locale) return;

    const localePattern = new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`);
    const pathWithoutLocale = pathname.replace(localePattern, "") || "/";
    const newPath = `/${nextLocale}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`;

    document.cookie = `NEXT_LOCALE=${nextLocale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
    router.push(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
          <Globe className="h-4 w-4" />
          <span>{LOCALE_LABELS[locale as Locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {routing.locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleSwitch(loc)}
            className="flex items-center justify-between gap-3"
          >
            <span>{LOCALE_LABELS[loc]}</span>
            {loc === (locale as Locale) && <Check className="h-4 w-4 text-[hsl(var(--nav-theme))]" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
