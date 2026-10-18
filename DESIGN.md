# La Previa — Style Reference

> Pixel arcade boot screen in a black void. Monospace glyphs traced in white neon against a pure black void, with a single hot-pink power-up color that should feel rare and electric when it appears.

**Theme:** dark  
**Wordmark:** `LA PREVIA` (Source Code Pro 700, all-caps). First word white, second word Kippo Pink.

La Previa is a neon-on-black arcade: a pitch-black canvas where every element is drawn as a thin white outline or rendered in a single hot magenta accent. Typography is exclusively monospace (Source Code Pro) at every size. Display text sits in all-caps with generous tracking, evoking a CRT boot screen or a chat log header. Cards are transparent panels defined only by a 1px white border, never by fill or shadow — the page reads as a wireframe brought to life. The single chromatic accent (#ee1f66) is rationed sparingly: the word `PREVIA`, the primary CTA, and small active badges.

Adapted from the Kippo style reference. Components that do not apply to this product stay documented as **no aplica / referencia**.

## Product rules (La Previa)

- Toda la configuración (timer, rondas, impostores, categorías, packs, picante) se elige **antes** de `Empezar`, en lobby/setup. Nunca adentro de la partida.
- En modo local, un solo CTA de pase: **Listo, pasá el celu**. El contador `Listos 0/N` queda solo online.
- Textos en **español rioplatense**.
- Mobile-first **360–414 px**. Gaps ≥ 12 px (token de elemento: 15 px). Pills `Pasando el celu` nowrap + ellipsis.
- Safe-area: `--safe-top` / `--safe-bottom`. Topbar sticky opaca (void black), borde inferior, sin que el scroll se meta debajo.
- Contraste AA. Un solo botón relleno por pantalla (rosa). El resto, ghost outline.
- Animaciones GSAP cortas, pocas a la vez, solo `transform`/`opacity`. Sin blur ni filtros animados. Respetar `prefers-reduced-motion`. Tienen que andar en celus baratos.

## Colors

| Name | Hex / value | Token | Use |
| --- | --- | --- | --- |
| Kippo Pink | `#ee1f66` | `--color-kippo-pink` | Primary CTA, accent word, active badges. Rationed. |
| Void Black | `#000000` | `--color-void-black` | Page canvas, card backgrounds. |
| Carbon | `#29292a` | `--color-carbon` | Elevated surfaces, secondary panels. |
| Ash | `#333333` | `--color-ash` | Subtle borders and dividers. |
| Ghost White | `#ffffff` | `--color-ghost-white` | Hairline borders, type, input outlines. |
| Sunset Gradient | `linear-gradient(to right, #ffc400, #ff33e0)` | `--color-sunset-gradient` | Decorative only. |
| Terminal Cyan | `linear-gradient(to right, #33beff, #33ffb8)` | `--color-terminal-cyan` | Decorative only, sparingly. |

Do not invent extra brand colors. Player swatches stay as identity chips, not as a second brand accent.

## Typography

Source Code Pro is the **sole typeface** (substitutes: JetBrains Mono, Fira Code, IBM Plex Mono). Weights 400 / 600 / 700. OpenType `"zero"`.

| Role | Size | Line-height | Tracking | Token |
| --- | --- | --- | --- | --- |
| Caption | 10px | 1.2 | 0.08em | `--text-caption` |
| UI / button | 12px | 1.67 | 0.1em | `--text-ui` |
| Body | 16px | 1.88 | 0 | `--text-body` |
| Display | 42px | 1.19 | 0.12–0.5em | `--text-display` |

42px / 700 all-caps tracked = arcade marquee. 16px / 400 = body. Display text is uppercase.

## Spacing & shapes

Density comfortable.

- Spacing tokens: `--spacing-5/10/15/20/25/30/35/50/100/128/150`
- Radius: cards **15px**, buttons **10px**, icons **50px**, images **15px**
- Layout: max-width 1200px (shell mobile 430px), section gap 100px (desktop), card padding **30px** (mobile may drop to **20px**), element gap **15px**

## Components

- **Primary CTA Button:** bg `#ee1f66`, text `#000` (blanco sobre rosa no llega a AA 4.5), Source Code Pro 12px 700, ls 0.1em, uppercase, padding 10px 15px, radius 10px, no border. **Only filled button.** Rosa en texto chico solo si pasa 4.5:1; si no, solo fondo de CTA o display.
- **Ghost Outline Button:** transparent, border 1px `#fff`, text `#fff`, 12px 700 uppercase ls 0.1em, padding 10px 15px, radius 10px. Secondary actions.
- **Navigation Link:** `#fff` 12px 700 uppercase ls 0.1em, bottom border 1px transparent, on hover/active `#ee1f66`.
- **Outlined Card:** bg `#000` or `#29292a`, border 1px `#fff`, radius 15px, padding 30px (20px on 360px), **no shadow, no gradient** — the border IS the card. Dominant pattern.
- **Press Logo Strip:** no aplica / referencia.
- **App Store Badge:** no aplica / referencia (~120×40 white on black).
- **QR Code Block:** white QR on black 1px-bordered square panel, sharp bitmap, no shadow.
- **Phone Mockup Frame:** no aplica / referencia.
- **Code-Style Card Stack:** no aplica / referencia (overlapping 15px cards with thin white border).
- **Code Block / Terminal Snippet:** monospace on `#29292a`, slashed zero, pink accent border. Use for sala codes.
- **Logo Wordmark:** Source Code Pro 700 all-caps. `LA` white, `PREVIA` pink, ls 0.1–0.2em.
- **Section Heading Pair:** two-tone display headline — first word white, second word (or the rest) Kippo Pink.

## Motion

GSAP (`gsap` + `@gsap/react`, `useGSAP` with scope and cleanup).

- Screen and card entrances: short `y` + `autoAlpha`, stagger capped (few items).
- Button press: slight `scale`.
- Role / card reveal, results, timer tick, turn change: one element at a time.
- Slider de ¿Cuánto es? / ¿Más o menos?: same swipe/nudge API; only the drawing and a cheap scale tick.
- Wordmark: faint opacity flicker. No blur, no animated filters, no layout props.
- `prefers-reduced-motion: reduce` → duration 0 / skip.
- Must run on the static APK export (`build:mobile`).
