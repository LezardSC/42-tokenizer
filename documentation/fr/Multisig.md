# Multisig

Récompenser un étudiant mint de nouveaux tokens, donc cela demande l'accord de plusieurs owners. Aucun owner ne peut minter seul.

## Owners

Les owners sont définis une fois dans le constructeur et ne peuvent plus être modifiés ensuite.

```solidity
address[] public owners;
uint public numConfirmationsRequired;
mapping(address => bool) public isOwner;
```

Le constructeur vérifie que :

- il y a entre 1 et 10 owners,
- `numConfirmationsRequired` est compris entre 1 et le nombre d'owners,
- aucun owner n'est l'adresse zéro ni présent deux fois.

## Transactions

Chaque proposition de récompense est stockée dans une `Transaction` :

```solidity
struct Transaction {
    address student;
    uint256 amount;
    string reason;
    bool executed;
    uint numConfirmations;
}

Transaction[] public transactions;
mapping(uint => mapping(address => bool)) public isConfirmed;
```

Une transaction est identifiée par son index dans `transactions`, à partir de `0`.

## Déroulement

Toutes ces fonctions sont réservées aux owners (`onlyOwner`).

| Fonction | Rôle | Event |
|---|---|---|
| `submitTransaction(student, amount, reason)` | Propose une récompense | `SubmitTransaction` |
| `confirmTransaction(txIndex)` | Ajoute la confirmation de l'appelant | `ConfirmTransaction` |
| `revokeConfirmation(txIndex)` | Retire la confirmation de l'appelant | `RevokeConfirmation` |
| `executeTransaction(txIndex)` | Mint la récompense s'il y a assez de confirmations | `ExecuteTransaction`, `RewardGiven` |

`executeTransaction` marque la transaction comme exécutée, puis appelle `_rewardStudent` (voir [Récompenses et achievements](RewardsAndAchievements.md)).

Exemple avec 2 confirmations requises :

```javascript
await altarian42.submitTransaction(student, 50, "Completed Project X");
await altarian42.confirmTransaction(0);
await altarian42.connect(addr1).confirmTransaction(0);
await altarian42.executeTransaction(0);
```

## Vérifications

Les modifiers rejettent :

- un appelant qui n'est pas owner : `"Not owner"`
- un index inexistant : `"Transaction does not exist"`
- une transaction déjà exécutée : `"Transaction already executed"`
- une double confirmation : `"Transaction already confirmed"`

Et dans les fonctions elles-mêmes :

- révoquer sans avoir confirmé : `"Transaction not confirmed"`
- exécuter sans assez de confirmations : `"Cannot execute transaction"`

## Fonctions de lecture

- `getOwners()` : liste des owners
- `getTransactionCount()` : nombre de transactions
- `getTransaction(txIndex)` : student, amount, reason, executed, numConfirmations

## Tests

Les tests du multisig sont dans [`code/tests/Altarian42.js`](/code/tests/Altarian42.js). Ils couvrent la proposition, la confirmation, la révocation et l'exécution, ainsi que les cas de rejet ci-dessus.
