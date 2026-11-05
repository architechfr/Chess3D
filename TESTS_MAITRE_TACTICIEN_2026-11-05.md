# Revue du Maître tacticien — 5 novembre 2026

## Correctif proposé
- Signaler les pièces actuellement attaquées même lorsque la meilleure suite de captures/reprises aboutit à un échange matériel nul.
- Conserver un avertissement distinct et visible : il ne doit pas être remplacé par un conseil sur la pièce sélectionnée.
- Afficher une flèche de l'attaquant vers la cible en mode libre, ainsi que des cercles rouges ou orange sur le plateau 2D.
- Présenter en priorité les menaces présentes lors des demandes d'indices, et non uniquement les pertes nettes.
- Ne jamais présenter une attaque comme une certitude de capture ou une pièce attaquée comme une perte acquise.

## Tests de logique exécutés sur le code du dépôt
1. Fou F8 vers cavalier A3, avec reprise possible par le fou blanc C1 : menace détectée, bilan matériel local 0.
2. Fou F8 dont la diagonale est bloquée par un pion E7 : aucune menace sur A3.
3. Fou F8 vers cavalier A3 sans reprise possible : perte matérielle locale 3.
4. Menaces simultanées du fou et d'une tour : deux alertes détectées.
5. Attaquant cloué qui ne peut légalement capturer : pas de fausse menace.
6. Position initiale : aucune capture immédiate adverse.

Résultat : 6 tests logiques sur 6 réussis ; compilation syntaxique du JavaScript de la page réussie.

## Limites restantes
- Les tests ci-dessus ne sont pas des tests visuels en navigateur Android/iOS.
- L'analyse à profondeur courte ne garantit pas la détection des fourchettes, découvertes, combinaisons et mats à plusieurs coups. Un moteur d'analyse fort (Stockfish ou équivalent) sera nécessaire.
- Les couleurs et les annonces doivent encore être vérifiées manuellement dans toutes les vues et tous les modes (exercices, duel local, IA, 2D, 3D).
