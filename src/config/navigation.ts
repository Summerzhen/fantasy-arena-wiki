import { BookOpen, Code2, Gem, Hammer, Swords, Sparkles, Trophy, Wand2, Zap } from "lucide-react";

export const NAVIGATION_CONFIG = [
  { key: "codes", path: "/codes", icon: Code2, isContentType: true },
  { key: "tier", path: "/tier", icon: Trophy, isContentType: true },
  { key: "classes", path: "/classes", icon: Sparkles, isContentType: true },
  { key: "wands", path: "/wands", icon: Wand2, isContentType: true },
  { key: "builds", path: "/builds", icon: Hammer, isContentType: true },
  { key: "traits", path: "/traits", icon: Gem, isContentType: true },
  { key: "bosses", path: "/bosses", icon: Swords, isContentType: true },
  { key: "summons", path: "/summons", icon: Zap, isContentType: true },
  { key: "guide", path: "/guide", icon: BookOpen, isContentType: true },
] as const;

export const CONTENT_TYPES = NAVIGATION_CONFIG.filter((item) => item.isContentType).map((item) => item.path.replace(/^\//, ""));
