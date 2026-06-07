# AGENTS.md — bizflow-mobile (Expo SDK 56 + React Native 0.85)

# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## Cấu trúc dự án

```
bizflow-mobile/
├── app/                         # expo-router (file-based routing)
│   ├── (auth)/                  # Auth flow group
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                  # Bottom tabs
│   │   ├── _layout.tsx
│   │   ├── index.tsx            # Home
│   │   ├── products.tsx
│   │   └── profile.tsx
│   ├── products/                # Product stack
│   │   ├── [id].tsx
│   │   └── create.tsx
│   ├── _layout.tsx              # Root layout (providers)
│   └── +not-found.tsx
├── src/
│   ├── components/              # Reusable components
│   ├── screens/                 # Screen logic (if not file-based)
│   ├── services/                # API clients
│   │   ├── api.ts               # Axios/fetch instance
│   │   ├── products.ts          # Product API
│   │   └── auth.ts
│   ├── hooks/                   # Custom hooks
│   ├── stores/                  # Zustand/Redux stores
│   ├── types/                   # TypeScript types
│   ├── lib/                     # Utilities
│   ├── constants/               # App constants
│   ├── theme/                   # Colors, typography
│   └── i18n/                    # Localization
├── assets/                      # Images, fonts
├── app.json                     # Expo config
├── eas.json                     # EAS Build config
├── package.json
└── tsconfig.json
```

## Tech stack

- **Expo SDK 56** + **React Native 0.85** + **TypeScript 5**
- **expo-router** — file-based routing (như Next.js App Router)
- **expo-image** — performant image component
- **MMKV** — fast key-value storage (replacement for AsyncStorage)
- **expo-secure-store** — secure storage cho tokens
- **react-query** — server state management (mirror frontend)
- **react-hook-form + zod** — form validation
- **expo-camera** — barcode scanner

## TypeScript rules

1. **No `any`** — dùng `unknown` + type guards. Cast cụ thể khi cần.
2. **Strict mode** — `"strict": true`.
3. **Discriminated unions** cho state machines.
4. **Import type** cho type-only imports.

## Routing rules (expo-router)

1. Mỗi file trong `app/` = 1 route.
2. **Dynamic routes**: `[id].tsx` → param `id` từ `useLocalSearchParams()`.
3. **Catch-all**: `[...rest].tsx`.
4. **Group routes**: `(groupName)/...` — không hiển thị trong URL, dùng để share layout.
5. **Layouts**: `_layout.tsx` ở mỗi level — wrap children với providers/navigation.
6. **Stack vs Tabs**: dùng `Stack.Protected` cho auth-required screens.

## Component rules

1. **Functional components** only (no class components).
2. **Default export** cho screens (expo-router yêu cầu).
3. **Named export** cho reusable components.
4. **`React.memo`** cho pure components render nhiều lần (lists).
5. **`FlatList`** cho lists > 20 items, KHÔNG dùng `.map()` trong `<ScrollView>`.
6. **`Pressable`** thay vì `TouchableOpacity` (better accessibility).

## Data fetching rules

1. **API client**: dùng `fetch` native hoặc `axios` qua `services/api.ts`.
2. **State**: react-query (same as frontend) để share mental model.
3. **Auth token**: lưu trong `expo-secure-store` (encrypted), KHÔNG dùng MMKV.
4. **Offline**: cache API responses với MMKV hoặc react-query persistence.

## Platform-specific rules

1. **iOS/Android only features**: gate qua `Platform.OS === 'ios'` check.
2. **Camera/Location/Push**: dùng `expo-camera`, `expo-location`, `expo-notifications`.
3. **Native modules**: cần config trong `app.json` (plugins, permissions).
4. **Build**: dùng `eas build` (KHÔNG `expo build` — deprecated).

## Verification

```bash
npx expo start                  # Dev server
npx expo start --ios            # iOS simulator
npx expo start --android        # Android emulator
npx tsc --noEmit                # Type check
eas build --platform ios        # Production iOS build
```

## Future folder predictions

```
src/
├── offline/                    # Offline sync logic
│   ├── queue/                  # Request queue
│   └── conflict-resolution/
├── push-notifications/         # Push handler
├── deep-linking/               # Universal links / scheme handlers
├── analytics/                  # Event tracking
└── accessibility/              # A11y helpers
```

## Anti-patterns cần tránh

- ❌ `any` thay vì proper types
- ❌ Class components
- ❌ `.map()` trong `<ScrollView>` cho list dài
- ❌ `AsyncStorage` (dùng MMKV hoặc SecureStore)
- ❌ Hard-code API URL (dùng env variables)
- ❌ `console.log` trong production builds
- ❌ `TouchableOpacity` (dùng `Pressable`)
- ❌ Inline styles lặp lại (extract thành StyleSheet)
