# La Previa — Style Reference (Slush)

> Inflatable sticker universe on pastel paper. A sticker-book on the kitchen table: cut-out blobs, fat type, one black CTA.

**Theme:** light  
**Wordmark:** `LA PREVIA` (Bowlby One, all-caps). Black on paper. A circular black-outline mark can sit beside it.

Reemplaza el sistema Kippo (PR #18). Luciano lo rechazó: demasiado aire, no se entiende, feo. Este sistema prioriza **densidad compacta** y **jerarquía de un vistazo** en celu 375px.

## De dónde sale

- **Guía Slush** (referente de Luciano): canvas papel, stickers vivos con borde negro 1px, radios de píldora, paleta de 6 colores de sticker.
- **ui-ux-pro-max:** compact labels / no-wrap, contraste 4.5:1, focus visible, `prefers-reduced-motion`. El `--design-system` para “gaming” devolvió dark + 3D: **no aplica**. Luciano pidió tema claro Slush.
- **taste-skill (app screens):** paneles quietos, labels chicos, color gastado en datos/identidad — acá, en el color de cada juego. Sin glow ni gradientes de IA.

## Product rules (no se rompen)

- Toda la configuración **antes** de `Empezar`. Nunca adentro de la partida.
- Local: un solo CTA de pase **Listo, pasá el celu**. `Listos 0/N` solo online.
- Español rioplatense.
- Mobile-first **360–414 px**. Entre elementos **4–12 px**. Entre secciones **máximo 24 px**.
- Cada pantalla de juego: el botón principal visible **sin scrollear**.
- Botones en **una línea**. Alto mínimo **44 px** (mejor **48**).
- Contraste AA. Texto blanco **solo** sobre negro o Voltage Violet `#5c4ade`. Texto **negro** sobre azul, menta, lavanda, amarillo y naranja `#fb4903`.
- Stickers decorativos **solo en la home**. Nunca en partidas. No tapan botones ni texto (`pointer-events: none`).
- Fuentes empaquetadas con `next/font` (APK offline).
- GSAP corto (`transform`/`opacity`). `prefers-reduced-motion` → sin animación.

## Colors

| Name | Hex | Token | Use |
| --- | --- | --- | --- |
| Carbon | `#000000` | `--color-carbon` | Texto, bordes 1px, CTA relleno. Texto blanco encima. |
| Paper White | `#ffffff` | `--color-paper` | Canvas y superficies. |
| Sky Wash | `#dceeff` | `--color-sky` | Fondo hero home. No texto encima en chico. |
| Concrete Gray | `#cccccc` | `--color-concrete` | Bordes suaves, tracks. |
| Soft Mist | `#e9e9e9` | `--color-mist` | Disabled, tintes. |
| Electric Blue | `#4da2ff` | `--color-blue` | Sticker / marca. Texto negro. |
| Mint Pop | `#55db9c` | `--color-mint` | Sticker. Texto negro. |
| Lavender | `#e9ccff` | `--color-lavender` | Sticker. Texto negro. |
| Ember | `#fb4903` | `--color-ember` | Sticker. Texto negro. (Impostor) |
| Sunburst | `#ffd731` | `--color-sun` | Sticker. Texto negro. Nunca fondo de párrafo largo. |
| Voltage Violet | `#5c4ade` | `--color-violet` | Sticker, QR. Texto blanco OK. |

Los 6 vivos son **relleno de stickers/cards**, no acentos tímidos. Cada juego tiene un color (`shared/ui/stickers.ts`) en su tarjeta y en su pantalla.

## Typography

- **Display:** Bowlby One (sustituto: Antonio). Mayúsculas. En celu **48–72 px** para wordmark y títulos cortos, `line-height: 0.8`. Títulos largos (`¿Quién está más cerca?`) **clamp ~28–48 px**, `line-height: ~0.95` para que las 2 líneas no se pisen.
- **UI / body:** Inter 500 / 700. Body `-0.01em`. Botones/labels `0.03em`. Features `ss01` + `tnum`.
- No 200–640 px de display. No más de 2 líneas de título.

## Spacing & shapes

Escala base **4 px**: 4 / 8 / 12 / 16 / 20 / 24 / 28 / 32.

- Element gap: **8 px** (rango 4–12).
- Card padding: **16–20 px** en celu.
- Section gap: **16–24 px** (nunca 48+ en celu).
- Radios: botones/pills **1600 px** (píldora), cards **20 px**, cards elevadas **40 px**, íconos **16 px**.

## Components

- **Filled CTA:** fondo negro, texto blanco, 700 13–14 px, **uno por pantalla**, min-height 48, nowrap.
- **Pill / Ghost:** borde negro 1 px, fondo blanco, texto negro, 700 12–14 px, min-height 48, nowrap.
- **Game tile:** relleno = color del juego, tinta según regla AA, borde negro 1 px, radio 20.
- **QR Card** (después del checkpoint): radio 20, fondo `#5c4ade`, panel QR blanco + borde negro, label blanco.
- **Sticker Decoration (solo home):** blobs recortados, borde negro, rotados, detrás del hero. Nunca grilla. Nunca sobre CTAs.
- **Logo mark:** círculo con borde negro (opcional junto al wordmark).

## Motion

GSAP + `useGSAP`. Entradas fade (`autoAlpha`) ≤ 200 ms, stagger corto. Press `scale(0.97)`. Sin blur, sin filtros, sin layout. Reduced-motion: duration 0.

## Checkpoint

Aplicado primero a: **home**, **elegir modo**, **lobby local**, **partida del Impostor**. El resto de juegos hereda tokens; no se pule hasta que Luciano apruebe.
