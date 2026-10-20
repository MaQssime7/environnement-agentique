---
name: cadre
description: Cadrer un projet par questionnement structuré et produire ou étendre `docs/PRD.md` selon un template fixe en 10 sections (Problème, Solution, Utilisateur cible, Plateformes, User Stories, Critères de succès, Hors périmètre, Évolutions prévues, Décisions d'implémentation, Notes complémentaires). Utilise sur /cadre, "cadre ce projet", "écris le PRD", "fais-moi un PRD", "crée le PRD", "produis le PRD", "étends le PRD", ou dès qu'il faut formaliser le cadrage d'un projet dans un document versionné. Vient après /interroge (amont) ; sur un projet à interface, /design suit et précède /planifie.
---

Tu interroges l'utilisateur pour produire ou étendre `docs/PRD.md` selon le template ci-dessous.

## Process

0. **Pas encore de dossier de projet** (on est dans le dossier personnel, ou dans un autre projet) : crée-le avant toute question de cadrage. Trois règles, parce que ce choix ne se refait pas :

   - **Le nom** : minuscules, chiffres et tirets, sans accent ni espace. Il servira aussi de nom de paquet, de dépôt GitHub et de projet chez l'hébergeur, et la plupart des outils d'installation refusent le reste. Sur mobile, le nom affiché dans l'App Store ou Google Play est distinct et peut être pris : vérifie qu'il est libre avant de t'attacher au nom. Propose la version corrigée (« `Mon Appli` → `mon-appli` ») et pars dessus.
   - **Le dossier ne bougera plus** : l'historique des conversations est rangé par chemin, déplacer ou renommer le dossier plus tard le détache de tout ce qui a été dit. Pour la même raison, la stack s'installera **dans ce dossier**, jamais dans un sous-dossier créé par un outil d'installation.
   - **Les secrets sont exclus avant d'exister** : `git init`, puis un `.gitignore` qui exclut `.env` et `.env.*` (sauf `.env.example`) avant le moindre autre fichier. Un secret commité reste dans l'historique même après suppression.

   Dis-lui ensuite en une ligne de relancer Claude Code dans ce dossier, avec la commande.

1. Explore le repo si nécessaire pour comprendre le contexte existant (`CLAUDE.md`, ADRs, glossaire métier, code adjacent). Réutilise le vocabulaire du projet dans le PRD et respecte les décisions architecturales déjà tranchées. Si la réponse à une question se trouve dans le repo, explore plutôt que de demander.

2. Si `docs/PRD.md` existe, lis-le. Croise avec le brief reçu et n'interroge que sur les deltas. Confronte les contradictions : *« Tu avais tranché X, le brief suggère Y, on garde lequel ? »*. Pas de PRD et pas de brief → ta première question est *« Qu'est-ce que tu veux cadrer ? »*.

3. Interroge une question à la fois, avec ta recommandation justifiée. Suis les dépendances : Problème → Utilisateur cible → Plateformes → Solution → Critères → Hors périmètre → Évolutions prévues. User Stories et Décisions d'implémentation émergent en transverse.

   **Plateformes** : ne demande pas « quelle technologie ? ». Demande *« Où et quand ton utilisateur s'en sert ? Au bureau sur un ordinateur, dans la rue sur son téléphone, les deux ? »* et déduis-en les plateformes, parmi six : site web, application web, Mac, Windows, iOS, Android. Nomme la plateforme (« iPhone »), jamais la technologie (« SwiftUI ») : c'est le travail de `/planifie`. `/design` part de cette section.

   Puis les questions propres aux plateformes retenues — des questions produit, que seul l'utilisateur peut trancher et que personne ne pose spontanément :

   - **App mobile ou de bureau** : doit-elle marcher sans connexion ? Envoie-t-elle des notifications ? Est-elle distribuée par l'App Store ou Google Play ? Si oui, dis-le en clair : Apple et Google prélèvent une commission (15 à 30 %) sur les achats faits dans l'app, et valident chaque version avant sa sortie — ça change le modèle économique et le rythme de mise à jour.
   - **Site web** : d'où viennent les visiteurs (recherche Google, réseaux sociaux, bouche-à-oreille) ? Quelle est la seule action qu'ils doivent faire en arrivant ?

4. **Juste après le hors périmètre, pose la question des évolutions. Elle ne se déduit d'aucune autre réponse, et personne ne la pose spontanément.** Demande *« Qu'est-ce que tu n'auras pas dans la v1, mais qui coûtera cher à rattraper si on ne le prépare pas maintenant ? »*, puis sur chaque item retenu : *« qu'est-ce que ça impose dès la v1 ? »*.

   Le hors périmètre couvre ce qu'on refuse, les critères ce qu'on livre. Rien ne couvre les **décisions irréversibles prises par défaut** — celles que personne n'a posées et qui se referment le premier jour. Quatre formes à chercher activement, l'utilisateur ne les nommera pas seul :

   - **une donnée non capturée est perdue** — un écran de statistiques construit dans six mois démarre à zéro si rien n'est enregistré aujourd'hui ;
   - **une structure de stockage ne se rechoisit pas** — ce qui est écrit en texte rédigé ne se compte pas, et le reconvertir suppose de reproduire tout ce qui l'a produit ;
   - **un identifiant instable casse tout ce qui pointait dessus ;**
   - **une plateforme ajoutée plus tard peut imposer de tout réécrire** — une app construite pour le seul iPhone puis étendue à Android un an après est souvent reprise de zéro. Si une autre plateforme est probable, elle va en Évolutions prévues, avec sa conséquence : la technologie choisie par `/planifie` devra la couvrir dès la v1.

   Une évolution sans conséquence sur la v1 n'entre pas au PRD : c'est une idée, elle sera demandée le jour où elle comptera.

   Puis, avant de basculer vers la rédaction, demande *« Quelque chose pour Notes complémentaires : risques, dépendances, hypothèses ? »*.

5. Quand chaque section peut être rédigée sans trou, annonce-le en une phrase et écris le PRD complet dans le chat selon le template. Les User Stories sont synthétisées à ce moment à partir des autres réponses et présentées à valider.

6. Le user valide ou corrige section par section. Sur correction, re-poste uniquement la section touchée. Une fois tout validé, écris `docs/PRD.md` (crée `docs/` au besoin) et confirme *« ✓ écrit dans `docs/PRD.md` »*.

7. **Puis inscris le cadrage dans le `CLAUDE.md` du projet.** Le `CLAUDE.md` est relu à chaque session, par chaque agent : c'est une **carte, pas une copie**. Chaque ligne y coûte à chaque fois, et une règle recopiée finit par contredire sa source. N'y passe que deux choses : ce qui doit agir **sans qu'on pense à ouvrir `docs/PRD.md`** (le hors périmètre : sans lui sous les yeux, une bonne idée du moment se construit trois semaines plus tard sans que personne ne se souvienne qu'elle avait été refusée), et un pointeur vers `docs/PRD.md` avec le moment où l'ouvrir. Tout le reste reste dans `docs/PRD.md`.

   Écris à la racine du projet (crée le fichier s'il n'existe pas) le bloc ci-dessous, encadré par ses marqueurs. Si les marqueurs y sont déjà, remplace ce qui se trouve entre eux ; sinon, place le bloc juste après la section qui présente le projet — à la fin seulement s'il n'y en a pas, où il serait enterré. Reste court : le problème, le public et les user stories ne s'y recopient pas.

   Ne touche à rien d'autre dans ce fichier, **sauf ce que l'écriture du PRD vient de rendre faux** : un état des lieux qui annonce « pas de `docs/PRD.md` », un renvoi « à valider en `/cadre` », un index qui ignore le fichier. Corrige-les et dis-le. Laisser une contradiction dans le seul fichier lu à chaque session coûte plus cher que la retenue.

```markdown
<!-- produit:start -->
## Produit — <nom du projet>

**Plateformes** : <la liste de la v1>. Toute décision d'écran ou de technologie s'y conforme.

**Hors périmètre, opposable** : <la liste, en énumération courte>. Une demande qui tombe dedans se signale
**avant** d'être satisfaite, elle ne se glisse pas dans une phase.

**Évolutions prévues** : chacune contraint la v1 dès maintenant (tableau dans `docs/PRD.md`). <Seulement les
contraintes qui agissent au moment d'écrire du code, une ligne chacune. Omets cette ligne si le PRD n'a aucune évolution prévue.>

**Cadrage** : `docs/PRD.md` — à ouvrir avant toute décision produit, ou devant une demande qui sort de l'ordinaire.
<!-- produit:end -->
```

   Confirme ensuite *« ✓ cadrage inscrit dans `CLAUDE.md` »*.

<prd-template>

## Problème

Ce que vit l'utilisateur : frustration, contexte, « pourquoi maintenant ». Prose en 3ème personne, pas en *je*.

## Solution

Direction produit du point de vue de l'utilisateur : ce que le produit lui permet de faire, pas comment c'est construit.

## Utilisateur cible

Profil + contexte d'usage, suffisamment précis pour imaginer une personne réelle.

## Plateformes

Les plateformes de la v1, parmi : site web, application web, Mac, Windows, iOS, Android — chacune avec la raison qui la justifie dans le contexte d'usage. Puis les réponses aux questions de la plateforme : hors connexion, notifications, distribution par une boutique d'applications ; ou, pour un site, la provenance des visiteurs et l'action attendue. Pas de technologie nommée.

## User Stories

Liste numérotée exhaustive au format *« En tant que `<acteur>`, je veux `<fonctionnalité>`, afin de `<bénéfice>` »*. Couvre interactions principales, états vides, erreurs, parcours alternatifs, cas limites.

## Critères de succès

Critères directement vérifiables : événement observable (clic, fichier produit, mail reçu) ou mesure objective (durée, nombre, seuil). Pas de jugement de comportement intérieur (« comprend X », « identifie Y »).

## Hors périmètre

Ce qu'on refuse explicitement. Exhaustif, c'est ce qui protège du sur-engineering.

## Évolutions prévues

Ni dans le périmètre, ni refusé. Tableau à trois colonnes : l'évolution · pourquoi pas maintenant · **ce que ça impose dès la v1**.

La troisième colonne est la seule raison d'être de la section, et sa règle d'admission : pas de conséquence identifiée sur la v1 → l'item n'entre pas. Sans cette règle, la section devient une décharge à idées et ruine le hors périmètre — *« c'est prévu de toute façon, autant préparer le terrain »* est le chemin le plus court vers des abstractions construites pour un besoin qui n'existera peut-être jamais.

Chaque contrainte est actionnable, pas une intention : *« stocker la fiche en champs séparés »*, pas *« penser à la structure »*. Signale ici les évolutions qui rouvriraient une porte fermée au hors périmètre, pour que la frontière soit connue avant d'être franchie.

*« Rien à signaler. »* si rien.

## Décisions d'implémentation

Comportement produit visible par l'utilisateur (limites chiffrées, états vides, format d'affichage, choix d'UX, form factor, erreurs). Pas de détails techniques internes (algorithmes, formules, variables d'env, noms de libs, catégories techno). Test mental : si l'utilisateur ne peut pas observer la différence à l'usage, c'est exclu.

## Notes complémentaires

Catch-all : risques, dépendances externes, hypothèses, références. Reste courte ; *« Rien à signaler. »* si rien.

Ce qui sera construit plus tard ne vient **pas** ici : ça va en *Évolutions prévues*, où la troisième colonne force à dire ce que ça coûte de ne pas le préparer. Un item futur noté dans un catch-all est une intention sans conséquence — c'est ainsi qu'on perd des données qu'il fallait capturer dès le premier jour.

</prd-template>

## Règles

- Vocabulaire = celui de l'utilisateur, verbatim.
- Pas de techno nommée, pas de trou, pas de chemin de fichier, pas de snippet de code dans le PRD.
- User Stories obligatoirement numérotées : US-1, US-2 ...