---
name: planifie
description: Découper un PRD en phases indépendamment livrables par tranches verticales (tracer bullets), en tranchant seul les décisions techniques puis en rendant compte à la fin, et produire ou étendre `docs/PLAN.md` selon un template fixe (décisions architecturales + phases avec user stories, livrable, critères d'acceptation, dépendances). Utilise sur /planifie, "découpe le PRD", "fais le plan d'implémentation", "casse-moi ça en phases", "écris le plan", "étends le plan", "tracer bullets", "vertical slices", ou dès qu'il faut transformer un PRD en plan d'exécution versionné. Aval naturel de /cadre.
---

# /planifie

Découpe un PRD en phases indépendamment livrables par tranches verticales (tracer bullets). Sortie dans `docs/PLAN.md`.

## Process

### 1. Récupère le PRD

Par défaut, lis `docs/PRD.md`. Si un chemin de fichier est passé en argument, lis-le. Si rien d'utilisable, demande à l'utilisateur de pointer le fichier ou de coller le contenu.

### 2. Mode extension si PLAN existe

Si `docs/PLAN.md` existe déjà, lis-le. Repère les user stories du PRD non couvertes par une phase existante et les incohérences avec un PRD qui a bougé. Ne réécris pas les phases déjà validées ; propose des phases additionnelles ou des extensions ciblées, et signale les contradictions à l'utilisateur avant d'écrire.

### 3. Explore le codebase

Si tu n'as pas déjà exploré le codebase, fais-le pour comprendre l'architecture actuelle, les patterns en place et les couches d'intégration. Si le projet est vierge (greenfield), saute cette étape.

### 4. Tranche les décisions architecturales — seul

Avant de découper, identifie les décisions de haut niveau qui ne devraient pas bouger en cours d'implémentation :

- Stack technique : langage, framework, base de données, hébergement, services tiers payants. Elle découle de la section **Plateformes** du PRD : plusieurs plateformes visées, ou une seconde prévue en *Évolutions*, imposent une technologie qui les couvre toutes dès la v1.
- Décisions d'installation (pour shadcn : template, monorepo ou non, moteur des composants)
- Structure des routes / patterns d'URL
- Forme du schéma de base de données
- Noms des modèles de données clés
- Approche d'authentification / autorisation
- Secrets et variables d'environnement : où vivent les clés, ce qui n'est jamais versionné
- Frontières des services tiers

**Tu les tranches toi-même**, à partir du PRD et de l'état de l'art, et tu en rends compte à la fin (étape 9). L'humain tranche le produit, l'IA le technique : lui faire valider « base ou radix » le ralentit sans rien apporter. Et à ce stade, rien n'est installé — une décision n'est encore qu'une ligne dans un document, qu'on change en dix secondes s'il la conteste.

**Seule question légitime** : un fait produit que le PRD ne dit pas et que tu ne peux pas déduire (« un devis peut-il appartenir à plusieurs clients ? », « un collègue voit-il les dossiers des autres ? »). Jamais une question technique.

**Schéma de données.** Traduis toi-même le PRD en tables et colonnes, avec quatre questions que tu te poses : de quoi l'app doit se souvenir, ce qu'on sait de chacun, comment ils se relient, qui a le droit de voir quoi.

⚠️ Vérifie chaque lien **dans les deux sens** (« une photo appartient-elle à un seul chantier, ou peut-elle servir sur plusieurs ? »). Une erreur de cardinalité coûte deux minutes tant que la base est vide et devient une migration à risque dès qu'il y a des données réelles. C'est le cas typique où le PRD peut être muet : alors, et seulement alors, pose la question en français ordinaire.

Commence petit : ajouter une colonne plus tard est trivial, découper une table qui contient déjà les données de vrais clients ne l'est pas. Le minimum qui fait tourner la phase 1, pas le modèle complet imaginé d'avance.

**Autorisation.** Qui a le droit de lire et de modifier quoi, ressource par ressource — pas seulement qui a le droit de se connecter.

⚠️ Toute table contenant des données appartenant à un utilisateur porte la trace de **à qui elle appartient**. Sans cette colonne, le serveur répondra à « donne-moi le devis n°42 » sans savoir si le demandeur y a droit, et changer le numéro dans l'adresse suffit pour lire les données d'un autre client. Rajoutée après coup, elle oblige à reprendre chaque requête de l'app une par une.

**Secrets et environnement.** Trois points, décidés avant la première ligne de code :

1. **En local** : un fichier de variables non versionné, exclu par `.gitignore` **avant** qu'il existe.
2. **Chez l'hébergeur** : les mêmes valeurs saisies dans son interface, jamais dans le dépôt.
3. **Ce que le navigateur ou l'app installée a le droit de voir** : rien qui donne accès à quoi que ce soit. Une clé embarquée dans une page web ou dans une app mobile est une clé publique.

⚠️ C'est la seule décision de cette liste qui ne se répare pas en changeant du code : **un secret commité reste dans l'historique git après la suppression du fichier.** Avec Next.js, tout ce qui est préfixé `NEXT_PUBLIC_` part dans le navigateur, sans le moindre message d'erreur.

**Décisions d'installation, si le projet part sur shadcn.** Trois choix se figent à `shadcn init` et ne se défont qu'en réinstallant :

1. **Template** (`next`, `vite`, `astro`…) — la vraie question : *le produit a-t-il besoin d'un serveur à lui ?* Dès qu'il y a des comptes, une base ou une clé d'API à protéger, oui.
2. **Monorepo** — non par défaut ; oui seulement si l'app et la vitrine partagent des composants.
3. **Moteur des composants**, `base` ou `radix` — ⚠️ leurs API diffèrent composant par composant, et le mauvais réflexe produit un composant qui ne s'ouvre pas, **sans erreur en console**. Détail dans `rules/base-vs-radix.md` du skill shadcn.

Le **jeu d'icônes** est figé lui aussi, mais il appartient à `/design` : vérifie qu'il a été choisi, reprends-le.

**Services payants.** Préfère une offre gratuite quand elle suffit à la v1. Tout ce qui coûtera de l'argent chaque mois apparaît, chiffré, dans le compte rendu de l'étape 9.

Ces décisions vont dans l'en-tête du plan ; chaque phase peut s'y référer.

### 5. Découpe en tranches verticales

Découpe le PRD en phases **tracer bullets**. Chaque phase est une tranche fine qui traverse TOUTES les couches d'intégration de bout en bout, PAS une tranche horizontale d'une seule couche.

<règles-tranche-verticale>
- Chaque tranche livre un chemin étroit mais COMPLET à travers toutes les couches (schema, API, UI, tests)
- Une tranche terminée est démontrable ou vérifiable seule
- Préfère beaucoup de tranches fines à peu de tranches épaisses
- N'inclus PAS les noms de fichiers, noms de fonctions, ou détails d'implémentation susceptibles de changer
- INCLUS les décisions durables : routes, formes de schéma, noms de modèles
- Un écran n'est pas livré tant que ses états ne le sont pas : **vide** (aucune donnée, et c'est normal), **en chargement**, **en erreur** (le serveur ne répond pas), **débordé** (beaucoup de données), **action en cours** (bouton désactivé le temps du traitement). Ce sont des critères d'acceptation, pas des détails d'implémentation
</règles-tranche-verticale>

Les états ne sont pas du zèle : l'utilisateur teste en local, avec trois lignes de démo et un réseau instantané. L'état chargé est le seul qu'il verra jamais chez lui — les quatre autres n'apparaissent que chez ses clients. Une page blanche au premier chargement, un tableau vide qui passe pour un bug, un double clic qui crée deux enregistrements : ça se prévoit au plan ou ça se découvre en production.

### 6. Ordonne les phases — seul

Choisis l'ordre toi-même : d'abord la phase qui lève le plus d'incertitude, puis celle qui débloque le plus de suite, puis celle qui est démontrable le plus tôt. Respecte les dépendances techniques. Juge toi-même la granularité : une phase qu'on ne peut pas montrer à quelqu'un à la fin est trop fine ou mal coupée ; une phase de plus de quelques jours de travail est trop épaisse.

### 7. Écris le plan

Crée `docs/` si absent. Écris `docs/PLAN.md` selon le template. En mode extension, intègre les phases additionnelles aux phases existantes sans toucher au contenu déjà validé.

Alimente la section **Contenu de test** : le jeu de données minimal qui rend les critères d'acceptation vérifiables. Il se déduit du PRD — les limites de saisie, les champs facultatifs, les ordres de repli d'affichage, les seuils de pagination y sont déjà. Sors les cas concrets, valeurs comprises : pas « un nom long » mais le nom le plus long que le produit puisse recevoir. Sans cette section, tout se testera avec trois enregistrements courts et tout tiendra toujours.

Alimente la section **Parcours à repasser** : chaque phase y dépose le ou les chemins qu'elle rend possibles, formulés en français du point de vue de l'utilisateur (« créer un client, le retrouver dans la liste »), jamais en termes techniques. La liste est **cumulative** — en mode extension, on ajoute, on ne retire jamais le parcours d'une phase déjà livrée. C'est le seul filet contre les régressions tant qu'il n'y a pas de tests automatisés.

### 8. Inscris l'architecture dans le `CLAUDE.md` du projet

Le `CLAUDE.md` est relu à chaque session, par chaque agent : c'est une **carte, pas une copie**. Chaque ligne y coûte à chaque fois, et une règle recopiée finit par contredire sa source. N'y passe que deux choses : ce qui doit agir **sans qu'on pense à ouvrir `docs/PLAN.md`** (la colonne d'appartenance, la règle d'autorisation et les secrets : ils ne servent à rien si on ne les a pas sous les yeux au moment d'écrire la requête qui les oublie), et un pointeur vers `docs/PLAN.md` avec le moment où l'ouvrir. Tout le reste reste dans `docs/PLAN.md`.

Écris à la racine le bloc ci-dessous, encadré par ses marqueurs. Si les marqueurs y sont déjà, remplace ce qui se trouve entre eux ; sinon, ajoute le bloc à la fin. Ne touche à rien d'autre dans ce fichier. Reste court : le schéma complet, les phases et le détail de la stack ne s'y recopient pas.

```markdown
<!-- archi:start -->
## Architecture — <nom du projet>

**Stack** : <en une ligne : langage/framework · base de données · hébergement · authentification>

**Appartenance des données, opposable** : la colonne `<colonne>` sur <les tables concernées> dit à qui
appartient chaque ligne. Schéma complet dans `docs/PLAN.md`.

**Autorisation, opposable** : <la règle en une phrase>. Une seule fonction fait le contrôle, tous les accès passent
par elle. **Un écran qui masque un bouton ne protège rien : le contrôle qui compte est côté serveur.**

**Secrets, opposable** : <fichier local non versionné> · jamais dans le dépôt · <comment le déployé lit les siens>.
Un secret commité reste dans l'historique git après suppression du fichier.

**Plan, contenu de test et parcours à repasser** : `docs/PLAN.md` — à ouvrir avant de démarrer une phase et
avant toute mise en ligne.
<!-- archi:end -->
```

Confirme ensuite *« ✓ architecture inscrite dans `CLAUDE.md` »*.

### 9. Rends compte — il a son mot à dire

Tout a été tranché sans lui : c'est ici qu'il le découvre, et qu'il peut contester. Un compte rendu en français, court, sans jargon, dans la conversation :

- **Les décisions prises**, une ligne chacune : le choix, pourquoi en une demi-phrase, et ce que coûterait de changer d'avis plus tard. Mets en tête celles qui deviendront chères à défaire une fois la phase 1 construite (stack, schéma, autorisation).
- **Ce qui coûtera de l'argent**, chiffré par mois, et à partir de quand.
- **Les phases**, une ligne chacune : ce qu'il pourra faire ou montrer à la fin de la phase.
- **La phrase qui l'invite à réagir** : *« Si un choix te gêne ou que tu as une préférence, dis-le maintenant : ici, changer coûte une ligne ; une fois la phase 1 construite, ça coûte une migration. »*

S'il conteste, ajuste le plan et le bloc du `CLAUDE.md`, puis re-poste seulement ce qui a changé. S'il ne dit rien ou valide, on démarre la phase 1.

<plan-template>
# Plan : <nom de la feature>

> PRD source : <chemin ou identifiant>

## Décisions architecturales

Décisions durables qui s'appliquent à toutes les phases :

- **Stack** : ...
- **Frontend** : template, moteur des composants, monorepo ou non — figés à l'installation
- **Routes** : ...
- **Schema** : ... (les tables, et pour chacune la colonne qui dit à qui la donnée appartient)
- **Modèles clés** : ...
- **Authentification / autorisation** : qui peut lire et écrire quoi, table par table — pas seulement qui peut se connecter
- **Secrets** : où vivent les clés en local, ce qui n'est jamais versionné, comment le déployé lit les siennes
- (ajoute/retire des sections selon le contexte)

---

## Phase 1 : <titre>

**User stories** : <liste depuis le PRD>

### Ce qu'on livre

Description concise de cette tranche verticale. Décris le comportement de bout en bout, pas l'implémentation couche par couche.

### Critères d'acceptation

- [ ] Critère 1
- [ ] Critère 2
- [ ] Critère 3
- [ ] États de chaque écran de la phase : vide, en chargement, en erreur, beaucoup de données, action en cours
- [ ] Cloisonnement vérifié au test des deux comptes (si la phase affiche des données personnelles)

### Bloquée par

- Référence à la phase bloquante (s'il y en a)

Ou *« Aucune — démarrable immédiatement »* s'il n'y a pas de bloqueur.

---

## Phase 2 : <titre>

**User stories** : <liste depuis le PRD>

### Ce qu'on livre

...

### Critères d'acceptation

- [ ] ...

### Bloquée par

- ...

<!-- Répéter pour chaque phase -->

---

## Contenu de test

Le jeu de données minimal sans lequel les critères d'acceptation ne sont pas
vérifiables. Déduit du PRD, écrit une fois, réutilisé à chaque phase. Une ligne par
cas, en français.

- [ ] <le libellé le plus long que le produit puisse réellement recevoir>
- [ ] <l'enregistrement au minimum de champs remplis — celui qui teste les replis d'affichage>
- [ ] <le volume qui déclenche la pagination ou le défilement>
- [ ] <la valeur extrême d'un champ chiffré, dans les deux sens>
- [ ] <l'état vide : aucune donnée, et c'est normal>
- [ ] <le cas qui n'arrive qu'à deux comptes : une donnée appartenant à quelqu'un d'autre>

---

## Parcours à repasser

Ce que l'app doit toujours savoir faire. Une ligne par parcours, en français,
dans l'ordre où on l'exécute. Chaque phase livrée dépose les siens ici ; la liste
est cumulative.

À dérouler avec Playwright avant chaque mise en ligne, et après toute phase qui
touche à une partie déjà livrée — c'est ce qui attrape ce que personne ne
regarde plus.

- [ ] <parcours 1 — ex. : se connecter et arriver sur le tableau de bord>
- [ ] <parcours 2 — ex. : créer un client, le retrouver dans la liste>
- [ ] Test des deux comptes sur <les écrans qui affichent des données personnelles>
</plan-template>
