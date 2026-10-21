import type { GameDetail } from "@repo/types";

export const gameContent: readonly Pick<GameDetail, "slug" | "summary" | "description">[] = [
  {
    slug: "fallout-new-vegas",
    summary: "Un recorrido por el Mojave, donde las rutas del desierto conducen a New Vegas y a distintas visiones del futuro del Yermo.",
    description: "El Mojave reúne caminos polvorientos, asentamientos y una ciudad que sigue atrayendo a quienes buscan una oportunidad. La exploración permite conocer a sus habitantes y descubrir qué espera cada grupo del futuro. Esta ficha conecta ese escenario con los primeros artículos de nuestro archivo, desde Robert House hasta la tecnología que todavía circula por el desierto.",
  },
  {
    slug: "fallout-4",
    summary: "Del Refugio 111 a las calles de Boston: una mirada al Commonwealth y a las comunidades que buscan hacerse un lugar entre sus ruinas.",
    description: "El Commonwealth conserva las huellas de Boston junto a nuevas formas de vivir entre sus restos. Refugios, mercados y caminos enlazan historias de quienes intentan encontrar seguridad y recursos. Los artículos de esta selección permiten empezar por el Refugio 111, continuar hasta Diamond City y explorar parte del equipo y las facciones de este mundo.",
  },
  {
    slug: "fallout-3",
    summary: "El Yermo Capital transforma Washington D. C. en un paisaje de ruinas, refugios y encuentros con quienes todavía intentan sobrevivir.",
    description: "La exploración del Yermo Capital recorre los restos de una ciudad y los caminos que la conectan con sus alrededores. Entre edificios y asentamientos aparecen amenazas, recursos y distintas maneras de entender la supervivencia. La Hermandad del Acero y los supermutantes ofrecen dos puntos de entrada al archivo de este escenario.",
  },
  {
    slug: "fallout-76",
    summary: "Appalachia abre sus caminos a quienes salen del Refugio 76 para explorar Virginia Occidental y volver a conocer el mundo exterior.",
    description: "Bosques, carreteras y poblaciones forman el paisaje de Appalachia. La salida del refugio invita a orientarse, reunir suministros y descubrir las señales que han quedado en el territorio. El año de referencia de esta ficha sitúa ese comienzo; los artículos asociados permiten explorar el Refugio 76 y el contexto del mundo posterior a las bombas.",
  },
];
