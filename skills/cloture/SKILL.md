---
name: cloture
description: Clôturer une phase de développement en la vérifiant vraiment — reprendre les critères d'acceptation du plan un par un, regarder l'app avec Playwright (375 px et bureau, mode sombre, les cinq états, contenu réaliste, console propre), contrôler le cloisonnement et les secrets, dérouler les parcours de régression, puis déposer les traces (parcours du PLAN.md, carnet de bord, commit). Utilise sur /cloture, "la phase est finie", "on peut clôturer ?", "vérifie que c'est terminé", "termine la phase", "c'est livrable ?", ou avant d'annoncer qu'une tranche est terminée. S'adapte au projet et saute ce qui n'existe pas. Ne dit jamais qu'une chose fonctionne sans l'avoir exécutée — le rapport final sépare ce qui est vérifié, ce qui ne l'est pas et pourquoi, et ce qui est cassé.
---

# /cloture

Tu vérifies qu'une phase est réellement terminée, puis tu déposes ses traces. Tu n'es pas là pour confirmer une impression : tu exécutes, tu regardes, et tu rapportes ce que tu as vu — y compris ce que tu n'as pas pu voir.

**La règle qui prime sur toutes les autres** : ne jamais annoncer qu'une chose fonctionne sans l'avoir lancée. Un critère coché sans preuve est un mensonge, pas un raccourci. « Je n'ai pas pu vérifier X » est une sortie acceptable.

## Process

### 1. Situe la phase et détecte le terrain

Lis `docs/PLAN.md`. Repère la phase à clôturer : la première dont les critères ne sont pas tous cochés. Si plusieurs sont candidates, demande laquelle — une seule question, puis enchaîne.

**Pas de `docs/PLAN.md`** : demande en une phrase ce qu'on clôture, puis fonctionne en mode réduit — étapes 3, 4 et 6 seulement. Ne bloque pas, ne réclame pas un plan qui n'existe pas.

Détecte ensuite, sans poser de question, ce que le projet possède. Chaque absence fait sauter une étape, silencieusement :

- Le `CLAUDE.md` du projet — direction de design, interdits, règles de contenu opposables, carnet de bord éventuel
- La section **Contenu de test** du plan — le jeu de données réaliste
- La section **Parcours à repasser** — les régressions
- Une base de données, une authentification, des écrans affichant des données personnelles
- Un mode sombre

Annonce en deux lignes ce que tu vas vérifier et ce que tu sautes, puis enchaîne sans attendre de validation.

### 2. Reprends les critères d'acceptation un par un

Chaque critère de la phase reçoit un verdict et **la preuve qui va avec** :

- **Vérifié** — avec ce qui l'établit : la manipulation faite, la sortie obtenue, la capture regardée
- **Non vérifiable** — avec la raison exacte : dépend d'un service non configuré, demande une donnée réelle absente, ne s'observe qu'en production
- **Échoué** — avec ce qui se produit à la place

⚠️ Un critère ne se coche jamais par déduction. « Le code le fait donc ça marche » n'est pas une preuve — c'est exactement le raisonnement qui laisse passer les bugs que personne ne verra avant un vrai utilisateur.

### 3. Regarde l'app

Lance le projet et ouvre-le **avec Playwright** — navigateur séparé, les onglets de l'utilisateur ne bougent pas. Ne demande pas la permission de regarder : c'est le cœur de cette phase.

Utilise le **contenu de test** du plan. Pas de « Jean Dupont », pas de trois lignes de démonstration : le libellé le plus long que le produit puisse recevoir, le volume qui déclenche la pagination, l'enregistrement au minimum de champs remplis.

Contrôle à chaque fois :

- **375 px de large autant que le bureau.** C'est là que les cartes s'écrasent et que les tableaux débordent.
- **Le mode sombre**, si le projet en a un.
- **Les cinq états** : vide (aucune donnée, et c'est normal), en chargement, en erreur (le serveur ne répond pas), débordé (beaucoup de données), action en cours (bouton désactivé le temps du traitement).
- **Les états d'interaction** : survol, focus clavier visible, champ en erreur.
- **La console.** Aucune erreur. Une erreur rouge ne se voit pas à l'écran et finit en page blanche chez un vrai utilisateur.
- **Les règles opposables du `CLAUDE.md`** du projet — direction de design, interdits, vocabulaire imposé. Un libellé qui les casse est un défaut, pas un détail.

Corrige ce qui casse **avant** de rapporter, et note ce que tu as corrigé.

### 4. Sécurité

**Le test des deux comptes**, si la phase affiche des données appartenant à quelqu'un. Deux comptes, ouvrir une ressource avec le premier, relever son identifiant dans l'adresse, se reconnecter avec le second, retaper la même adresse. Si la ressource du premier s'affiche, le cloisonnement est cassé — c'est bloquant, la phase ne se clôture pas.

⚠️ Un écran qui masque un bouton ne protège rien. Le contrôle qui compte est côté serveur, et c'est celui-là qu'il faut mettre en défaut.

**Les secrets** : vérifie qu'aucune clé n'est partie dans le dépôt ni dans le code envoyé au navigateur. Sur un projet Next.js, contrôle en particulier qu'aucune variable sensible ne porte le préfixe `NEXT_PUBLIC_` — il envoie sa valeur au navigateur, où n'importe qui la lit.

**Revue de code** ensuite, avec l'outil de revue de l'agent en cours : `/code-review` sous Claude Code, `/review` sous Codex. Elle porte sur les changements de la phase, ne modifie rien, et cherche les défauts de comportement, de sécurité et de performance. Rapporte ses constats sans les filtrer.

### 5. Régression

Déroule les **parcours à repasser** du plan — tous, pas seulement ceux de la phase qui vient d'être construite. C'est le seul filet tant qu'il n'y a pas de tests automatisés : l'utilisateur ne repassera pas les écrans anciens, et toi tu ne regardes spontanément que celui que tu viens de faire.

Un parcours cassé se rapporte comme un échec, même s'il n'a rien à voir avec la phase en cours. Surtout dans ce cas, en fait.

### 6. Rapporte, en français

Écris le rapport dans la conversation — c'est le seul endroit où l'utilisateur le lira. Trois colonnes, jamais mélangées :

<gabarit-rapport>
## Phase <n> — <titre>

**Vérifié** (<n>/<total>)
- <critère> — <la preuve : ce qui a été fait, ce qui a été vu>

**Non vérifié** (<n>)
- <critère> — <pourquoi c'est invérifiable ici, et ce qu'il faudrait pour le vérifier>

**Cassé** (<n>)
- <ce qui ne marche pas> — <ce qui se produit à la place>

**Corrigé en passant**
- <ce qui a été réparé pendant la vérification>

**Verdict** : clôturable / non clôturable — <en une phrase>
</gabarit-rapport>

⚠️ **Ne présente jamais un « non vérifié » comme un « vérifié ».** C'est la seule faute de ce skill qui compte vraiment : elle transforme un contrôle en illusion de contrôle, et l'utilisateur n'a aucun moyen de s'en apercevoir.

S'il reste quoi que ce soit dans **Cassé**, arrête-toi là. La phase n'est pas clôturable. Propose de corriger, ne dépose aucune trace.

### 7. Dépose les traces

Seulement si le verdict est « clôturable ».

1. **`docs/PLAN.md`** — coche les critères de la phase, et ajoute à **Parcours à repasser** ce que la phase rend désormais possible, formulé du point de vue de l'utilisateur (« créer un client, le retrouver dans la liste »), jamais en termes techniques. La liste est cumulative, on n'en retire jamais rien. Enrichis le **Contenu de test** des cas limites découverts en route.

2. **Le carnet de bord**, si le `CLAUDE.md` du projet en déclare un. Suis les rubriques que ce fichier impose. À défaut d'indication : ce qu'on a construit · ce que j'ai appris · les décisions et leur pourquoi, avec l'alternative écartée · les pièges rencontrés. Écrit à la première personne, du point de vue de l'utilisateur.

3. **Le commit** — propose-le, avec son message. Ne commite jamais sans accord, et ne pousse jamais sans demande explicite.

Termine par une ligne : ce qui est livré, et ce qui reste ouvert.

## Règles

- **Exécute, ne déduis pas.** Chaque affirmation de ce skill doit pouvoir répondre à « comment tu le sais ? » par autre chose qu'une lecture de code.
- **Enchaîne sans demander.** Une seule question au départ si la phase est ambiguë ; ensuite tu déroules. Un rituel qui interrompt à chaque étape ne se lance plus.
- **Saute ce qui n'existe pas, en silence.** Pas de plan, pas de base, pas de mode sombre — tu adaptes sans réclamer.
- **Le cloisonnement est bloquant.** Tout le reste peut se négocier ; une donnée lisible par le mauvais compte, non.
- **Ne reformule jamais un échec en réussite partielle.** Un critère à moitié tenu est un critère échoué.
- Écris en français, sans anglicisme quand un mot français existe.
- Le rapport va dans la conversation, jamais seulement dans un fichier.
