# Dashboard de Révision

Un dashboard collaboratif pour partager des "revis-ions" et des "n'oublions pas".

## Fonctionnalités

- Authentification via Supabase Auth.
- Flux de publications (revis-ions / n'oublions pas).
- Système de vote style Reddit (Likes - Dislikes).
- Commentaires sur les publications.
- Filtres par titre, description et matière.
- Tchat commun en temps réel.
- Liste des utilisateurs en ligne/hors ligne.
- Support des images (jusqu'à 3 par post).

## Configuration

1. **Variables d'environnement** :
   Créez un fichier `.env.local` avec vos clés Supabase pour le développement local.
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
   **IMPORTANT (Vercel)** : Vous devez impérativement ajouter ces deux variables dans votre tableau de bord Vercel (Project Settings > Environment Variables) pour que l'application fonctionne une fois déployée.

2. **Base de données** :
   Copiez le contenu de `supabase/schema.sql` et exécutez-le dans l'éditeur SQL de votre tableau de bord Supabase.

3. **Stockage (Images)** :
   - Créez un bucket nommé `posts-images` dans la section Storage de Supabase.
   - Assurez-vous que le bucket est **PUBLIC**.
   - (Optionnel) Exécutez `node scripts/create-bucket.mjs` pour tenter une création automatique.

4. **Installation et Lancement** :
   ```bash
   npm install
   npm run dev
   ```

## Structure du projet

- `src/app` : Pages de l'application (Login, Home).
- `src/components` : Composants UI (Feed, Post, Chat, Sidebar, etc.).
- `src/utils/supabase` : Configuration du client Supabase (SSR).
- `supabase/schema.sql` : Script de création des tables.
