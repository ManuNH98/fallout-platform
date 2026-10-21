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
  { slug: "hermandad-del-acero", title: "Hermandad del Acero", summary: "Una orden militar que protege la tecnología anterior a la guerra y discute quién merece custodiarla.", category: "Facción", game: "Varios juegos", gameSlugs: ["fallout-new-vegas", "fallout-4", "fallout-3", "fallout-76"], categorySlugs: ["facciones"], readTime: "8 min", index: "ARCHIVO 001" },
  { slug: "mr-house", title: "Robert House", summary: "El empresario que predijo el fin del mundo y despertó con un plan para gobernar lo que quedaba.", category: "Personaje", game: "New Vegas", gameSlugs: ["fallout-new-vegas"], categorySlugs: ["personajes"], readTime: "6 min", index: "ARCHIVO 002" },
  { slug: "vault-111", title: "Refugio 111", summary: "Un experimento criogénico bajo el hielo de Massachusetts, diseñado para observar desde dentro.", category: "Lugar", game: "Fallout 4", gameSlugs: ["fallout-4"], categorySlugs: ["lugares"], readTime: "5 min", index: "ARCHIVO 003" },
  { slug: "supermutante", title: "Supermutante", summary: "La mutación transforma a los habitantes del Yermo y deja nuevas amenazas en el camino de los supervivientes.", category: "Criatura", game: "Varios juegos", gameSlugs: ["fallout-new-vegas", "fallout-4", "fallout-3", "fallout-76"], categorySlugs: ["criaturas"], readTime: "4 min", index: "ARCHIVO 004" },
  { slug: "rifle-laser", title: "Rifle láser", summary: "Un arma de energía que convierte la tecnología del viejo mundo en una herramienta de supervivencia.", category: "Arma", game: "Varios juegos", gameSlugs: ["fallout-new-vegas", "fallout-4", "fallout-3", "fallout-76"], categorySlugs: ["armas"], readTime: "3 min", index: "ARCHIVO 005" },
  { slug: "gran-guerra", title: "La Gran Guerra", summary: "El conflicto nuclear de 2077 marca la ruptura entre el mundo anterior a las bombas y las historias del Yermo.", category: "Historia", game: "Varios juegos", gameSlugs: ["fallout-new-vegas", "fallout-4", "fallout-3", "fallout-76"], categorySlugs: ["historia"], readTime: "5 min", index: "ARCHIVO 006" },
  { slug: "refugio-76", title: "Refugio 76", summary: "Un punto de partida para explorar Appalachia y descubrir qué queda del mundo exterior.", category: "Lugar e historia", game: "Fallout 76", gameSlugs: ["fallout-76"], categorySlugs: ["lugares", "historia"], readTime: "4 min", index: "ARCHIVO 007" },
  { slug: "diamond-city", title: "Diamond City", summary: "Un asentamiento entre las gradas de un antiguo estadio, donde el Commonwealth encuentra un lugar para comerciar y escuchar rumores.", category: "Lugar", game: "Fallout 4", gameSlugs: ["fallout-4"], categorySlugs: ["lugares"], readTime: "4 min", index: "ARCHIVO 008" },
];

export const featuredArticles: WikiArticleSummary[] = wikiArticles.slice(0, 3);
