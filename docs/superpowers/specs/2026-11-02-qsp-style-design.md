# QSP Style : styles partagés entre le portail et le serveur d'autorisation

## Intention

Le portail (`qsp-web`) et les pages rendues côté serveur (SSR) du serveur d'autorisation OAuth doivent avoir la même identité visuelle, pour qu'on ne ressente pas de rupture quand la popup de connexion s'ouvre.

Le serveur est une application Spring dans un autre dépôt. Il doit récupérer les styles par Maven, sous forme d'artefact produit à chaque release de ce dépôt.

Aujourd'hui, le portail n'a aucune identité propre : `src/styles/settings.scss` est vide et `src/plugins/vuetify.ts` se limite à `defaultTheme: 'dark'`. Ce projet définit donc l'identité en même temps que le moyen de la partager.

## Objectifs

- Un sous-projet dans ce dépôt, seule source des paramètres de style (couleurs, typographie, formes).
- Une identité QSP adoptée par le portail.
- Un jar Maven publié à chaque release, contenant un CSS utilisable sans outillage par des pages SSR.
- Des styles de base pour les éléments des pages serveur : page, carte, titres, champs, boutons, liens, messages d'erreur.

## Non-objectifs

- Modifier le dépôt du serveur d'autorisation. Ce projet s'arrête à la publication du jar et à une documentation d'intégration. Le serveur n'a aujourd'hui aucun template : `/login` est la page générée par Spring Security. La popup de connexion ne changera donc d'apparence qu'avec le projet suivant, une page de login personnalisée côté serveur, qui utilisera ce CSS.
- Un thème clair.
- Le logo (`src/assets/logo.svg`), qui garde ses couleurs pour l'instant.
- Une bibliothèque de composants réutilisables en dehors de ce CSS de base.
- Du JavaScript dans l'artefact Maven.

## Anti-objectifs

- Devoir modifier une couleur à plusieurs endroits : ce serait l'échec du projet, même si tout le reste fonctionne.
- Un artefact qui dépend de Vuetify, de Vue, ou d'un service externe (CDN de polices, par exemple).
- Un texte peu lisible : tout texte doit atteindre le contraste WCAG AA (4,5:1).

## Identité visuelle

Décidé avec Florian : thème sombre et accent bleu électrique `#00A3FF` (direction « Arc »).

| Rôle | Valeur |
|------|--------|
| Accent (`primary`) | `#00A3FF` |
| Texte sur accent | `#0D1117` |
| Fond | `#0D1117` |
| Surface | `#151B24` |
| Bordure | `#333D4D` |
| Texte | `#E6E9EF` |

Validé par la maquette ; l'accent sert aussi aux liens et à l'affichage de fréquence.

`tokens.json` contient aussi les rôles nécessaires à l'afficheur du transceiver : texte secondaire, avertissement et alerte. Leurs valeurs sont à définir par le builder, avec le contraste AA sur le fond de l'afficheur.

Choix de Claude, à vérifier à la lecture :
- Texte sombre sur les boutons bleus, pour la lisibilité.
- Police système pour l'interface et police monospace système pour les fréquences, sans fichier de police embarqué. Le portail abandonne donc Roboto.
- Rayons : 6 px pour les champs et boutons, 8 px pour les cartes, comme dans la maquette.
- Une couleur d'erreur et de succès à définir par le builder, avec le contraste AA sur la surface.
- La couleur codée en dur de `AppFooter.vue` passe sur un token.

## Structure

Choix de Claude :

- Le sous-projet vit dans `packages/qsp-style`, déclaré comme workspace Yarn du dépôt.
- Sa source de vérité est `tokens.json`. Vuetify a besoin des valeurs en JavaScript, et les pages serveur en CSS : JSON est le seul format lisible directement des deux côtés. Un script de build en génère un fichier de variables SCSS et un fichier de variables CSS. Tu avais parlé de SCSS et de CSS : les deux sont bien produits, mais on les modifie via le JSON.
- Le SCSS source des styles de base est compilé en un seul CSS sans dépendance, avec les variables CSS incluses.

Résultat du build :
- `dist/qsp-style.css` : variables CSS et styles de base, pour les pages serveur.
- `dist/_tokens.scss` : variables SCSS, pour les projets qui utilisent Sass.
- `tokens.json` : importé par le thème Vuetify du portail.

## Portail

`src/plugins/vuetify.ts` définit un thème sombre à partir de `tokens.json`, à la place du thème par défaut. L'apparence de tout le portail change donc, y compris les écrans existants. La police système remplace Roboto.

`src/components/TransceiverControl.vue` dessine sur un canvas, hors de portée du thème Vuetify. Sa palette verte codée en dur et `Roboto Mono` sont remplacées par les valeurs de `tokens.json` : l'accent de l'afficheur passe à `#00A3FF`, et la police à la monospace système. Aucune couleur ne doit rester codée en dur dans ce composant.

## Artefact Maven

Décidé avec Florian : coordonnées `fr.f4fez:qsp-style`, licence Apache-2.0.

Choix de Claude :

- Le job `Release` (`.github/workflows/release.yml`) construit et publie le jar, à la même version que le portail (entrée `version` du workflow).
- Publication sur GitHub Packages (Maven) du dépôt `Ham-QSP/qsp-web`.
- `packages/qsp-style` a son propre fichier `LICENSE` en Apache-2.0, à la différence du reste du dépôt (AGPL-3.0-or-later), et les métadonnées du jar l'indiquent.
- Le CSS est placé dans `META-INF/resources/qsp-style/qsp-style.css`. Spring Boot le sert alors à `/qsp-style/qsp-style.css` sans configuration.
- Le workflow devra pouvoir publier les paquets (`packages: write`), et le build doit avoir Java et Maven, ou produire le jar autrement. Le choix de l'outil est laissé au builder.

Le numéro de version du jar n'est pas celui de `package.json` (`0.0.0`) : c'est bien l'entrée du workflow.

## Intégration côté serveur

Le sous-projet fournit un `README.md` qui décrit : le dépôt Maven et l'authentification nécessaire pour lire GitHub Packages, la dépendance à ajouter, la balise `<link>` à poser dans les templates, les classes CSS disponibles, et la règle Spring Security pour que `/qsp-style/**` soit accessible sans connexion (sans elle, la page de login n'aurait aucun style).

Cette documentation sert à la future page de login personnalisée du serveur : elle indique le balisage attendu, puisqu'aucun template n'existe encore.

Il contient aussi une page HTML statique d'exemple avec une page de login, qui sert de démonstration et de vérification visuelle sans le serveur.

## Vérification

- Le build du sous-projet produit les fichiers attendus depuis un dépôt propre.
- Le portail compile (`vue-tsc`, `vite build`) et s'affiche avec le nouveau thème.
- Le contenu du jar est contrôlé : le CSS est au bon chemin, sans dépendance externe.
- Les combinaisons texte/fond sont contrôlées au niveau WCAG AA.
- La page d'exemple s'affiche correctement avec le seul CSS produit.

## Laissé au builder

- Le script de génération et ses dépendances.
- Le nommage des variables et des classes CSS, avec un préfixe `qsp-`.
- L'outil de construction du jar.
- L'ordre de découpage du travail.
