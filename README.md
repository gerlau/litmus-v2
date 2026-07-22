<img width="1376" height="768" alt="568898845-baa7f850-9b1f-4096-8a32-707d99b7c468" src="https://github.com/user-attachments/assets/23577d3a-9bc2-469b-9829-5be5a35e3c29" />

# 🧭 About

Litmus is a security posture dashboard and practitioner tooling for mobile application assessments. Stakeholders use the Dashboard to review portfolio-level risk summaries and prioritization insights. Security practitioners use the Features, Risks, Apps, and Findings pages to document and maintain assessment data across multiple mobile applications.

**Tech Stack**
- [Next.js 14](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [SQLite](https://www.sqlite.org/) via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) + [Knex](https://knexjs.org/)

---

# 👩‍💻 Developer Setup

Everything you need to run the project locally.

## 📦 Prerequisites

- [Node.js](https://nodejs.org/) >= 18

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/litmus-v2.git
   cd litmus-v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` and set `LITMUS_USE_MOCK`:
   - `true` — connects to `~/.litmus-v2/data.db` (pre-seeded mock data, good for exploring the app)
   - `false` — connects to `~/.litmus-v2/real.db` (blank database, for real assessments)

   For Daily Reading AI summaries, you can also configure Ollama:
   - `OLLAMA_HOST` — defaults to `http://localhost:11434`
   - `OLLAMA_MODEL` — defaults to `llama3.2:latest` for faster summaries
   - `OLLAMA_SUMMARY_INPUT_MAX_CHARS` — defaults to `8000` to keep prompts small and responsive

4. **Start the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 📂 Project Structure

```
src/
├── app/        – Next.js routing (pages, API routes, layout)
├── features/   – Feature-based modules (components, hooks, types)
├── lib/        – Server actions and database utilities
└── shared/     – Reusable components, types, and utilities
```

> **Note:** `src/app/features/` is the `/features` route, not to be confused with `src/features/` which is the feature-module architecture directory.

## 💾 Data Storage

All persistent data is stored locally on the machine running the server, under `~/.litmus-v2/`.

| What | Path |
|------|------|
| Mock database | `~/.litmus-v2/data.db` (pre-seeded SQLite) |
| Real database | `~/.litmus-v2/real.db` (blank SQLite) |
| Uploaded files | `~/.litmus-v2/uploads/{mode}/{context}/` |

`{mode}` is `mock` or `real` (matches `LITMUS_USE_MOCK`). `{context}` is `features`, `risks`, or `findings`.

---

# 🤝 Contributing

Contributions are welcome. Follow the standard GitHub workflow:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Commit your changes
4. Open a pull request

Please keep contributions scoped to the project's mobile security assessment domain.

---

# 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
