# SFT CHESS 3D — Maître tacticien enrichi (branche de test)

Jeu d’échecs 2D/3D avec Académie, détection des menaces et analyse tactique locale.

## Analyse Stockfish (nouveau)

- Bouton **♟ Analyser avec Stockfish** : démarre Stockfish 19 Lite Single en WebAssembly dans un Web Worker, sans bloquer l’interface.
- Trois profils : débutant, intermédiaire et avancé, avec des explications de profondeur différente.
- Affichage de la meilleure variante, du score et d’alternatives lorsqu’elles sont disponibles.
- Après le **premier déclenchement volontaire**, l’analyse se renouvelle automatiquement après chaque nouvelle position jouable ; les analyses anciennes ne sont jamais affichées pour une position modifiée.
- Bouton **Voir le coup** : utilise la suggestion du moteur quand elle correspond à la position courante, sinon conserve l’analyse locale.
- En cas de chargement impossible, le conseiller local reste utilisable.

L’analyse Stockfish nécessite une connexion au premier lancement dans cette branche : le worker de même origine `stockfish-worker.js` charge `stockfish-19-lite-single.js` et son fichier WebAssembly correspondant depuis jsDelivr (`stockfish@19.0.1`). Les moteurs complets sont plus volumineux ; cette édition utilise explicitement le moteur **Lite mono-thread** (pas de SharedArrayBuffer ni d’en-têtes COOP/COEP obligatoires).

**Production/offline :** copier `stockfish-19-lite-single.js` et `stockfish-19-lite-single.wasm` du même package et de la même version dans un dossier `vendor/stockfish/`, et modifier le chargeur pour privilégier les deux fichiers locaux. Cela évitera une dépendance CDN pour un usage hors ligne. Les binaires ne sont **pas inclus** dans cette proposition.

## Démarrage

Servir le dépôt à la racine d’un hébergement HTTPS ou en local avec un serveur HTTP. Les icônes et le service worker nécessitent une origine HTTPS (ou localhost).

## Principaux fichiers

- `index.html` : jeu, navigation, Maître tacticien et panneau Stockfish.
- `stockfish-bridge.js` : pont UCI asynchrone, arrêt/annulation, MultiPV.
- `stockfish-worker.js` : charge le moteur sur un worker.
- `service-worker.js` : cache de l’application (pas du moteur CDN).
- `manifest.webmanifest` et `icons/` : installation de l’application.

## Licence et transparence

Le moteur **Stockfish** et la distribution JavaScript/WebAssembly **Stockfish.js** sont sous **GPL-3.0**, maintenus par Nathan Rugg et leurs contributeurs : https://github.com/nmrugg/stockfish.js . Pour une redistribution des moteurs, conserver les licences et assurer l’accès aux sources correspondantes. Le conseiller local reste distinct et ne prétend pas fournir une analyse exhaustive.

## Tests et limites

- Tests syntaxiques des trois scripts : validés.
- Tests du protocole UCI simulé : handshake, MultiPV, meilleur coup, annulation/redémarrage, arrêt du worker validés.
- Tests du diagnostic tactique local : 12/12 positions de référence réussies lors de la révision précédente.
- **Non encore vérifié** : démarrage réel du moteur WASM CDN sur un téléphone Android/iOS, performance longue durée, stabilité réseau, et rendu utilisateur.
- Les détections locales des motifs (doubles attaques, enfilades) sont indicatives ; les scores ne constituent jamais une garantie que l’adversaire suivra la ligne calculée.
- Jeu en ligne non finalisé.

Ne pas fusionner la branche sur `main` avant validation d’utilisation.
