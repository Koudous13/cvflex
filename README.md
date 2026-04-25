# CV Adaptatif

SaaS qui génère un CV adapté à chaque offre d'emploi via DeepSeek.

> Voir [`docs/MVP.md`](./docs/MVP.md) pour le scope complet, l'archi et la roadmap.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind 4
- **shadcn/ui** pour les composants
- **Supabase** (Postgres + Auth + Storage)
- **DeepSeek API** pour la génération
- **Puppeteer** pour l'export PDF
- **Vercel** pour le déploiement

## Démarrage local

```bash
# 1. Installer les dépendances
npm install

# 2. Copier le template d'env et remplir les clés
cp .env.example .env.local

# 3. Lancer le serveur de dev
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Setup Supabase

1. Crée un projet sur [supabase.com](https://supabase.com).
2. Récupère `URL` + `anon key` + `service role key` dans Settings → API.
3. Exécute le contenu de [`supabase/schema.sql`](./supabase/schema.sql) dans le SQL editor.
4. Crée 2 buckets dans Storage (privés) : `base-cvs` et `generated-pdfs`.
5. Décommente les policies storage dans `schema.sql` et exécute-les.

## Setup DeepSeek

1. Crée un compte sur [platform.deepseek.com](https://platform.deepseek.com).
2. Récupère ta clé API et place-la dans `DEEPSEEK_API_KEY`.

## Structure

```
app/                 # Routes Next.js (App Router)
  api/               # Endpoints serveur
components/
  ui/                # shadcn/ui
  templates/         # Templates de CV (FullStack IA, …)
lib/
  supabase/          # Clients Supabase (client/server/middleware)
  deepseek/          # Client + prompts + parse/adapt
  pdf/               # Extraction (pdf-parse) + génération (Puppeteer)
  types.ts           # Schémas Zod & types TS
supabase/
  schema.sql         # Schéma DB + RLS
docs/
  MVP.md             # Scope MVP, archi, roadmap
```
