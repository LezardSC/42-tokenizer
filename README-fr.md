# Altarian 42

[English version](/README.md)

Altarian42 (A42) est un token ERC20 sur Ethereum, réalisé pour le premier projet de la branche blockchain de 42.

L'idée : remplacer le système de wallet de l'école par un token. Les étudiants gagnent des A42 en validant des projets, des events et des achievements, et les dépensent dans la boutique de l'école. Une récompense ne peut être mintée que si plusieurs membres du staff (le Bocal) l'approuvent.

## Fonctionnalités

- **Token ERC20** basé sur OpenZeppelin (`ERC20`, `ERC20Capped`, `ERC20Burnable`).
- **Récompenses en multisig** : un owner propose une récompense, les autres la confirment, et elle ne peut être exécutée qu'une fois assez de confirmations réunies.
- **Supply plafonnée** : la supply totale ne peut jamais dépasser le cap fixé au déploiement.
- **Burn à l'achat** : les tokens dépensés dans la boutique sont brûlés.
- **Achievements** : la raison de chaque récompense est enregistrée on-chain pour l'étudiant.

## Choix techniques

- **Ethereum + Solidity** : le choix standard pour les smart contracts, avec le plus d'outils et de documentation.
- **Testnet Sepolia** : pour déployer et tester gratuitement dans un vrai réseau.
- **OpenZeppelin** : des implémentations ERC20 auditées, il ne reste qu'à écrire la logique spécifique.
- **Multisig** : aucun owner ne peut minter seul. Les owners sont censés être des membres du Bocal ; par exemple, 2 ou 3 confirmations parmi eux pour valider un achievement.
- **10 owners maximum** : un groupe assez petit pour que réunir les confirmations reste simple.
- **Cap** : chaque owner reçoit 42 000 tokens au déploiement, le reste du cap est réservé aux récompenses.
- **Hardhat** : pour compiler, tester et déployer. Les chemins dans `hardhat.config.js` ont été modifiés pour respecter l'arborescence demandée par le sujet.
- **Infura** : pour accéder à Sepolia sans faire tourner de nœud.

## Installation

### Prérequis

- Node.js 16+ (testé avec la v20.9.0) et npm
- La clé privée d'un wallet (MetaMask ou autre) pour déployer
- Une clé API [Infura](https://www.infura.io/), ou un autre fournisseur (il faut alors modifier `hardhat.config.js`)

### Étapes

```bash
git clone <repository-url>
cd tokenizer
npm install
```

Créez un fichier `.env` à la racine, à partir de `.env.example` :

```plaintext
PRIVATE_KEY = ''
INFURA_SEPOLIA_ENDPOINT = 'https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID'
CONTRACT_ADDRESS = ''
OWNERS = ''
NUM_CONFIRMATIONS_REQUIRED = ''
```

`OWNERS` est une liste d'adresses d'owners séparées par des virgules (10 maximum) et `NUM_CONFIRMATIONS_REQUIRED` le nombre d'entre eux qui doivent approuver une récompense. S'ils sont vides, le déployeur est le seul owner et 1 confirmation suffit.

### Compiler, tester, déployer

```bash
npx hardhat compile
npx hardhat test
npx hardhat run --network sepolia deployment/scripts/deploy.js
```

Après le déploiement, mettez la nouvelle adresse du contrat dans `CONTRACT_ADDRESS` du `.env` (à refaire à chaque redéploiement).

## Documentation

- [Multisig](/documentation/fr/Multisig.md) : proposer, confirmer et exécuter une récompense
- [Récompenses et achievements](/documentation/fr/RewardsAndAchievements.md) : mint des récompenses et enregistrement des achievements
- [Achat et burn](/documentation/fr/PurchasingAndBurning.md) : dépenser ses tokens dans la boutique
- [Cap](/documentation/fr/Cap.md) : plafond de supply et distribution initiale
- [Tester sur Remix](/documentation/fr/Remix.md) : déployer et essayer le contrat depuis le navigateur

## Licence

Projet du cursus 42. Le contrat est sous licence MIT.

## Auteur

jrenault
