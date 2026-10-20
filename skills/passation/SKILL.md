---
name: passation
description: Passer la main entre Claude Code et Codex sur un même dépôt, ou reprendre après l'autre. Utilise UNIQUEMENT quand l'utilisateur le demande explicitement : /passation, ou une annonce claire qu'il passe sur Codex ou qu'il en revient ("je passe sur Codex", "je reviens de Codex"). Ne jamais le lancer de soi-même, ni en début de séance, ni parce que le dépôt a bougé : la bascule est rare. Deux sens : en sortie, laisser le dépôt reprenable par un autre agent — rien de non commité sans explication, décisions de la séance écrites, message de commit qui dit la suite ; en entrée, lire l'état réel avant d'écrire quoi que ce soit. Ne déclare jamais un dépôt propre sans avoir lancé les commandes.
---

# /passation

Deux agents alternent sur ce dépôt : Claude Code et Codex, selon le quota restant sur chacun. **Aucun contexte de conversation ne traverse la bascule.** Le dépôt est le seul canal : ce qui n'est pas écrit sur disque n'existe pas pour le suivant.

**La règle qui prime sur les autres** : ne jamais déclarer un dépôt propre sans avoir lancé les commandes. Un `git status` supposé ne vaut rien. « Je n'ai pas pu vérifier X » est une sortie acceptable ; « tout est propre » sans preuve ne l'est pas.

## Déterminer le sens

- L'utilisateur annonce qu'il passe sur Codex → **sortie**.
- L'utilisateur annonce qu'il revient de Codex → **entrée**.
- Ambigu → demander en une phrase, ne pas deviner.

---

## SORTIE — le suivant doit pouvoir reprendre sans moi

### 1. Lire l'état réel

```bash
git status --porcelain
git log --oneline -5
git branch --show-current
git stash list
```

Trois pièges à regarder explicitement :

- **HEAD détaché** — `git symbolic-ref -q HEAD` échoue. Un commit fait ici est orphelin : il n'appartient à aucune branche et disparaît du jour au lendemain. Le dire à l'utilisateur **avant** de committer quoi que ce soit.
- **Un stash oublié** — invisible dans `git status`, perdu de vue à la bascule. Le signaler, proposer de l'appliquer ou de le jeter.
- **Des fichiers non suivis** qui comptent (`??` dans le porcelain). Un fichier jamais ajouté ne part pas dans le commit et le suivant ne le verra pas dans l'historique.

### 2. Les décisions de la séance sont-elles écrites ?

**C'est le point qui casse le plus souvent, et le plus difficile à rattraper après.**

Une décision prise dans la conversation et pas écrite sur disque est perdue à la bascule. Le suivant refera le choix, différemment, sans savoir qu'il en existait un.

Reprendre la séance et lister ce qui a été tranché : un choix d'architecture, un piège découvert, une valeur mesurée, une option écartée et pourquoi. Pour chacun, vérifier qu'il figure **dans le document spécialisé qui couvre ce sujet** (design, plan, goûts, PRD…), et l'y ajouter s'il manque. Le `CLAUDE.md` est une carte, pas un dépôt : n'y écrire que l'état et la prochaine action (en **réécrivant** la section, jamais en l'allongeant), un pointeur vers un document nouveau, ou une règle qui doit agir sans qu'on pense à ouvrir un document. Si aucun document ne couvre le sujet, c'est le moment de demander à l'utilisateur où le ranger plutôt que de l'empiler dans le `CLAUDE.md`.

Ne pas écrire ce que le code dit déjà. Écrire ce qu'on ne peut pas déduire en lisant le dépôt : le pourquoi, l'alternative écartée, la mesure.

### 3. Rien ne doit tourner

Un rendu, un serveur de développement, un téléchargement en cours. Deux agents qui lancent le même rendu sur une machine à 8 Go, c'est un échec mémoire sans message clair. Vérifier, arrêter, le dire.

### 4. Le commit est le point d'arrêt

Pas de fichier de passation : le message de commit **est** le message au suivant. Il est déjà versionné, déjà lu des deux côtés, et il ne se périme pas.

Un message de passation dit trois choses :

```
<ce qui a été fait, à l'impératif ou au participe>

État : <ce qui marche, ce qui est vérifié, ce qui ne l'est pas>
Suite : <la prochaine action concrète>
```

Si du travail est à moitié fait et ne peut pas être terminé, le committer quand même **en le disant** dans le message — un chantier annoncé vaut mieux qu'un dossier de travail qu'on retrouve modifié sans explication.

Proposer le message à l'utilisateur et attendre son accord avant de committer.

### 5. Rapporter

En français, dans le message, jamais dans un fichier. Trois lignes suffisent : ce qui est commité, ce qui reste en chantier, la prochaine action. Plus l'alerte s'il y en a une (HEAD détaché, stash, processus en cours).

---

## ENTRÉE — lire avant d'écrire

### 1. Ce qui s'est passé depuis

```bash
git log --oneline -5
git status --porcelain
git branch --show-current
git stash list
```

### 2. Du non commité est un chantier, pas une base

Des fichiers modifiés que je n'ai pas touchés viennent de l'autre agent, ou de l'utilisateur. **Ne pas construire dessus sans comprendre ce que c'est.** Lire les modifications (`git diff`), déterminer si c'est un travail fini non commité ou un chantier interrompu, et le dire à l'utilisateur avant d'écrire.

Le cas dangereux : reprendre un fichier à moitié réécrit en croyant qu'il est complet, puis committer le tout. Le travail de l'autre est alors enterré dans un commit qui prétend faire autre chose.

### 3. Relire la carte

Le `CLAUDE.md` du projet et les documents qu'il désigne. S'ils ont changé depuis le dernier commit que je connais, les relire entièrement : c'est là que les décisions de l'autre séance ont été déposées.

Vérifier au passage que la carte correspond au terrain. Un `CLAUDE.md` qui décrit une structure que le dépôt n'a plus est pire que pas de documentation : le suivant lui fait confiance. Si l'écart est réel, le signaler à l'utilisateur.

### 4. Rapporter avant de commencer

Où en est le projet, ce qui a bougé depuis la dernière fois, ce qui est en chantier, et ce que je propose de faire maintenant. Attendre son accord avant d'écrire.

---

## Ce qui casse en pratique

- **Les deux agents en même temps sur le même dossier.** Écrasement silencieux : le second réécrit un fichier sans voir ce que le premier vient d'y mettre, et git ne montre qu'un état final. Un seul agent actif à la fois — si des fichiers bougent pendant la séance sans que j'y touche, s'arrêter et le dire.
- **Une skill modifiée d'un seul côté.** Les skills vivent en un seul exemplaire dans un dossier partagé (ici `~/.agents/skills/`), avec des liens depuis `~/.claude/skills/`. Une skill ajoutée par Claude Code atterrit comme vrai dossier et casse ce partage : la déplacer vers le dossier partagé et la remplacer par un lien.
- **Le budget d'instructions de Codex.** Il concatène les fichiers d'instructions et s'arrête à `project_doc_max_bytes` **sans rien dire**. Si le `CLAUDE.md` d'un projet grossit beaucoup, vérifier le cumul contre le réglage dans `~/.codex/config.toml`.
