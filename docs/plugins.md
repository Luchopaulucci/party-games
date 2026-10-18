# Registro de juegos (plugins)

Cada juego es un paquete con la misma forma. El server no sabe reglas:
llama al engine, proyecta vistas y le manda a cada cliente **solo** lo suyo.

```
shared/games/<id>/
  logic.ts
  <content>.ts
components/games/<Id>View.tsx
```

`GameContext` ahora trae `categories`, `picante`, `options` (timer, rondas, packs, modo, counts) y `now()`.

## Privacidad

El socket manda `{ public, private }` por asiento. Tests en `tests/multi` recorren el JSON y fallan si:

- un impostor recibe la palabra
- el target de ¿Quién soy? recibe el personaje
- el espía recibe el lugar, o un civil recibe `"role":"espia"`
- cualquier votación manda un mapa votante→voto
- Reflejos filtra el índice correcto hasta el cierre
- Yo nunca o Completá la frase exponen choices/respuestas ajenas antes de tiempo

## Implementados (15)

closest, whoami, impostor, mas-o-menos, espia, votacion, completa-frase, mentira, reflejos, yo-nunca, tutti, trivia, cadena, emoji, preferis.
