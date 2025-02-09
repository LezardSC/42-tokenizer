# Tester le contrat Altarian42 sur Remix

Ce tutoriel vous guide dans le déploiement et l'interaction avec le contrat intelligent `Altarian42` en utilisant l'**IDE Remix**.

## Table des matières

- [Prérequis](#prérequis)
- [Étapes](#étapes)
    - [1. Ouvrir Remix IDE](#1-ouvrir-remix-ide)
    - [2. Configurer l'espace de travail](#2-configurer-lespace-de-travail)
    - [3. Copier le code du Smart Contract](#3-copier-le-code-du-smart-contract)
    - [4. Importer les contrats OpenZeppelin](#4-importer-les-contrats-openzeppelin)
    - [5. Compiler le contrat](#5-compiler-le-contrat)
    - [6. Déployer le contrat](#6-déployer-le-contrat)
    - [7. Interagir avec le contrat](#7-interagir-avec-le-contrat)
    - [8. Tester les fonctions](#8-tester-les-fonctions)
    - [9. Simuler la propriété et les rôles](#9-simuler-la-propriété-et-les-rôles)
    - [10. Scénarios de test](#10-scénarios-de-test)
    - [11. Visualiser les événements et les logs](#11-visualiser-les-événements-et-les-logs)
- [Remarques](#remarques)
- [Déploiement sur un testnet (Optionnel)](#déploiement-sur-un-testnet-optionnel)
    - [1. Configurer MetaMask](#1-configurer-metamask)
    - [2. Connecter Remix à MetaMask](#2-connecter-remix-à-metamask)
    - [3. Déployer le contrat](#3-déployer-le-contrat)
    - [4. Interagir avec le contrat](#4-interagir-avec-le-contrat)
- [Erreurs courantes et dépannage](#Erreurs-courantes-et-dépannage)

## Prérequis

- **Navigateur Web**: Chrome, Firefox, ou tout autre navigateur moderne.
- **Accès Internet**: Pour accéder à Remix IDE à l'adresse https://remix.ethereum.org.
- **Extension MetaMask**: Installée et configurée (nécessaire uniquement si vous souhaitez déployer le contrat sur des testnets).

## Étapes

#### 1. Ouvrir Remix IDE

- Accédez à https://remix.ethereum.org depuis votre navigateur web.

#### 2. Configurer l'espace de travail

- Dans l'IDE Remix, cliquez sur l'icône **Explorateur de fichiers** dans le panneau de gauche.
- Créez un nouveau fichier pour votre contrat :
    Faites un clic droit sur le dossier `contracts` et sélectionnez **New File**.
    Nommez le fichier `Altarian42.sol`.

#### 3. Copier le code du Smart Contract

- Copiez le contenu de votre contrat `Altarian42.sol` dans le nouveau fichier que vous venez de créer dans Remix.

#### 4. Importer les contrats OpenZeppelin

- Comme le contrat utilise les contrats OpenZeppelin, vous devez les importer dans Remix.
- Remix supporte l'importation depuis GitHub, ce qui vous permet d'importer directement les contrats OpenZeppelin.

##### Mettre à jour les instructions d'importation:

Remplacez les instructions d'importation dans votre contrat par les suivantes :

```Solidity
    import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";
    import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/ERC20Capped.sol";
    import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/ERC20Burnable.sol";
```

- Si ces liens venaient à être obsolètes à l'avenir, retrouvez les nouveaux sur le [GitHub officiel d'OpenZeppelin](https://github.com/OpenZeppelin/openzeppelin-contracts)

#### 5. Compiler le contrat

- Cliquez sur l'icône **Compilateur Solidity** dans le panneau de gauche (elle ressemble à un marteau).
- Assurez-vous que la version du compilateur correspond à celle spécifiée dans le pragma de votre contrat (par exemple, `0.8.20`).
- Cliquez sur **Compile Altarian42.sol**.
- Si vous rencontrez des erreurs, vérifiez les instructions d'importation et assurez-vous que la bonne version de Solidity est sélectionnée.

#### 6. Déployer le contrat

- Cliquez sur l'icône **Déployer & Exécuter les transactions** dans le panneau de gauche (elle ressemble à un bouton de lecture).

##### Sélection de l'environnement

- Dans la section **Environnement**, sélectionnez l'une des options suivantes :
    - **JavaScript VM (Cancun (ou London))**: Pour les tests locaux dans Remix.
    - **Injected Provider - MetaMask**: Pour déployer sur un testnet via MetaMask.

##### Paramètres du constructeur

Vous devez saisir les paramètres du constructeur :

1. **_owners (address[])**: Un tableau d'adresses des propriétaires.
    - Exemple:
        - Si vous utilisez les comptes de la JavaScript VM de Remix :
    ```json
        ["0x5B3...Eed", "0xAb8...09b", "0x4B0...e37"]
    ```
        - Pour obtenir les adresses, copiez-les depuis le menu déroulant **Accounts**.

2. **_numConfirmationsRequired (uint256)**: Le nombre de confirmations requis pour les transactions multisignatures.
    - **Exemple**: `2`

3. **cap (uint256)**: Le plafond de tokens (limite de l'offre totale).

    - **Example**: Pour un plafond de 1 000 000 de tokens, saisissez `1000000`.

    - **Note**: N'incluez pas les décimales ici ; le contrat gère la conversion.

**Saisie des paramètres du constructeur**

- Dans la section **Déployer**, entrez les paramètres au format suivant :

```json
    ["<owner1>", "<owner2>", "<owner3>"], <numConfirmationsRequired>,
    <cap>
```

- **Exemple**:

```json
    ["0x5B3...Eed", "0xAb8...09b", "0x4B0...e37"],
    2,
    1000000
```
Assurez-vous de séparer les paramètres par des virgules et que le tableau d'adresses soit encadré par des crochets [].

##### Déploiement

- Cliquez sur **deploy** ou **transact**.
- Si vous déployez sur un testnet, MetaMask vous demandera de confirmer la transaction.

#### 7. Interagir avec le contrat

- Après le déploiement, l'instance du contrat apparaîtra sous **Contrats déployés**.
- Développez le contrat pour afficher les fonctions disponibles.

#### 8. Tester les fonctions

- **Fonctions multisignatures**:
    - `submitTransaction`: Proposer une nouvelle transaction.
    - `confirmTransaction`: Confirmer une transaction proposée.
    - `executeTransaction`: Exécuter une transaction après avoir reçu suffisamment de confirmations.
    - `revokeConfirmation`: Révoquer votre confirmation avant l'exécution.

- **Fonctions liées aux tokens **:
    - `balanceOf`: Vérifier le solde de tokens d'une adresse.
    - `getStudentAchievements`: Visualiser les réalisations d'un étudiant.
    - `buyGoodies`: Dépenser des tokens pour acheter des articles.

#### 9. Simuler la propriété et les rôles

- **Changement de compte**:
    - Utilisez le menu déroulant **Accounts** en haut du panneau **Déployer & Exécuter** les transactions pour changer de compte actif.
    - Cela vous permet de simuler différents propriétaires et étudiants.

- **Note**: Dans la JavaScript VM, les comptes sont préfinancés en ETH et possèdent des adresses distinctes.

#### 10. Scénarios de test

##### a. Soumettre et confirmer une transaction

1. **Soumettre une transaction**:

    - En tant que **Owner1**, appelez `submitTransaction` avec :
        `_student`: Adresse de l'étudiant (par exemple, un autre compte).
        `_amount`: Montant de la récompense (par exemple, 50).
        `_reason`: Motif de la récompense (par exemple, `"Excellent Performance"`).

2. **Confirmer la transaction**:

    - Passez à **Owner2** et appelez `confirmTransaction` avec :
        `_txIndex`: L'indice de la transaction (par exemple, `0` pour la première transaction).

3. **Optionnel**: Répétez la confirmation avec d'autres propriétaires si nécessaire.

**b. Exécuter une transaction**

- Une fois les confirmations requises obtenues, en tant que propriétaire, appelez `executeTransaction` avec :
    - `_txIndex`: L'indice de la transaction à exécuter.

- Vérifiez que le solde de l'étudiant a augmenté en conséquence.

**c. Vérifier les soldes et les réalisations**

- En tant qu'étudiant, appelez `balanceOf` avec votre adresse pour vérifier votre solde de tokens.
- Appelez `getStudentAchievements` avec votre adresse pour visualiser vos réalisations.

**d. Achat d'articles**

- En tant qu'étudiant, appelez `buyGoodies` avec :
    - `item`: Nom de l'article (par exemple, `"T-Shirt"`).
    - `cost`: Coût de l'article en tokens (par exemple, `20`).

- Vérifiez que votre solde diminue et que l'offre totale se réduit.

#### 11. Visualiser les événements et les logs

- La **Console** située en bas de Remix affiche les logs et les événements.

- Recherchez des événements tels que :
    - `SubmitTransaction`
    - `ConfirmTransaction`
    - `ExecuteTransaction`
    - `RewardGiven`
    - `GoodiePurchased`

- Ces événements vous aident à vérifier que les actions se déroulent comme prévu.

## Remarques

- **Gestion des décimales**:
    - Saisissez les montants (comme `_amount` et `cost`) sans tenir compte des décimales.
    - The contract automatically handles the conversion to the correct decimal places.

- **Format des adresses**:
    - Utilisez les adresses fournies dans le menu déroulant **Accounts**.
    - Assurez-vous que les adresses soient encadrées par des guillemets lorsqu'elles sont saisies sous forme de chaînes de caractères.

- **Gestion des erreurs**:

    - Si une transaction échoue, vérifiez le message d'erreur dans la **Console**.

    - Les erreurs courantes incluent :
        - Pas assez de confirmations.
        - Vous n'êtes pas propriétaire.
        - Solde insuffisant.
        - Indice de transaction invalide.

- **Tester les cas limites**:
    - Essayez de soumettre des transactions avec des données invalides (par exemple, un montant nul, des adresses invalides).
    - Tentez d'exécuter des transactions sans avoir reçu suffisamment de confirmations.

## Déploiement sur un testnet (Optionnel)

#### 1. Configurer MetaMask

- **Installer MetaMask**:
    - Ajoutez l'extension MetaMask à votre navigateur.

- **Ajouter le réseau Sepolia**:
    - Ouvrez MetaMask et cliquez sur le menu déroulant des réseaux.
    - Sélectionnez **afficher les testnets**.
    - Sélectionnez **Sepolia**
    - Si ce réseau n'apparaît pas, cliquez sur **Ajouter un réseau** et saisissez les détails du réseau Sepolia.

- **Obtenir des testnet ETH**:

    - Utilisez un faucet Sepolia pour obtenir des testnet ETH.
    - [Exemples de faucets](https://sepolia-faucet.pk910.de/)

#### 2. Connecter Remix à MetaMask

- Dans Remix, sous **Environnement**, sélectionnez **Injected Provider** - MetaMask.
- Approuvez la connexion dans MetaMask lorsqu'il vous le demande.

#### 3. Déployer le contrat

- Suivez les mêmes étapes que dans la section [Déployer le contrat](#6-deploy-the-contract).
- Assurez-vous de disposer de suffisamment d'ETH de test pour couvrir les frais de gas.

#### 4. Interagir avec le contrat

- Utilisez vos comptes MetaMask pour interagir avec les fonctions du contrat.
- Les transactions apparaîtront dans MetaMask pour approbation.
- Surveillez les transactions à l'aide d'un explorateur de blocs tel que [Etherscan pour Sepolia](https://sepolia.etherscan.io/).

## Erreurs courantes et dépannage

- **Erreurs de compilation**:
    - Assurez-vous que la version du compilateur Solidity dans Remix correspond à la version spécifiée dans le pragma de votre contrat.
    - Vérifiez que les instructions d'importation sont correctes et accessibles.

- **Arguments de constructeur invalides**:
    - Vérifiez que les tableaux sont correctement formatés (par exemple, `["addresse1", "addresse2"]`).
    - Assurez-vous que les valeurs numériques sont des entiers et ne comportent pas de guillemets.

- **La transaction échoue avec 'Not Owner'**:
    - Vérifiez que le compte que vous utilisez figure parmi les propriétaires.
    - Consultez la liste des propriétaires initialisée lors du déploiement.

- **Gaz insuffisant**:
    - Si vous déployez sur un testnet, assurez-vous d'avoir suffisamment d'ETH de test dans votre compte MetaMask.

- **Impossible de connecter MetaMask à Remix**:
    - Rafraîchissez à la fois Remix et MetaMask.
    - Vérifiez que MetaMask est déverrouillé et connecté au bon réseau.

- **Les événements ne s'affichent pas **:
    - Assurez-vous de vérifier l'onglet Logs dans la console de Remix.
    - Vérifiez que la transaction a bien été effectuée.

En suivant ce tutoriel, vous devriez être en mesure de déployer et d'interagir avec le contrat `Altarian42` en utilisant l'IDE Remix. Cette approche pratique vous permet de tester la fonctionnalité du contrat et de comprendre son comportement dans un environnement contrôlé.