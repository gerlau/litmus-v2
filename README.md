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

3. **Start the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production**
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