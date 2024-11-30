# Altarian 42

Si vous êtes anglophone, [voici une version anglaise](/README.md) de ce README.

Altarian42 vise à remplacer le système de wallet existant dans l'école.
En s'appuyant sur la technologie blockchain Ethereum, nous fournissons un moyen transparent, sécurisé et décentralisé pour les étudiants de gagner et de dépenser des tokens au sein de l'écosystème de l'école.
Les élèves peuvent gagner des tokens en réalisant des projets, en participant à des événements ou validant des achievements. Ces tokens peuvent être utilisés pour acheter des articles dans la boutique de l'école.
Le contrat met en œuvre une technologie de multisignature (multisig) pour améliorer la sécurité.

## Table des matières

- [Introduction](#introduction)
- [Caractéristiques principales](#caractéristiques-principales)
- [Choix de conception et justification](#choix-de-conception-et-justification)
- [Instructions d'installation](#instructions-dinstallation)
- [Dépendances](#dépendances)
- [Utilisation](#utilisation)
- [Tester le contrat sur Remix](#tester-le-contrat-sur-remix)
- [Plus de documentation](#plus-de-documentation)
- [Contribuer](#contribuer)
- [Licence](#licence)

## Introduction

Altarian42 est une solution basée sur la blockchain conçue pour moderniser le système de wallet de l'école. En tirant parti de la technologie blockchain, nous fournissons aux étudiants un moyen transparent, immuable et décentralisé de gagner et de dépenser des tokens au sein du système scolaire.

## Caractéristiques principales

- **Récompenses en tokens** : Les élèves gagnent des tokens en réalisant des projets, des événements ou des achievements sur la plateforme intra.
- **Dépense de tokens** : Les tokens peuvent être utilisés pour acheter des articles dans la boutique de l'école.
- **Sécurité multi-signature** : Nécessite des approbations multiples pour valider chaque récompenses, améliorant la sécurité.
- **Conformité à la norme ERC20** : Adhère à la norme ERC20 pour une large compatibilité.
- **Capped Supply** : L'offre de tokens est plafonnée afin de maintenir la rareté et la valeur des tokens.
- **tokens à brûler** : Permet de brûler des tokens lorsque les étudiants achètent des articles, réduisant ainsi le nombre total de tokens existants.

## Choix de conception et justification

#### Utilisation de la blockchain Ethereum

J'ai choisi la blockchain Ethereum comme base d'Altarian42 en raison de ses capacités robustes en matière de Smart Contracts et de son adoption généralisée. L'écosystème mature d'Ethereum fournit une plateforme sécurisée et décentralisée pour le déploiement de Smart Contracts, garantissant que le système de tokens est transparent et infalsifiable. Sa prise en charge de la logique programmable nous permet de mettre en œuvre des fonctionnalités complexes telles que les mécanismes de multisignature et les normes de tokens.

#### Solidity pour le développement de Smart Contracts

Solidity a été choisi comme langage de programmation pour le développement du Smart Contract parce qu'il s'agit du principal langage pour l'écriture de Smart Contracts sur Ethereum. Sa syntaxe est similaire à celle de JavaScript et de C++, ce qui le rend accessible aux développeurs. Les caractéristiques de Solidity nous permettent de mettre en œuvre la logique requise pour la distribution des tokens, la fonctionnalité multisig et d'autres comportements personnalisés nécessaires pour Altarian42.

#### Déploiement sur le réseau de test Sepolia

J'ai choisi de déployer et de tester le contrat sur le réseau de test Sepolia. Sepolia est un réseau de test Ethereum public qui simule l'environnement du réseau principal sans les coûts et les risques associés. Cela nous permet de tester en profondeur les fonctionnalités, la sécurité et les performances du contrat dans un cadre réaliste. L'utilisation de Sepolia permet d'identifier et de résoudre les problèmes dès le début du processus de développement.

#### Mise en œuvre de la multi-signature

Pour renforcer la sécurité, nous avons mis en place un mécanisme de multi-signature (multisig) pour les fonctions critiques telles que la récompense des étudiants. Cette approche exige des approbations multiples de la part de propriétaires désignés avant d'exécuter des transactions importantes ou de frapper de nouveaux tokens. Elle empêche tout propriétaire d'émettre unilatéralement des tokens, réduisant ainsi le risque d'abus ou d'erreurs. La configuration multisig garantit que la gouvernance du système de tokens est collaborative et sécurisée.
Les propriétaires doivent être des membres de l'administration de l'école, ici le Bocal.

Pour en savoir plus sur la mise en œuvre de Multisignature, consultez la [Documentation Multisig](/documentation/fr/Multisig.md).


#### Stratégie de plafonnement (Cap) et de distribution des tokens

Nous avons introduit un plafond (cap) pour l'approvisionnement en tokens afin d'assurer la rareté et de maintenir la valeur du token. Une quantité initiale de tokens est distribuée aux propriétaires pour faciliter les tests et les opérations initiales. Les tokens restants sont réservés pour récompenser les étudiants, assurant ainsi la pérennité de l'économie des tokens. En contrôlant l'offre totale, nous pouvons prévenir l'inflation et encourager une gestion responsable des tokens.

Pour en savoir plus sur le plafond et la distribution, voir la [Documentation sur le Cap](/documentation/fr/Cap.md).

#### Limitation du nombre de propriétaires

Nous avons limité le nombre de propriétaires à un maximum de 10 afin de maintenir une structure de gouvernance gérable et sûre. Le fait d'avoir un petit groupe de propriétaires de confiance simplifie la coordination requise pour le processus multisig. Cela réduit la complexité de l'obtention de confirmations pour les transactions et minimise le risque de problèmes de coordination qui pourraient survenir avec un grand groupe. Nous pouvons imaginer que chaque membre du Bocal est un propriétaire, et que 2 ou 3 d'entre eux sont nécessaires pour valider l'action de remise d'un achievement à un élève.


#### Utilisation des contrats OpenZeppelin

Nous avons utilisé les contrats d'OpenZeppelin pour les fonctionnalités ERC20, ERC20Capped et ERC20Burnable. OpenZeppelin fournit des implémentations bien auditées, sécurisées et conformes aux normes de l'industrie des composants de Smart Contracts. L'utilisation de ces contrats réduit les risques liés aux composants des contrats, des vulnérabilités et économise du temps de développement, ce qui nous permet de nous concentrer sur l'implémentation de la logique personnalisée spécifique à Altarian42.

#### Développement avec Hardhat

Hardhat a été choisi comme environnement de développement pour sa flexibilité et ses puissantes fonctionnalités. Il fournit un ensemble riche d'outils pour compiler, tester et déployer des Smart Contracts. Le système de plugins extensible de Hardhat et ses capacités de débogage complètes améliorent le flux de travail de développement. Il nous permet d'écrire des tests automatisés, de simuler des environnements de blockchain et de nous assurer que le contrat se comporte comme prévu dans différents scénarios.

J'ai mis à jour les chemins dans `hardhat.config.js` pour organiser les fichiers correctement, en maintenant un projet propre et structuré. La raison principale étant bien sûr les exigences du sujet.


#### Infura comme fournisseur

Pour interagir avec la blockchain Ethereum, j'utilise Infura, un fournisseur d'infrastructure Ethereum de confiance. Infura nous permet de déployer et d'interagir avec le Smart Contract Altarian42 sur le réseau de test Sepolia sans avoir à exécuter un nœud Ethereum complet. Sa fiabilité et sa facilité d'utilisation en font un excellent choix pour les projets basés sur Ethereum.

Lors de la configuration du projet, vous aurez besoin d'une clé API Infura pour vous connecter au réseau Sepolia. Assurez-vous que votre fichier `.env` inclut l'identifiant de votre projet Infura comme indiqué ci-dessous :

```plaintext
	INFURA_SEPOLIA_ENDPOINT = 'https://sepolia.infura.io/v3/VOTRE_TOKEN'
```


## Instructions d'installation

#### Conditions préalables

- **Node.js** : Versions 16.0.0 ou supérieures (v20.9.0 recommandée pour éviter des comportements inattendus, mais toutes les versions récentes devraient fonctionner).
- **npm** : Fourni avec Node.js
- **Git** : Pour le contrôle de version.
- **MetaMask Wallet** : ou tout autre portefeuille. Il est recommandé mais pas obligatoire pour ajouter une clé privée afin de déployer le contrat.
- **Un compte Infura** : ou tout autre fournisseur. Vous devrez mettre à jour les configs hardhat si vous décidez d'utiliser autre chose qu'Infura. Nécessaire pour se connecter au réseau de test Sepolia.

#### Etapes de l'installation

1. **Cloner le dépôt**
```bash
	git clone <repository-url>
	cd tokenizer
```

2. **Installer les dépendances**
```bash
	npm install
	npm install @openzeppelin/contrats
	npm install dotenv
```

3. **Créer un fichier d'environnement**
- Créez un fichier `.env` dans le répertoire racine.
- Ajoutez les variables d'environnement nécessaires. Vous pouvez trouver un modèle dans le fichier `.env.example`.

4. **Compilez les contrats**
```bash
	npx hardhat compile
```

5. **Exécuter les tests**
```bash
	npx hardhat test
```

6. **Déployer sur le réseau Sepolia**
```bash
	npx hardhat run --network sepolia deployement/scripts/deploy.js
```

7. **Mise à jour de l'adresse du contrat**
- Après le déploiement, mettez à jour l'adresse du contrat dans le fichier `.env`.
- Assurez-vous de mettre à jour cette adresse à chaque fois que vous redéployez le contrat.


## Dépendances

- **@openzeppelin/contrats** : Pour des implémentations sécurisées et standard de l'ERC20 et d'autres fonctionnalités.
- **dotenv** : Pour la gestion des variables d'environnement.
- **Hardhat** : Environnement de développement pour compiler, tester et déployer des Smart Contracts.

## Utilisation
- **Earning Tokens** : Les étudiants gagnent des tokens grâce à des réalisations, des projets et des événements prédéfinis.
- **Tokens de dépense** : Les tokens peuvent être dépensés dans la boutique de l'école pour acheter des articles, favorisant ainsi l'engagement.
- **Actions administratives** : Les propriétaires peuvent proposer et approuver des transactions via le mécanisme multisig, garantissant ainsi une gouvernance sécurisée.

## Tester le contrat sur Remix

Si vous préférez tester et interagir avec le Smart Contract `Altarian42` en utilisant l'IDE Remix, voir la [Documentation de test sur Remix](/documentation/fr/Remix.md)

## Plus de documentation

Pour une plus grande documentation sur le projet, [regardez la documentation du projet](/documentation/fr/Altarian42.md).

## Contribuer

Les contributions sont les bienvenues ! Veuillez forker le dépôt et soumettre une demande d'extraction avec vos changements. Assurez-vous que tous les tests sont réussis et que vous respectez les normes de codage du projet.

## Licence

Ce projet est sous licence MIT.