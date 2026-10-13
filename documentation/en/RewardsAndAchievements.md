# Rewards and achievements

Owners reward students with tokens through the [multisig](Multisig.md). Each reward also stores its reason as an achievement for the student.

## `_rewardStudent`

Internal function, only called by `executeTransaction`.

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

- `amount` is given in whole tokens; the function adds the 18 decimals.
- The reward is refused if it would push the supply over the [cap](Cap.md).
- `reason` is appended to the student's achievements.

## `getStudentAchievements`

```solidity
function getStudentAchievements(address student) public view returns (string[] memory)
```

Returns every reward reason recorded for a student. Anyone can call it.

## Event

```solidity
event RewardGiven(address indexed student, uint256 amount, string reason);
```

`amount` is in whole tokens, without decimals.

## Example

```javascript
await altarian42.submitTransaction(student, 50, "Completed Blockchain Project");
await altarian42.confirmTransaction(0);
await altarian42.connect(addr1).confirmTransaction(0);
await altarian42.executeTransaction(0);

await altarian42.getStudentAchievements(student); // ["Completed Blockchain Project"]
```

## Tests

See [`code/tests/Altarian42.js`](/code/tests/Altarian42.js): the student's balance goes up after a reward and the achievement is recorded.
