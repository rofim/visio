# 📦 Rofim Visio

> Ce projet est un **fork** du repo [Vonage/vonage-video-react-app](https://github.com/Vonage/vonage-video-react-app).

## ⚙️ Installation et démarrage

### 1. Cloner le projet
```bash
git clone git@github.com:rofim/visio.git
```

### 2. Installer les dépendances
```bash
yarn
```

### 3. Lancer l’application
```bash
yarn start:frontend
```

---

## 🔧 Scripts utiles
- `yarn test` – Lancer les tests  
- `yarn lint` – Lancer le linter   
- `yarn lint:fix` – Formatter le code avec prettier et fixer les erreurs triviales avec eslint
- `yarn ts-check` – Vérifier la valider du code avec typescript

---

## 📂 Structure du projet
```bash

├── backend/                # Code serveur (Nous n'en avons pas l'utilité mais on conserve le code pour éviter des conflits lors des mises à jour)
└── frontend/src/           # Code source de l'application maintenu par l'équipe de Vonage
    └── rofim/              # Customisation de l'app pour rofim
        ├── api/            # Client HTTP vers les services backend de Rofim 
        ├── atoms/          # Variables partagé via des atoms Jotai (https://jotai.org/) 
        ├── context/        # Hook permettant d''hydrater le contexte envoyé par l'app frontend dans la visio (username / room / patienId etc...)
        ├── environments/   # Variables d'environement pour Rofim
        └── locales/        # Fichiers de traduction spécifique à Rofim. Soit pour des nouvelles traductions, soit pour surcharger les traductions de base (/frontend/src/locales) 
```

---

## 🤝 Méthode de travail

Ce projet étant issu d’un **fork**, nous devons veiller à ne pas modifier directement le code source provenant des équipes de **Vonage**.  
En effet, afin de pouvoir bénéficier des futures évolutions et correctifs publiés par Vonage, il est indispensable d’éviter tout conflit dans la codebase d’origine.  

Pour cela, nous avons **dupliqué l’ensemble des fichiers de base de l’application** dans le dossier :  
`frontend/src/rofim`  
Ce dossier constitue notre propre base de code, que nous pouvons faire évoluer librement.  

Le projet se compose de deux parties principales :  
1. **L’outil de visioconférence**  
2. **L’application React qui l’héberge**

### Partie visioconférence
Les hooks et composants liés à la visioconférence reposent sur des règles métier spécifiques à Vonage.  
👉 **Ces fichiers ne doivent donc pas être modifiés directement.**

Si un composant ne peut pas être facilement dupliqué dans la base de code Rofim, il devra faire l’objet d’une contribution en amont, via une Pull Request adressée à Vonage :  
[Soumettre une PR à Vonage](#soumettre-une-pr-à-vonage)

### Partie applicative
Pour tout le reste, nous sommes libres d’apporter les modifications nécessaires :  
- Ajouter de nouvelles pages au router  
- Gérer des effets d’animation ou de transition  
- Personnaliser l’interface  

Concernant la **modification visuelle des composants**, nous pouvons intervenir à deux niveaux :  
- Manipuler le **DOM** pour ajouter ou supprimer des éléments  
- Cacher ou ajuster certains composants via le **CSS**


### Travailler avec Vonage

Dans un premier temps il nécéssaire de créer un nouveau remote avec Git pour pointer vers le repo de Vonage.
```bash
git remote add vonage git@github.com:Vonage/vonage-video-react-app.git
```
Vonage nous demander également de [signer nos commits](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification#ssh-commit-signature-verification)

#### Mettre à jours l'app

Afin de récupérer les modifications 

```bash
git fetch vonage        # Mettre jour le remove vonage
git checkout develop    # Se placer sur notre branche develop
git pull                
git merge vonage/main   # Récupérer les nouveaux commit de la branche main de vonage   

# ... résoudre les conflits
git push origin develop
```

Attention, dans Github, quand on ouvre une PR, par défaut la target est la branche main de vonage.
Ne pas oublier de changer pour faire pointer nos PR vers rofim/visio =>/develop

#### Soumettre une PR à Vonage

La branche de travail de Vonage est develop.
[Guideline pour contribuer à Vonage](https://github.com/Vonage/vonage-video-react-app/blob/main/docs/CONTRIBUTING.md)

```bash
git fetch vonage                # Mettre jour le remove vonage
git checkout vonage/develop     
git chechout -b XXXX            # créer une branche de feature à partir de vonage/develop

#en fin de travail
git push origin XXXX
```

Sur notre repo Github, pour envoyer le PR à Vonage, ouvrir la PR en pointant vonage/develop
Pour faire atterrir les modifications chez nous, cherry-pick le commit sur develop.
