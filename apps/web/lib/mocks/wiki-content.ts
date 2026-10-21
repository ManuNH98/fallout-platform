import type { WikiArticleDetail, WikiSourceSummary } from "@repo/types";

export const wikiSources: readonly WikiSourceSummary[] = [
  { id: "fallout-3-hermandad", title: "Fallout 3", reference: "Fuente primaria: encuentros y conversaciones con la Hermandad del Acero en la Ciudadela." },
  { id: "new-vegas-house", title: "Fallout: New Vegas", reference: "Fuente primaria: conversaciones con Robert House en el Lucky 38." },
  { id: "fallout-4-refugio", title: "Fallout 4", reference: "Fuente primaria: secuencia inicial, exploración y terminales del Refugio 111." },
  { id: "fallout-3-supermutantes", title: "Fallout 3", reference: "Fuente primaria: encuentros con supermutantes durante la exploración del Yermo Capital." },
  { id: "fallout-4-laser", title: "Fallout 4", reference: "Fuente primaria: ficha del rifle láser en el inventario y modificaciones en el banco de armas." },
  { id: "fallout-4-guerra", title: "Fallout 4", reference: "Fuente primaria: prólogo anterior a las bombas y entrada al Refugio 111." },
  { id: "fallout-76-refugio", title: "Fallout 76", reference: "Fuente primaria: inicio del juego y salida del Refugio 76 durante el Día de la Recuperación." },
  { id: "fallout-4-diamond-city", title: "Fallout 4", reference: "Fuente primaria: exploración de Diamond City y conversaciones en su mercado." },
];

interface WikiArticleMockContent extends Pick<WikiArticleDetail, "bodyMarkdown"> {
  slug: string;
  sourceIds: readonly string[];
  relatedSlugs: readonly string[];
}

export const wikiArticleContent: readonly WikiArticleMockContent[] = [
  {
    slug: "hermandad-del-acero",
    bodyMarkdown: `## Descripción

La **Hermandad del Acero** es una organización militar vinculada a la recuperación y conservación de tecnología. Sus miembros recorren el Yermo en busca de conocimientos y equipos del mundo anterior a las bombas.

## Presencia en el Yermo

La organización aparece en distintos juegos, con grupos que responden a circunstancias y prioridades propias. En Fallout 3, la Ciudadela es un lugar para conocer a sus miembros y escuchar su visión del Yermo Capital.

El [rifle láser](/wiki/rifle-laser) permite explorar otra cara de ese legado tecnológico. La [Gran Guerra](/wiki/gran-guerra) sitúa el origen del mundo que la Hermandad intenta comprender y controlar.`,
    sourceIds: ["fallout-3-hermandad"],
    relatedSlugs: ["rifle-laser", "gran-guerra"],
  },
  {
    slug: "mr-house",
    bodyMarkdown: `## Descripción

**Robert House**, conocido como Mr. House, es una de las figuras centrales de Fallout: New Vegas. Desde el Lucky 38, presenta al Mensajero su proyecto para el futuro de la ciudad.

## Un proyecto para New Vegas

Sus conversaciones permiten conocer cómo entiende el poder, la tecnología y la reconstrucción. Escucharlo ayuda a situar una de las perspectivas que compiten por dar forma al Mojave.

Su historia conecta el mundo anterior a la [Gran Guerra](/wiki/gran-guerra) con las decisiones que todavía se toman entre sus ruinas.`,
    sourceIds: ["new-vegas-house"],
    relatedSlugs: ["gran-guerra"],
  },
  {
    slug: "vault-111",
    bodyMarkdown: `## Descripción

El **Refugio 111** es el punto de partida de Fallout 4. Bajo su apariencia de refugio frente a las bombas, sus instalaciones albergan un experimento de conservación criogénica.

## Entre dos épocas

Recorrer sus pasillos y consultar sus terminales permite reconstruir lo que ocurrió dentro. El contraste entre la entrada y la salida del refugio presenta la distancia entre el mundo anterior a las bombas y el Commonwealth.

La [Gran Guerra](/wiki/gran-guerra) explica el comienzo de ese recorrido. Más allá del refugio, [Diamond City](/wiki/diamond-city) muestra una forma distinta de buscar seguridad.`,
    sourceIds: ["fallout-4-refugio"],
    relatedSlugs: ["gran-guerra", "diamond-city"],
  },
  {
    slug: "supermutante",
    bodyMarkdown: `## Descripción

Los **supermutantes** forman parte de las criaturas que pueblan el universo Fallout. Su presencia transforma muchos recorridos por el Yermo en encuentros que conviene preparar con cuidado.

## Encuentros en el Yermo Capital

En Fallout 3 pueden encontrarse durante la exploración. Observar su equipo y su entorno permite decidir cuándo combatir, buscar otra ruta o reservar recursos para más adelante.

El [rifle láser](/wiki/rifle-laser) es una de las armas de energía que aparecen en este universo. Para conocer otra organización presente en el Yermo Capital, consulta la [Hermandad del Acero](/wiki/hermandad-del-acero).`,
    sourceIds: ["fallout-3-supermutantes"],
    relatedSlugs: ["rifle-laser", "hermandad-del-acero"],
  },
  {
    slug: "rifle-laser",
    bodyMarkdown: `## Descripción

El **rifle láser** pertenece a la familia de armas de energía de Fallout. Su funcionamiento lo distingue de las armas de proyectiles y lo vincula a la tecnología que sobrevivió a las bombas.

## Equipo y modificaciones

En Fallout 4, el inventario permite consultar sus características y el banco de armas ofrece modificaciones. El equipo concreto determina sus prestaciones; esta ficha de muestra no fija estadísticas universales para todos los juegos.

La [Hermandad del Acero](/wiki/hermandad-del-acero) ofrece otro punto de entrada para explorar la relación entre tecnología y poder en el Yermo.`,
    sourceIds: ["fallout-4-laser"],
    relatedSlugs: ["hermandad-del-acero"],
  },
  {
    slug: "gran-guerra",
    bodyMarkdown: `## Descripción

La **Gran Guerra** es el conflicto nuclear de 2077 que separa el mundo anterior a las bombas del paisaje en el que transcurren las aventuras de Fallout.

## El mundo después de las bombas

El prólogo de Fallout 4 muestra esa ruptura a través de una familia que busca llegar al [Refugio 111](/wiki/vault-111). La vida cotidiana da paso a una emergencia que cambia el sentido del refugio y del mundo exterior.

Mucho después, lugares como el [Refugio 76](/wiki/refugio-76) permiten explorar las distintas respuestas a la tarea de volver a salir y reconstruir.`,
    sourceIds: ["fallout-4-guerra"],
    relatedSlugs: ["vault-111", "refugio-76"],
  },
  {
    slug: "refugio-76",
    bodyMarkdown: `## Descripción

El **Refugio 76** es el lugar desde el que comienza el recorrido por Appalachia en Fallout 76. La salida durante el Día de la Recuperación presenta un mundo que sus habitantes deben volver a conocer.

## Primeros pasos en Appalachia

La transición del interior al exterior marca el inicio de la exploración. Encontrar suministros, orientarse y leer las señales del entorno forma parte de ese primer contacto con el Yermo.

La [Gran Guerra](/wiki/gran-guerra) aporta el contexto de la reconstrucción. El [Refugio 111](/wiki/vault-111) permite comparar este comienzo con el de Fallout 4.`,
    sourceIds: ["fallout-76-refugio"],
    relatedSlugs: ["gran-guerra", "vault-111"],
  },
  {
    slug: "diamond-city",
    bodyMarkdown: `## Descripción

**Diamond City** es un asentamiento de Fallout 4 construido dentro de un antiguo estadio de Boston. Sus gradas y su terreno de juego ofrecen un marco reconocible para la vida cotidiana del Commonwealth.

## Un lugar de encuentro

El mercado reúne comercios, conversaciones y noticias. Explorar sus calles permite observar cómo sus habitantes buscan estabilidad en un entorno donde la seguridad nunca está garantizada.

Para quien llega desde el [Refugio 111](/wiki/vault-111), la ciudad muestra cómo ha cambiado el mundo desde la [Gran Guerra](/wiki/gran-guerra).`,
    sourceIds: ["fallout-4-diamond-city"],
    relatedSlugs: ["vault-111", "gran-guerra"],
  },
];
