# MonkeyType Clone ⌨️

A minimalist typing-speed test inspired by [MonkeyType](https://monkeytype.com),
rebuilt from a single-file vanilla-JS prototype into a modern, typed and
component-based web app.

🔗 **Live demo:** https://monkeytypeclon.netlify.app _(legacy build — will be updated after deploy)_

## Features

- ⏱️ Multiple test durations: 15 / 30 / 60 / 120 seconds
- 🌍 English & Spanish word sets
- 📊 Accurate stats: **WPM**, raw WPM, accuracy and character breakdown
- 🏆 Personal-best persistence per language + duration (localStorage)
- 🎨 Five color themes (Serika, Dark, Light, Ocean, Dracula)
- ✨ Smooth animated caret and transitions with Framer Motion
- ♿ Keyboard-first, accessible and fully responsive

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) + [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Framer Motion](https://motion.dev) for animation
- [next-themes](https://github.com/pacocoursey/next-themes) for theming
- [Vitest](https://vitest.dev) for unit tests

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

## Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the development server |
| `npm run build` | Production build             |
| `npm run start` | Run the production build     |
| `npm run lint`  | Lint with ESLint             |
| `npm run test`  | Run unit tests (Vitest)      |

## Project structure

```
app/            App Router entry, layout, global theme styles
components/      UI components (typing test, caret, results, config, themes)
hooks/           useTypingTest — the game state machine
lib/             Pure logic: WPM/accuracy math, word generation, storage, types
lib/words/       Curated English & Spanish word lists
```

## Architecture notes

The game logic lives in a single `useReducer`-based hook
(`hooks/use-typing-test.ts`) instead of mutating the DOM directly, and all the
scoring math is isolated in pure, unit-tested functions (`lib/typing.ts`). This
rewrite also fixed bugs from the original prototype — most notably an incorrect
WPM formula that ignored the selected duration, and a crash when the player ran
out of words.

## License

MIT
