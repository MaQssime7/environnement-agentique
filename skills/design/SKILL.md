---
name: design
description: Construire le système de design d'un produit selon sa plateforme (site web, application web, Mac, Windows, iOS, Android) — palette choisie en direct sur tweakcn puis corrigée pour l'accessibilité, polices, icônes, espacements — en partant de composants existants (blocs shadcn, composants natifs), et dessiner ses premiers écrans sur le canevas Design de Claude. Écrit docs/DESIGN.md. Utilise sur /design, "design system", "palette", "thème", "maquette", "premiers écrans", ou avant le premier écran d'un projet. Se lance après /cadre et avant /planifie.
---

# /design

Dans cette méthode, l'humain tranche le produit et l'IA le technique. En design, ça veut dire : **l'utilisateur juge ce qu'il voit, pas ce qu'on lui décrit.** Montre, ne décris pas. Ne lui demande d'arbitrer que du visible — une palette, un écran. Tout le reste (polices, icônes, espacements, format des jetons), tu le tranches et tu le justifies en une ligne.

## Ce qui doit exister à la fin

1. Une **palette** qu'il a choisie en la voyant, en clair et en sombre, **contrastes vérifiés par calcul**.
2. Polices, icônes, arrondi, espacement, mouvement — tranchés, cohérents avec la plateforme.
3. **2 à 4 premiers écrans** sur le canevas Design, composés à partir des meilleurs composants existants, qu'il a jugés et validés.
4. `docs/DESIGN.md` et le bloc design du `CLAUDE.md` du projet.
5. Le carnet de goût mis à jour.

## 1. Plateforme et intention

Lis `docs/PRD.md` s'il existe : sa section **Plateformes** les donne. Ne les demande que si elle manque. Puis **une seule question** : *« Qu'est-ce qu'on doit retenir de ton produit en 3 secondes ? Un ressenti, une couleur, une posture — une phrase. Et si tu as des sites ou des apps que tu aimes ou que tu détestes, cite-les. »* Chaque choix qui suit sert cette phrase.

La plateforme fixe les conventions. Ne transpose pas celles du web dans une app native, ni l'inverse — un utilisateur d'iPhone reconnaît en une seconde une app qui « fait site web ». Un produit peut en viser plusieurs (une app web et son site, une app iOS et Android) : même marque partout, conventions de chacune.

| | Site web | Application web | Mac | Windows | iOS | Android |
|---|---|---|---|---|---|---|
| **Référence** | conventions du web | conventions du web | Human Interface Guidelines (macOS) | Fluent Design | Human Interface Guidelines (iOS) | Material Design 3 |
| **Rythme** | aéré : grands titres, larges blancs, une idée par écran | compact : beaucoup d'information visible | compact, barre latérale | compact, volet de navigation | une tâche par écran | une tâche par écran |
| **Navigation** | en-tête, sections qui défilent | barre latérale ou en-tête | barre latérale, barre d'outils, menus en haut de l'écran | volet latéral, barre de titre | barre d'onglets en bas, retour par balayage | barre de navigation en bas, bouton d'action flottant |
| **Polices** | une de titrage, une de texte, gratuites et vérifiées | idem | SF Pro (système) | Segoe UI Variable (système) | SF Pro (système) | Roboto ou police de marque (Material le prévoit) |
| **Icônes** | lucide par défaut | lucide par défaut | SF Symbols | Fluent System Icons | SF Symbols | Material Symbols |
| **Contraintes** | 375 px de large autant que le bureau, chargement rapide | 375 px de large autant que le bureau | fenêtre redimensionnable, raccourcis clavier | fenêtre redimensionnable, navigation au clavier complète | zones tactiles 44 × 44 pt, taille de texte qui suit les réglages, zones sûres de l'encoche | zones tactiles 48 × 48 dp, taille de texte qui suit les réglages |
| **Taille des écrans du canevas** | 1440 × 900 et 375 × 812 | 1440 × 900 et 375 × 812 | 1440 × 900 | 1280 × 800 | 393 × 852 | 412 × 915 |

Sur les plateformes natives, la police système est le bon choix, pas un renoncement ; une police de marque se réserve aux titres et s'embarque avec sa licence. Une app Mac ou Windows construite avec des technologies web suit quand même les conventions de bureau de sa plateforme.

Les conventions évoluent : avant de les appliquer, vérifie la page à jour des guides d'Apple, de Microsoft ou de Google plutôt que ta mémoire.

## 2. La palette — sur tweakcn

tweakcn (tweakcn.com) montre un thème en direct sur de vrais composants : cartes, tableau de bord, formulaires, en clair et en sombre. C'est là qu'il choisit, parce qu'il voit.

1. **Propose 3 thèmes recommandés** qui servent la phrase de l'étape 1, chacun avec une ligne de pourquoi. **Puis, en dessous, tous les autres thèmes**, groupés par ambiance (sobre, chaleureux, coloré, sombre et technique, rétro, doux…), une demi-ligne chacun : il n'est pas enfermé dans ta sélection. Liste à jour : `gh api repos/jnsahaj/tweakcn/contents/utils/theme-presets.ts -q .content | base64 -d`. Lis les couleurs d'un thème avant de le décrire : `https://tweakcn.com/r/themes/<nom>.json`.
2. **Il les teste sur `https://tweakcn.com/editor/theme`**, en choisissant le nom dans la liste des thèmes. Il peut appliquer n'importe lequel et retoucher les couleurs. Dis-lui de ne pas se soucier des polices du thème : tu les choisis à l'étape 3, et celles des thèmes sont souvent banales.
3. **Il te renvoie son choix** : le nom d'un thème non retouché, ou, s'il a retouché, le code exporté (bouton de code de l'éditeur, à copier-coller). Enregistre-le dans un fichier du scratchpad.
4. **Vérifie et corrige les contrastes** :

   ```bash
   node <dossier de ce skill>/scripts/contraste.mjs <nom ou fichier> --corriger <scratchpad>/theme-corrige.css
   ```

   Le script mesure douze paires (texte, boutons, texte atténué, erreur, focus clavier, bordure des champs), en clair et en sombre. Il corrige en bougeant seulement la luminosité, teinte conservée, au plus près, puis revérifie le tout. **Ne présente jamais un thème non corrigé comme utilisable** : aucun des 42 thèmes de tweakcn n'est conforme tel quel (vérifié le 20/10/2026), la bordure des champs et le rouge d'erreur échouent presque partout.
5. **Dis-lui en une phrase ce qui a bougé** (« le rouge d'erreur est un peu plus foncé, les bordures de champ un peu plus visibles ») — le tableau est pour la trace, pas pour lui.

Si tweakcn est inaccessible ou s'il préfère ne pas y aller, propose toi-même trois palettes dans une page HTML d'aperçu, et passe-les au même script.

**Plateformes natives** : tweakcn montre des composants web, mais une palette se transpose telle quelle. Garde les valeurs ; seul le format de sortie change (étape 5).

## 3. Le reste du système — tu tranches

Présente en un seul message court, chaque ligne avec son « parce que » lié au produit :

- **Polices** : titrage, texte, chiffres (chiffres à chasse fixe pour les tableaux). Sur le web, uniquement des polices gratuites dont tu as vérifié la licence et la disponibilité.
- **Icônes** : un seul jeu. Liste les notions que le produit doit montrer en icône et vérifie que ce jeu les couvre toutes — un jeu incomplet finit par en appeler un second, ce qui met deux styles de trait sur le même écran.
- **Arrondi** : une seule valeur source, les autres en dérivent.
- **Espacement** : unité de base et densité.
- **Mouvement** : sobre par défaut, coupé quand l'utilisateur a demandé à réduire les animations.
- **Un pari** au maximum : l'endroit où le produit se distingue, ce qu'il coûte.

Il valide ou dit « change ça ». Sur un changement, propose deux alternatives pour ce seul point.

À éviter, parce que ça signe une interface générée sans intention : dégradé violet-bleu, grille de trois cartes avec icônes dans des ronds colorés, tout centré, émojis en guise d'icônes, cartes à bordure gauche colorée.

## 4. Les écrans — composés à partir de l'existant, proposés tout faits

Une carte, une bulle de discussion, un héro, une page de tarifs : ils existent déjà, testés, accessibles, gratuits. Les dessiner de mémoire donne des écrans moyens qu'il faudra recoder autrement. Tu vas donc chercher les meilleurs éléments, tu les assembles en **écrans complets**, et **il juge des écrans, jamais des composants un par un**. Toute la recherche se fait en coulisses ; il ne voit que le résultat.

### 4.1 Lis le carnet de goût

`<dossier de ce skill>/carnet-de-gout.md` garde ce qu'il a aimé et rejeté sur les projets précédents. Lis-le avant de chercher : tes propositions doivent déjà lui ressembler.

### 4.2 Choisis les écrans

**2 à 4 écrans** tirés des user stories du PRD : celui qui prouve la valeur du produit, l'accueil ou la liste principale, et **un état vide** (ce que voit un nouvel utilisateur). Un écran au moins en mode sombre. Plusieurs plateformes visées : les mêmes écrans sur chacune.

### 4.3 Cherche les éléments — trois filtres, sans lui

Pour chaque élément d'écran :

1. **Technique.** Sur le web, écarte les bibliothèques marquées `unavailable` dans l'index officiel (`https://ui.shadcn.com/r/registries.json`, champ `health.status`), et celles qui sont payantes, demandent un compte ou ne sont pas compatibles avec la stack. Une bibliothèque `degraded` reste utilisable — plusieurs des meilleures le sont, parce qu'une partie de leurs composants échoue à la validation automatique — mais vérifie que l'élément retenu s'affiche et s'installe (`view`) avant de t'en servir. ⚠️ Le champ `ranking` de cet index mesure la santé et la taille d'une bibliothèque, **pas la qualité de son design** : il sert à écarter, jamais à choisir.
2. **Pertinence.** Cherche le besoin dans les 4 ou 5 sources réputées pour ce type d'élément (`npx shadcn@latest search @<bibliothèque> -q <mot>`) :

   | Plateforme | Sources |
   |---|---|
   | Application web | blocs officiels shadcn d'abord (`@shadcn` : tableaux de bord, barres latérales, connexion…) |
   | Site web | pour les sections (héro, tarifs, témoignages, appel à l'action) : `@tailark`, `@magicui`, `@aceternity`, la partie gratuite de `@shadcnblocks` |
   | iOS, Mac | composants système SwiftUI |
   | Android | composants Material 3 |
   | Windows | contrôles Fluent de WinUI |

   Une réputation vieillit : vérifie que la source est toujours saine et active. Une meilleure source apparaît ? Utilise-la, et ajoute-la à ce tableau.
3. **Visuel.** Pour les éléments qui portent l'identité (héro, tarifs, écran principal de l'app), **regarde** les aperçus des meilleurs candidats (Claude in Chrome sur le site de la bibliothèque) et élimine toi-même. Pour le reste (boutons, champs, menus), les composants officiels suffisent : ne perds pas de temps à comparer.

Avant d'utiliser une bibliothèque communautaire, lis son code (`npx shadcn@latest view <nom>`) : c'est du code écrit par un tiers, comme un skill pour `/cherche-skill`. Et note les icônes que chaque bloc embarque (`dashboard-01` installe les icônes Tabler) : elles seront remplacées par le jeu du projet.

### 4.4 Propose des écrans tout faits — sur le canevas Design

Le canevas Design de Claude pose plusieurs écrans côte à côte sur une page privée, qu'il peut ouvrir, commenter et partager. C'est son Figma. Lance `Artifact` avec `action: "quickstart"` et `intent: "design"`, puis suis les instructions du type « Design ».

- **L'écran qui prouve la valeur, en 3 variantes complètes**, chacune un assemblage cohérent et une intention différente (par exemple : sobre et dense / éditorial et aéré / plus expressif). Chaque variante sous un titre d'une ligne qui dit son parti pris.
- **Les autres écrans, en une seule version**, dans la variante qui te semble la plus juste — ils suivront la variante qu'il choisira.
- Taille de la plateforme (tableau de l'étape 1), système des étapes 2 et 3, composants reproduits fidèlement d'après leur code, et **contenu réaliste du domaine** : vrais libellés, le nom le plus long que le produit recevra, jamais de faux latin.
- Sous chaque écran, en petit, la liste des éléments utilisés et leur source. Il n'a pas à la lire ; elle sert à la construction.

### 4.5 Itère sur ses réactions

Donne-lui le lien : *« Regarde, dis-moi ce que tu aimes et ce que tu n'aimes pas, en vrac — sur le canevas en commentaire ou ici. »* Ses retours seront globaux (« le haut est trop chargé », « plus comme Linear », « je préfère la B mais avec les cartes de la A ») : c'est à toi de les traduire en éléments à changer, de rechercher d'autres candidats si besoin (étape 4.3), et de republier. Lis les commentaires du canevas avec `ArtifactComments`.

Ne lui demande jamais de choisir un composant isolé. Quand il hésite, propose deux versions de l'écran entier, pas deux composants.

### 4.6 Mets le carnet de goût à jour

Quand il a validé, ajoute à `carnet-de-gout.md` une entrée datée : le projet, ce qu'il a choisi, ce qu'il a rejeté et pourquoi s'il l'a dit, les sources dont les éléments ont plu. Ses mots, pas une interprétation. Une préférence qui revient sur deux projets devient une règle en tête du carnet.

## 5. Ce que les écrans figent

Les écrans validés deviennent la référence de la construction. Les éléments et leurs sources partent dans `docs/DESIGN.md` : à la construction, on assemble ce qui est nommé, on n'invente plus.

⚠️ Le canevas n'existe que côté Claude : Codex ne le voit pas. Tout ce qui a été décidé sur le canevas doit donc finir dans `docs/DESIGN.md`.

## 6. Écrire

**`docs/DESIGN.md`**, court :

- Contexte : produit, public, plateforme, la phrase de l'étape 1.
- Palette : la source (thème tweakcn et retouches), ce que la correction a changé, et les valeurs finales clair / sombre dans un tableau en hexadécimal **et** OKLCH — l'hexadécimal se transpose sur toutes les plateformes.
- La sortie du script de contraste, finale.
- Polices (et leur source), icônes, arrondi, espacement, mouvement, le pari — chacun avec son pourquoi.
- Le lien du canevas, la liste des écrans validés et, pour chacun, les composants et blocs utilisés (avec les icônes qu'ils embarquent à remplacer).
- **Mise en page : hypothèse** jusqu'à la première tranche livrée. Les largeurs et la densité ont été calées sur du contenu inventé : à remesurer sur du contenu réel, puis à figer.
- Journal des décisions : date, décision, pourquoi.

**Les jetons dans le format de la plateforme**, en bloc prêt à coller :

- **Web (shadcn)** : le CSS corrigé produit par le script (`:root` et `.dark`, OKLCH). Il ira dans le CSS global ; c'est ce fichier qui fera foi, `DESIGN.md` explique pourquoi. Polices chargées par le framework (`next/font` sur Next.js), jamais par un lien vers un service tiers.
- **iOS et Mac (SwiftUI)** : un jeu de couleurs du catalogue d'assets par jeton, avec une variante claire et une sombre.
- **Android (Jetpack Compose)** : un `ColorScheme` clair et un sombre, au format du thème Material 3.
- **Windows (WinUI)** : un `ResourceDictionary` avec des `ThemeDictionaries` Light et Dark.
- **App de bureau en technologies web** : le CSS, comme pour le web.
- **Stack pas encore choisie** (`/planifie` vient après) : le tableau hexadécimal suffit ; le format s'écrira à l'installation.

Le jeu d'icônes se fige à l'installation de la stack : changer de jeu ensuite oblige à repasser sur chaque écran. C'est pour ça qu'il se choisit ici.

**Puis le `CLAUDE.md` du projet** : une carte, pas une copie. Écris ce bloc entre ses marqueurs (remplace-le s'il existe, sinon ajoute-le à la fin), et ne touche à rien d'autre :

```markdown
<!-- design:start -->
## Design — <nom du projet>

Plateformes : <site web / application web / Mac / Windows / iOS / Android>. Direction, palette, écrans validés : `docs/DESIGN.md` —
**à ouvrir avant de construire ou de remanier un écran**.

**Jetons** : <fichier source> fait foi. Jamais de couleur en dur, toujours les jetons sémantiques.
**Icônes** : <jeu> — un seul jeu, jamais un second.
**Composants** : assembler ceux nommés dans `docs/DESIGN.md` avant d'en écrire un nouveau.
**Plancher d'accessibilité, opposable** : texte 4,5:1 · interface 3:1 · focus clavier visible ·
animations coupées si l'utilisateur les réduit · jamais l'information par la seule couleur.
Après tout changement de couleur : `node <dossier du skill design>/scripts/contraste.mjs <fichier>`.
<!-- design:end -->
```

Termine dans la conversation, en trois lignes : le lien du canevas, ce qui est écrit, ce qui reste une hypothèse.

## Plancher d'accessibilité — non négociable

- Texte : 4,5:1 minimum (3:1 au-delà de 24 px, ou 18,7 px en gras). Éléments d'interface (bordures de champ, icônes porteuses de sens, focus) : 3:1. **En clair et en sombre.**
- Focus clavier toujours visible.
- Toute animation longue ou en boucle est coupée quand l'utilisateur a demandé à réduire les animations.
- Jamais l'information par la seule couleur : une erreur ou un statut a aussi une icône ou un libellé.
- Natif : la taille de texte suit les réglages du système (Dynamic Type sur iOS, taille de police sur Android).

Accepte ses choix contre ton avis en signalant l'incohérence en une ligne — **sauf** sur ce plancher : un choix qui le casse est un défaut, propose la variante la plus proche qui le tient.

## Règles

- Montre, ne décris pas. Une palette ou un écran se juge vu, jamais lu.
- Deux moments de choix pour lui : la palette, les écrans entiers. Jamais un composant isolé.
- Composer avec l'existant avant d'inventer un composant. Le reste, tu le tranches.
- Le vocabulaire du produit, mot pour mot.
- En français, sans anglicisme quand un mot français existe.
