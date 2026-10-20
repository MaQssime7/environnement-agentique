---
name: investigue
description: "Trouver et corriger la cause d'un bug à partir d'un symptôme — reproduire, prouver la cause, corriger au plus court, rejouer. Utilise sur /investigue, ou dès que l'utilisateur décrit un comportement anormal (\"ça plante quand…\", \"je vois X mais j'attends Y\", \"pourquoi ça crash\", \"debug ça\"). Travaille en autonomie et ne s'arrête que devant un correctif irréversible. Ne sert pas à relire un diff : ça, c'est /code-review."
---

# /investigue

Dans cette méthode, l'humain tranche le produit et l'IA le technique. L'utilisateur décrit un symptôme ; il attend un bug corrigé et une explication en français. **Ne lui demande pas d'arbitrer** une hypothèse, un log ou un correctif — c'est ton travail, et chaque question le ralentit. Tu déroules seul, du symptôme jusqu'à la preuve.

**Ce qui distingue ce skill de `/code-review`** : `/code-review` lit un changement et cherche ce qui pourrait casser. Ici, quelque chose est déjà cassé : tu pars du symptôme observé et tu remontes à sa cause. Ne lance pas `/code-review` à la fin — la preuve d'un correctif, c'est le symptôme rejoué qui a disparu, pas une relecture.

## Ce qui doit être vrai à la fin

Choisis tes moyens (lecture du code, logs, tests, navigateur, base de données). Ce qui n'est pas négociable, c'est ce que tu peux prouver :

1. **Le bug a été reproduit avant d'être corrigé.** Sans reproduction, tu ne sauras pas si ton correctif marche. Si tu ne peux pas le reproduire, dis-le et dis ce qu'il te faudrait (une capture, l'adresse exacte, le compte concerné) — c'est la seule question légitime à poser.
2. **La cause racine est prouvée, pas devinée.** Une observation la confirme. Une cause « plausible » à la lecture du code n'est pas une cause prouvée. Si trois pistes successives tombent, arrête de creuser au même endroit : remets en cause ce que tu tenais pour acquis, ou remonte d'une couche (navigateur, serveur, base, hébergement, service tiers).
3. **Le correctif est le plus court qui traite la cause.** Pas de refactor opportuniste, pas d'amélioration au passage : elles noient le correctif et ajoutent leurs propres bugs.
4. **Le scénario de reproduction, rejoué à l'identique, ne montre plus le symptôme.** Et le chemin normal, celui qui marchait, marche toujours. Tests lancés s'il y en a.
5. **Il ne reste aucune trace de débogage.** Tague chaque log temporaire (`[DEBUG-xxxx]`), puis vérifie par recherche qu'il n'en reste aucun. Un log oublié part en production.

⚠️ **Ne journalise jamais un objet entier** (requête, session, utilisateur, réponse d'API, variables d'environnement) : il contient souvent un jeton, un mot de passe ou des données personnelles, et un log finit dans des fichiers ou un service tiers. Journalise le champ précis. Pour une valeur sensible, sa présence et sa longueur, jamais son contenu.

## Le seul arrêt

Arrête-toi **avant** d'appliquer un correctif qui ne se défait pas d'un simple retour en arrière du code : migration ou modification de données réelles, suppression, changement touchant l'authentification, les droits d'accès ou un paiement, action sur un service en ligne. Explique en français ce que tu vas faire, ce que ça change pour ses utilisateurs, et ce qui est irréversible. Attends le feu vert.

Tout le reste — modifier du code, ajouter des logs, lancer l'app — tu le fais sans demander.

## Compte rendu

Dans la conversation, en français, sans jargon :

- **Le problème** : ce qui se passait, en une phrase compréhensible par un non-technicien.
- **La cause** : pourquoi, en une phrase, et la preuve qui l'établit.
- **Ce qui a changé** : en clair, pas en noms de fichiers.
- **Vérifié** : ce qui a été rejoué et observé.
- **Non vérifié** : ce qui n'a pas pu l'être, et pourquoi. Ne laisse jamais croire qu'une chose a été testée si elle ne l'a pas été.

Propose ensuite le commit, avec un message qui explique la cause et non le symptôme.
