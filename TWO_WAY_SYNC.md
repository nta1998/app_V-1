# Two-Way Sync (Pencil <-> Code)

This project already has:
- Design file: `new.pen`
- App code: `new-client/` (Expo + React Native)

## 1) Sync Design Tokens Both Directions

Token bridge is configured with these commands (run in `new-client`):

```bash
npm run tokens:export
npm run tokens:import
```

### Code -> Pencil variables
1. Run:
```bash
cd new-client
npm run tokens:export
```
2. This creates `pencil-variables.json` next to `new.pen`.
3. In Pencil prompt, run:
```
Set variables from /Users/nta19/Library/Mobile Documents/com~apple~CloudDocs/PROJECTS /אפליקציה לאבא/pencil-variables.json
```

### Pencil -> Code
1. In Pencil, edit variables.
2. Export/save them to the same file:
`/Users/nta19/Library/Mobile Documents/com~apple~CloudDocs/PROJECTS /אפליקציה לאבא/pencil-variables.json`
3. Run:
```bash
cd new-client
npm run tokens:import
```
4. `new-client/constants/theme.ts` is updated.

## 2) Code -> Design (import components)

Use prompts like:

```
Recreate the component from /Users/nta19/Library/Mobile Documents/com~apple~CloudDocs/PROJECTS /אפליקציה לאבא/new-client/components/<File>.tsx in this .pen file
```

For screens/routes:

```
Import layout and styles from /Users/nta19/Library/Mobile Documents/com~apple~CloudDocs/PROJECTS /אפליקציה לאבא/new-client/app/(tabs)/index.tsx into this design
```

## 3) Design -> Code (export back)

For selected `Component/Home Header` (`ZTqP2`) in `new.pen`, use:

```
Generate a React Native TypeScript component from selected frame ZTqP2 and save to /Users/nta19/Library/Mobile Documents/com~apple~CloudDocs/PROJECTS /אפליקציה לאבא/new-client/components/HomeHeader.generated.tsx
```

Then manually merge generated output into your existing component if needed.

## 4) Repeatable loop

1. Import existing code into `new.pen`.
2. Adjust visuals/components in Pencil.
3. Generate updated TSX back into `new-client`.
4. Run app and verify.
5. Re-sync tokens with `tokens:export` / `tokens:import` when colors change.

## Notes

- You do **not** need to call `get-editor-state` first if you already know the selected node/components.
- Keep `new.pen` and `new-client` in the same workspace (already true here).
