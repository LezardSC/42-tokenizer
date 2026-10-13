# Tester sur Remix

Comment déployer et essayer `Altarian42` dans le navigateur avec [Remix](https://remix.ethereum.org), sans rien installer.

## 1. Ajouter le contrat

1. Ouvrez https://remix.ethereum.org.
2. Dans l'explorateur de fichiers, créez `contracts/Altarian42.sol` et collez-y le contrat.
3. Remplacez les imports par des URLs GitHub, car Remix n'a pas les paquets npm :

```solidity
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/ERC20Burnable.sol";
```

Si ces liens ne marchent plus, récupérez les nouveaux chemins sur le [dépôt OpenZeppelin](https://github.com/OpenZeppelin/openzeppelin-contracts).

## 2. Compiler

Dans l'onglet **Solidity Compiler**, choisissez une version 0.8.x (le projet utilise `0.8.20`) et cliquez sur **Compile Altarian42.sol**.

## 3. Déployer

Dans l'onglet **Deploy & Run Transactions** :

- **Environment** : `Remix VM` pour tester en local, ou `Injected Provider - MetaMask` pour déployer sur Sepolia (voir plus bas).
- **Arguments du constructeur** : owners, confirmations requises, cap. Par exemple, avec trois comptes du menu **Account** :

```
["0x5B3...Eed", "0xAb8...09b", "0x4B0...e37"], 2, 1000000
```

Le cap est en tokens entiers, sans décimales. Cliquez ensuite sur **Deploy**. Le contrat apparaît dans **Deployed Contracts**.

## 4. Essayer

Changez de compte actif dans le menu **Account** pour jouer différents owners ou un étudiant.

1. **Proposer une récompense** : en tant qu'owner 1, appelez `submitTransaction` avec une adresse d'étudiant, un montant (ex. `50`) et une raison.
2. **Confirmer** : en tant qu'owner 1 puis owner 2, appelez `confirmTransaction(0)`.
3. **Exécuter** : depuis n'importe quel owner, appelez `executeTransaction(0)`.
4. **Vérifier** : `balanceOf(student)` et `getStudentAchievements(student)`.
5. **Acheter** : en tant qu'étudiant, appelez `buyGoodies("T-Shirt", 20)`, puis vérifiez que `balanceOf` et `totalSupply` ont baissé.

Les montants (`_amount`, `cost`) sont toujours en tokens entiers ; le contrat ajoute les décimales. Les events et les messages d'erreur s'affichent dans la console en bas.

À essayer aussi : exécuter sans assez de confirmations, appeler une fonction d'owner depuis un autre compte, confirmer deux fois, acheter avec un solde insuffisant.

## Déployer sur Sepolia

1. Dans MetaMask, activez les réseaux de test et sélectionnez **Sepolia**.
2. Récupérez de l'ETH de test sur un faucet, par exemple https://sepolia-faucet.pk910.de/.
3. Dans Remix, choisissez `Injected Provider - MetaMask` comme environnement et acceptez la connexion.
4. Déployez comme plus haut ; MetaMask demande de confirmer chaque transaction.

Vous pouvez suivre les transactions sur [Sepolia Etherscan](https://sepolia.etherscan.io/).

## Problèmes courants

- **Erreur de compilation** : vérifiez la version du compilateur et les URLs d'import.
- **Arguments du constructeur invalides** : les adresses doivent être entre guillemets dans `[]`, les nombres non.
- **`Not owner`** : le compte actif ne fait pas partie des owners passés au constructeur.
- **Pas assez de gas sur Sepolia** : récupérez plus d'ETH de test.
- **MetaMask ne se connecte pas** : déverrouillez-le, vérifiez qu'il est sur Sepolia, rechargez Remix.
