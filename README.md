## 360 Retail Web

Frontend for **360 Retail** — a feature-first React + TypeScript web app for multi-store retail operations.

### Tech stack
- **React** (Vite)
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui** + **Radix UI**
- **Zustand** (stores)
- **Axios** (API client)
- **react-i18next** (i18n with `src/locales/{vi,en}/`)

### Project structure (feature-first)
- `src/features/`: product, inventory, sales, orders, staff, CRM, admin (SuperAdmin), auth, home (landing)
- `src/shared/`: shared UI components, libs (API), stores (Zustand), types
- `src/routes/`: route guards / protected routes
- Import alias: `@/` → `src/`

### Environment
Create `.env` (or use existing) and ensure at least:
- `VITE_GOOGLE_CLIENT_ID` (Google OAuth client id)

### Install & run

```bash
npm install
npm run dev
```

### Build (CI / deploy)

```bash
npm run build
npm run preview
```

### Internationalization (i18n)
- Translation files live in `src/locales/en/` and `src/locales/vi/`
- Use `useTranslation("namespace")` in components and `i18next.t(...)` in non-React utilities.

