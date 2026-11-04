# SFT CHESS — Qualité du Maître d’échecs
Version de référence : V5.6

## Mission
Un débutant ne doit pas apprendre qu’une case verte signifie « sûre ». Une case peut être légale et attaquée, mais une reprise peut ensuite rendre l’échange équilibré. Le professeur doit montrer ce raisonnement, pièce par pièce, sans prétendre que l’adversaire jouera forcément la capture.

## Trois faits toujours distincts
1. **Coup légal** : le déplacement est autorisé et ne laisse pas le roi en échec.
2. **Case attaquée** : au moins une pièce adverse peut capturer la pièce si elle s’y déplace (capturabilité légale, y compris clouages).
3. **Bilan d’échange** : selon les reprises légales, le matériel peut être perdu, gagné ou échangé à valeur proche.

## Exemple de référence A3–B5
Position pédagogique :
`4k3/8/8/p1p5/2Pn4/N7/8/4K3 w - - 0 1`

- Coup envisagé : **cavalier blanc A3 → B5**.
- Risque : **cavalier noir D4 → B5** peut prendre le cavalier blanc.
- Réponse possible : **pion blanc C4 → B5** peut prendre le cavalier noir.
- Valeurs indicatives : cavalier 3, cavalier 3 ; cet échange potentiel n’est pas une perte gratuite.
- Le Noir peut aussi décider de ne pas capturer : présenter une **variante**, jamais une prédiction certaine.
- Le professeur doit proposer **trois étapes cliquables** avec flèches : « ton coup », « sa réponse », « ta reprise ».

## Priorité des conseils
1. Menace de mat, échec ou réponse forcée.
2. Mat et gain tactique immédiat disponibles.
3. Pièce réellement vulnérable après captures/reprises.
4. Cases attaquées avec reprise possible : expliquer le mécanisme même si le bilan est nul.
5. Développement, centre, structure de pions, plan stratégique.

## Charte visuelle
- Vert : coup légal sans alerte directe identifiée.
- Orange : prise possible.
- Rouge : menace / réponse adverse qui capture.
- Orange cerclé rouge : échange ou capture à vérifier.
- Turquoise : reprise du joueur.
- Le Maître doit annoncer les valeurs des pièces **dans la variante considérée** et indiquer si la suite n’est qu’une possibilité.

## Règles d’honnêteté pédagogique
- « Attaqué » ne veut pas dire « perdu ».
- Une reprise légale ne prouve pas que la suite soit stratégique favorable.
- Une évaluation matérielle locale n’est pas une évaluation profonde.
- Une réponse doit être recalculée au moment où la position change ; pas de flèches obsolètes.
- Le joueur peut confirmer un coup risqué : le Maître informe, mais ne décide pas à sa place.

## Validation V5.6
Tests de navigateur effectués sur moteur WebGL simulé pour vérifier la logique JavaScript, pas un rendu 3D graphique :
- 11 exercices dont les mouvements cibles sont légaux.
- Sans attaquant D4 : aucune alerte B5.
- Avec D4 mais sans pion C4 : capture possible, perte locale du cavalier ~3.
- Avec D4 et pion C4 : prise et reprise légales, bilan matériel local 0.
- Les étapes interactives montrent A3–B5, D4–B5, C4–B5.
- Confirmation du coup après avertissement.
- Pas d’erreur JavaScript dans ces scénarios.

## Ce qui reste indispensable avant de se dire « professeur de référence »
- Moteur Stockfish ou équivalent analysant plusieurs coups et évaluant sacrifices, mats, pièges différés.
- Feedback adapté aux enfants et adultes selon niveau et erreurs récurrentes, suivi persistant par profil.
- Explication pas à pas d’attaques découvertes, clouages, enfilades, fourchettes et finales.
- Tests couvrant échecs, clouages, roques, prise en passant, promotion, répétitions et annulations.
- Tests WebGL réels sur téléphones Android/iOS, contrôle de cadrage et performance.
- Le multijoueur reste à réaliser ; aides désactivées dans les matchs classés.
