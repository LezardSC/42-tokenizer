# Récompenses et achievements

Les owners récompensent les étudiants en tokens via le [multisig](Multisig.md). Chaque récompense enregistre aussi sa raison comme achievement de l'étudiant.

## `_rewardStudent`

Fonction interne, appelée uniquement par `executeTransaction`.

```solidity
function _rewardStudent(address student, uint256 amount, string memory reason) internal {
    require(student != address(0), "Invalid student address");
    require(amount > 0, "Reward amount must be greater than zero");

    uint256 amountWithDecimals = amount * (10 ** 18);
    uint256 newTotalSupply = totalSupply() + amountWithDecimals;

    require(newTotalSupply <= cap(), "Reward exceeds token cap");

    _mint(student, amountWithDecimals);
    studentAchievements[student].push(reason);
    emit RewardGiven(student, amount, reason);
}
```

- `amount` est en tokens entiers ; la fonction ajoute les 18 décimales.
- La récompense est refusée si elle ferait dépasser le [cap](Cap.md).
- `reason` est ajoutée aux achievements de l'étudiant.

## `getStudentAchievements`

```solidity
function getStudentAchievements(address student) public view returns (string[] memory)
```

Renvoie toutes les raisons de récompense enregistrées pour un étudiant. Tout le monde peut l'appeler.

## Event

```solidity
event RewardGiven(address indexed student, uint256 amount, string reason);
```

`amount` est en tokens entiers, sans décimales.

## Exemple

```javascript
await altarian42.submitTransaction(student, 50, "Completed Blockchain Project");
await altarian42.confirmTransaction(0);
await altarian42.connect(addr1).confirmTransaction(0);
await altarian42.executeTransaction(0);

await altarian42.getStudentAchievements(student); // ["Completed Blockchain Project"]
```

## Tests

Voir [`code/tests/Altarian42.js`](/code/tests/Altarian42.js) : le solde de l'étudiant augmente après une récompense et l'achievement est enregistré.
