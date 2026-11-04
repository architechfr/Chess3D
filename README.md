# SFT CHESS 3D

Jeu d’échecs 3D sur navigateur pour SALES FILS.

## Version publiée

**V5.6 — Le Maître pédagogue**

Le jeu est actuellement contenu dans `index.html` sur la branche `main`.

## Lancer le jeu

Ouvrir `index.html` dans un navigateur récent avec WebGL, ou le servir comme page statique par un hébergeur compatible. Le dépôt GitHub seul ne publie pas de site jouable.

## Fonctionnalités

- Échiquier et pièces en 3D, interface tactile et souris, zoom, caméra orientable, angle verrouillable et plein écran.
- Jeu local contre IA expérimentale ou deux joueurs sur le même appareil.
- Historique et export PGN.
- Maître : détection de certaines captures et reprises **légales**, avertissement avant un coup risqué, flèches pédagogiques.
- Nouveau mini-tutoriel **en trois étapes** : « ton coup », « sa réponse », « ta reprise ». Les coups sont montrés sans modifier la partie.
- **11 leçons**, dont une consacrée au cavalier A3 vers B5 attaqué par un cavalier noir D4 et défendu par un pion blanc C4.
- Gravure des coordonnées en capitales A–H sur le bord du plateau.

## Ce que le Maître distingue

- Une case légale n'est pas nécessairement sûre.
- Une pièce attaquée n'est pas automatiquement perdue.
- Un échange équilibré doit être expliqué **même sans perte nette**.
- Une variante est possible, mais l'adversaire n'est pas forcé de la jouer.

Lire [MAITRE_ECHECS_SPEC.md](MAITRE_ECHECS_SPEC.md) pour le contrat de qualité et les scénarios testés.

## Limites explicites

- Analyse tactique de courte portée, **pas encore** un moteur expert Stockfish.
- Modèles 3D et textures non définitifs.
- Pas de multijoueur en ligne ni de sauvegarde de profils hébergés.
- Tests logiques navigateur effectués pour la V5.6 avec WebGL simulé ; tests graphiques sur appareils mobiles réels encore nécessaires.
- Pas de déploiement automatique sur SALESFILS.COM.
