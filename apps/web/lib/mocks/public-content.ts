import type { GameSummary, WikiArticleSummary, WikiCategorySummary } from "@repo/types";

export const featuredGames: GameSummary[] = [
  { slug: "fallout-new-vegas", title: "New Vegas", subtitle: "Fallout: New Vegas", era: "2281", setting: "Mojave", number: "01", tone: "amber" },
  { slug: "fallout-4", title: "El Commonwealth", subtitle: "Fallout 4", era: "2287", setting: "Boston", number: "02", tone: "sage" },
  { slug: "fallout-3", title: "La Capital", subtitle: "Fallout 3", era: "2277", setting: "Washington D. C.", number: "03", tone: "blue" },
  { slug: "fallout-76", title: "Appalachia", subtitle: "Fallout 76", era: "2102", setting: "Virginia Occidental", number: "04", tone: "rust" },
];

export const wikiCategories: WikiCategorySummary[] = [
  { slug: "personajes", title: "Personajes", description: "Vidas que cambiaron el rumbo del Yermo.", countLabel: "01 / BIOGRAFÍAS", index: "A" },
  { slug: "facciones", title: "Facciones", description: "Alianzas, ideales y guerras sin final.", countLabel: "02 / ORGANIZACIONES", index: "B" },
  { slug: "lugares", title: "Lugares", description: "Refugios, asentamientos y ruinas.", countLabel: "03 / LOCALIZACIONES", index: "C" },
  { slug: "criaturas", title: "Criaturas", description: "La evolución encontró su propio camino.", countLabel: "04 / FAUNA", index: "D" },
  { slug: "armas", title: "Armas y equipo", description: "Herramientas para sobrevivir un día más.", countLabel: "05 / OBJETOS", index: "E" },
  { slug: "historia", title: "Historia y mundo", description: "Lo que quedó antes y después de las bombas.", countLabel: "06 / ARCHIVOS", index: "F" },
];

export const wikiArticles: WikiArticleSummary[] = [
  { slug: "hermandad-del-acero", title: "Hermandad del Acero", summary: "Una orden militar que protege la tecnología anterior a la guerra y discute quién merece custodiarla.", category: "Facción", game: "Varios juegos", readTime: "8 min", index: "ARCHIVO 001" },
  { slug: "mr-house", title: "Robert House", summary: "El empresario que predijo el fin del mundo y despertó con un plan para gobernar lo que quedaba.", category: "Personaje", game: "New Vegas", readTime: "6 min", index: "ARCHIVO 002" },
  { slug: "vault-111", title: "Refugio 111", summary: "Un experimento criogénico bajo el hielo de Massachusetts, diseñado para observar desde dentro.", category: "Lugar", game: "Fallout 4", readTime: "5 min", index: "ARCHIVO 003" },
];

export const featuredArticles: WikiArticleSummary[] = wikiArticles.slice(0, 3);
