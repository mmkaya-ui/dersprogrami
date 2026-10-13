# Ders Programı — Offline-First Curriculum & Study PWA

A Progressive Web App (PWA) built with **React**, **Vite**, and **Tailwind CSS** that delivers curriculum management, scripture study, audio recitation playback, and search with complete offline capability.

Live deployment: [dersprogrami.biz](https://dersprogrami.biz)

---

## Technical Highlights

- **Offline-First Architecture:** Custom service worker (`sw.js`) and cache strategy enabling continuous playback, reading, and search without active internet access.
- **Client-Side Data Storage:** Leverages `localforage` (IndexedDB fallback to WebSQL/localStorage) to persist user annotations, reading progress, and schedules locally.
- **Dynamic Excel Curriculum Ingestion:** Parses institution timetable spreadsheets directly in the browser via `xlsx`, converting raw tabular data into structured daily schedules.
- **Sanitized Markdown Rendering:** Renders formatted commentary using `react-markdown` and `DOMPurify` to ensure safe, injection-proof text displays.

---

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS
- **Persistence:** `localforage` (IndexedDB)
- **Data Ingestion:** SheetJS (`xlsx`)
- **Security & Markdown:** DOMPurify, React Markdown
- **PWA:** Service Workers, Web App Manifest

---

## Getting Started

```bash
git clone https://github.com/mmkaya-ui/dersprogrami.git
cd dersprogrami
npm install
npm run dev
```

Build for production:
```bash
npm run build
```
