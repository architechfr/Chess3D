# SFT Chess — Révision tactique approfondie (5 novembre 2026)

## Fonctionnalités implémentées
- Avertissement de toutes les pièces attaquées, même si une reprise compense la capture.
- Alerte indépendante des conseils de déplacement, plus tracé de la menace sur le plateau.
- Diagnostic tactique déclenchable manuellement : recherche de mat en un coup, clouages sur le roi, doubles attaques de pièces de valeur, enfilades potentielles.
- Suggestions de parades légales pour une pièce attaquée : déplacement, interception/protection ou capture de l'attaquant lorsque les critères locaux le permettent.
- Interception avant de jouer un coup autorisant un mat adverse immédiat ; confirmation par un deuxième appui.

## Contrôles de logique passés (12/12)
1. Mat en 1 sur la position du mat du sot.
2. Absence de faux mat en 1 depuis la position initiale.
3. Clouage sur le roi détecté.
4. Clouage non annoncé si la ligne est bloquée.
5. Double attaque d'un cavalier sur deux pièces majeures.
6. Enfilade potentielle tour-dame-tour.
7. Fou F8 attaquant cavalier A3 malgré reprise possible.
8. Prise en passant légale.
9. Petits et grands roques légaux.
10. Quatre promotions du pion.
11. Recherche de parades légales.
12. Vingt coups légaux en position initiale.

La page JavaScript est syntaxiquement valide.
Des essais ponctuels de performance sur positions de 20 à 32 coups légaux montrent une recherche de mat adverse en un coup après chaque option de l'ordre de quelques dizaines de millisecondes dans un moteur JS isolé. Ce n'est pas une mesure sur un téléphone ni un benchmark représentatif.

## Limitations
- Les clouages sont détectés sur les axes du roi, les enfilades et doubles attaques restent des indications géométriques/tactiques locales.
- Le calcul ne résout pas fiablement tous les sacrifices, mats forcés à plusieurs coups, attaques découvertes et combinaisons.
- Un vrai moteur de recherche multi-plis (par exemple Stockfish) reste nécessaire pour une évaluation fiable et forte.
- Il reste à tester les vues 2D/3D sur appareils réels, la latence en milieu de partie, et tous les scénarios de confirmation de coups.
- Branche séparée, non fusionnée dans main.
