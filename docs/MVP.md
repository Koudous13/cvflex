# Plateforme CV Adaptatif — MVP

> **Démarré le 2026-04-25** par Koudous DAOUDA
> Document de référence pour le scope, la stack et la feuille de route du MVP.

---

## 1. Problème & Vision

**Friction observée** : beaucoup de candidats postulent avec un CV générique, ou ne postulent pas par flemme d'adapter leur CV à chaque offre.

**Vision** : un SaaS qui prend ton CV de base + une offre d'emploi et génère en quelques secondes un CV ciblé, prêt à être téléchargé en PDF.

---

## 2. Concept produit

1. **Onboarding** : l'utilisateur upload son CV de base (PDF) **une seule fois**.
2. **Template** : il choisit un template prédéfini parmi 3 à 5 (pas d'extraction du design original).
3. **Candidature** : pour chaque offre, il colle le texte de l'offre + ajoute éventuellement des infos / projets récents.
4. **Génération IA** : DeepSeek analyse `profil + offre + nouvelles infos` → génère un CV adapté (peut filtrer, reformuler, réordonner).
5. **Export** : PDF téléchargeable.

---

## 3. Stack technique (validée 2026-04-25)

| Couche | Choix | Raison |
|---|---|---|
| Frontend | **Next.js 14 (App Router)** + TypeScript | SSR, API routes intégrées, bon DX |
| UI | **Tailwind CSS** + **shadcn/ui** | Rapide, propre, composants accessibles |
| Backend | **Next.js API Routes** | Pas besoin d'un backend séparé pour le MVP |
| DB & Auth | **Supabase** (Postgres + Auth + Storage) | Tout-en-un, tier gratuit suffisant |
| IA | **DeepSeek API** | Bon rapport qualité/prix, choix utilisateur |
| Parsing PDF | `pdf-parse` (Node) | Extraction texte du CV uploadé |
| Génération PDF | **Puppeteer** (HTML → PDF) | Rendu fidèle des templates HTML |
| Hébergement | **Vercel** | Déploiement Next.js natif, tier gratuit |
| Storage fichiers | **Supabase Storage** | CV PDF originaux + PDF générés |

---

## 4. Scope MVP — IN / OUT

### ✅ Inclus dans le MVP
- Auth email + mot de passe (Supabase Auth)
- Upload CV de base PDF (1 par utilisateur)
- Extraction texte du CV PDF
- 3 templates HTML prédéfinis (basés sur les CVs HTML existants : `FullStack_IA`, `Automatisation_IA`, `Developpement_Web`)
- Champ paste texte d'offre d'emploi
- Champ optionnel "infos / projets supplémentaires"
- Appel DeepSeek pour générer le CV adapté (JSON structuré)
- Rendu HTML du CV avec template choisi
- Export PDF (Puppeteer)
- Historique des CVs générés (liste basique)

### ❌ Hors scope MVP (v2+)
- Paiement / abonnement (MVP gratuit)
- Multi-CVs de base
- Scraping URL d'offre
- Édition manuelle WYSIWYG du CV généré
- Extraction du design du CV original
- Templates personnalisables
- Lettre de motivation
- Suivi candidatures / ATS check
- Auth Google / OAuth
- Internationalisation

---

## 5. User flow MVP

```
[Landing] → [Sign up] → [Onboarding: upload CV PDF] → [Dashboard]
                                                          │
                                                          ▼
[Dashboard] → [Nouvelle candidature]
                  │
                  ├─ Coller offre d'emploi (textarea)
                  ├─ (Optionnel) Ajouter infos/projets
                  ├─ Choisir template (3 cartes)
                  └─ [Générer]
                        │
                        ▼
                  [Preview CV adapté] → [Télécharger PDF]
                                       → [Régénérer]
                                       → [Sauvegarder]
                        │
                        ▼
              [Historique des CVs générés]
```

---

## 6. Modèle de données (Supabase)

### Tables

**`profiles`**
- `id` (uuid, PK, → auth.users)
- `email` (text)
- `full_name` (text)
- `created_at` (timestamp)

**`base_cvs`** (CV de base de l'utilisateur)
- `id` (uuid, PK)
- `user_id` (uuid, FK → profiles)
- `pdf_url` (text — Supabase Storage)
- `extracted_text` (text — texte brut extrait)
- `parsed_json` (jsonb — profil structuré : nom, contact, expériences, formations, skills, projets…)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**`generated_cvs`** (CVs adaptés générés)
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `base_cv_id` (uuid, FK)
- `job_offer_text` (text)
- `extra_info` (text, nullable)
- `template_id` (text — slug du template)
- `generated_json` (jsonb — CV adapté structuré)
- `pdf_url` (text, nullable — généré on-demand)
- `created_at` (timestamp)

**`templates`** (statique, en code ou en DB)
- `id` (text, PK — `fullstack-ia`, `automatisation-ia`, `developpement-web`)
- `name` (text)
- `preview_url` (text)
- `html_template` (text)

---

## 7. Architecture des prompts DeepSeek

### Étape A — Parsing du CV de base (1× à l'upload)
**Input** : texte brut extrait du PDF
**Output** : JSON structuré du profil
```json
{
  "fullName": "...",
  "contact": { "email": "...", "phone": "...", "location": "...", "links": [...] },
  "summary": "...",
  "experiences": [{ "title": "...", "company": "...", "period": "...", "achievements": [...] }],
  "education": [...],
  "skills": { "technical": [...], "soft": [...], "languages": [...] },
  "projects": [...],
  "certifications": [...]
}
```

### Étape B — Adaptation à l'offre (à chaque candidature)
**Input** : `parsed_json` du profil + `job_offer_text` + `extra_info`
**Output** : même structure JSON, mais :
- Réécrit le `summary` pour matcher l'offre
- Filtre / réordonne les expériences les plus pertinentes
- Met en avant les `achievements` qui matchent les keywords
- Sélectionne les skills pertinents
- Reformule pour utiliser le vocabulaire de l'offre

**Règle stricte** : ne **jamais inventer** d'expériences/formations/skills absents du profil de base. Peut reformuler, pas fabriquer.

---

## 8. Structure du projet (Next.js App Router)

```
saas-cv-adaptatif/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (app)/
│   │   ├── dashboard/page.tsx
│   │   ├── onboarding/page.tsx
│   │   ├── new/page.tsx              # Nouvelle candidature
│   │   ├── cv/[id]/page.tsx          # Preview CV généré
│   │   └── history/page.tsx
│   ├── api/
│   │   ├── upload-cv/route.ts        # Upload + parse PDF
│   │   ├── generate/route.ts         # Génération CV adapté
│   │   └── pdf/[id]/route.ts         # Génération PDF Puppeteer
│   ├── layout.tsx
│   └── page.tsx                      # Landing
├── components/
│   ├── ui/                           # shadcn
│   └── templates/                    # Composants templates CV
│       ├── FullStackIA.tsx
│       ├── AutomatisationIA.tsx
│       └── DeveloppementWeb.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── deepseek/
│   │   ├── client.ts
│   │   ├── prompts.ts
│   │   └── parse-cv.ts
│   ├── pdf/
│   │   ├── extract.ts                # pdf-parse
│   │   └── generate.ts               # Puppeteer
│   └── types.ts
├── public/
├── .env.local
├── package.json
└── README.md
```

---

## 9. Variables d'environnement

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# DeepSeek
DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=deepseek-chat

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 10. Roadmap MVP — Phases

### Phase 0 — Setup (jour 1)
- [ ] Init projet Next.js + TS + Tailwind
- [ ] Install shadcn/ui
- [ ] Création projet Supabase + schéma DB
- [ ] Init repo git + push GitHub
- [ ] Setup `.env.local` + clés API DeepSeek

### Phase 1 — Auth & Onboarding (jour 2)
- [ ] Pages login / signup avec Supabase Auth
- [ ] Middleware protection routes
- [ ] Page onboarding : upload PDF
- [ ] Endpoint `/api/upload-cv` : storage + extraction texte
- [ ] Appel DeepSeek pour parser → stocker `parsed_json`

### Phase 2 — Templates (jour 3)
- [ ] Convertir les 3 CVs HTML en composants React
- [ ] Page `/dashboard` avec choix template
- [ ] Preview live avec données du profil

### Phase 3 — Génération (jour 4)
- [ ] Page `/new` : form offre + extra info + choix template
- [ ] Endpoint `/api/generate` : appel DeepSeek adaptation
- [ ] Page `/cv/[id]` : preview CV adapté
- [ ] Bouton "Régénérer"

### Phase 4 — Export PDF (jour 5)
- [ ] Endpoint `/api/pdf/[id]` : Puppeteer → PDF
- [ ] Stockage Supabase + lien téléchargement

### Phase 5 — Historique & polish (jour 6)
- [ ] Page `/history` : liste des CVs générés
- [ ] Landing page minimale
- [ ] Déploiement Vercel
- [ ] Tests bout-en-bout

---

## 11. Critères de succès du MVP

- ✅ Un utilisateur peut s'inscrire, uploader son CV, et générer un CV adapté en moins de **3 minutes**
- ✅ Le CV généré reste **fidèle au profil** (pas d'invention)
- ✅ Le PDF exporté est **propre et imprimable**
- ✅ Coût IA par génération < **0,05 €**
- ✅ Déployé sur Vercel avec URL publique partageable

---

## 12. Risques identifiés

| Risque | Mitigation |
|---|---|
| DeepSeek invente des infos | Prompt strict + validation JSON schema côté serveur |
| Puppeteer trop lourd sur Vercel | Utiliser `@sparticuz/chromium` ou service externe (Browserless) si besoin |
| PDF mal extrait (CV très visuel) | Demander à l'utilisateur de compléter manuellement les champs manquants |
| Latence DeepSeek > 10s | Streaming + état "génération en cours" UI |
| Quota Supabase free dépassé | Monitoring + upgrade au besoin |

---

## 13. Prochaines étapes immédiates

1. **Init projet Next.js** dans `D:\KOUDOUS\CV\saas-cv-adaptatif\`
2. **Créer le projet Supabase** (compte + nouvelle base)
3. **Récupérer clé DeepSeek** (https://platform.deepseek.com)
4. **Schéma SQL** des 3 tables
5. **Première page** : landing + login

---

*Dernière mise à jour : 2026-04-25*
