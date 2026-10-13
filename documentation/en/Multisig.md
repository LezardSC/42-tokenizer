# Multisig

Rewarding a student mints new tokens, so it requires approval from several owners. No single owner can mint alone.

## Owners

Owners are set once in the constructor and cannot be changed afterwards.

```solidity
address[] public owners;
uint public numConfirmationsRequired;
mapping(address => bool) public isOwner;
```

The constructor checks that:

- there is at least 1 owner and at most 10,
- `numConfirmationsRequired` is between 1 and the number of owners,
- no owner is the zero address or appears twice.

## Transactions

Each reward proposal is stored as a `Transaction`:

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

Transactions are identified by their index in `transactions`, starting at `0`.

## Flow

All of these functions are restricted to owners (`onlyOwner`).

| Function | What it does | Event |
|---|---|---|
| `submitTransaction(student, amount, reason)` | Proposes a reward | `SubmitTransaction` |
| `confirmTransaction(txIndex)` | Adds the caller's confirmation | `ConfirmTransaction` |
| `revokeConfirmation(txIndex)` | Removes the caller's confirmation | `RevokeConfirmation` |
| `executeTransaction(txIndex)` | Mints the reward if there are enough confirmations | `ExecuteTransaction`, `RewardGiven` |

`executeTransaction` marks the transaction as executed, then calls `_rewardStudent` (see [Rewards and achievements](RewardsAndAchievements.md)).

Example with 2 required confirmations:

```javascript
await altarian42.submitTransaction(student, 50, "Completed Project X");
await altarian42.confirmTransaction(0);
await altarian42.connect(addr1).confirmTransaction(0);
await altarian42.executeTransaction(0);
```

## Checks

The modifiers reject:

- a caller who isn't an owner: `"Not owner"`
- an index that doesn't exist: `"Transaction does not exist"`
- a transaction already executed: `"Transaction already executed"`
- confirming twice: `"Transaction already confirmed"`

And in the functions themselves:

- revoking without having confirmed: `"Transaction not confirmed"`
- executing without enough confirmations: `"Cannot execute transaction"`

## Read functions

- `getOwners()`: list of owners
- `getTransactionCount()`: number of transactions
- `getTransaction(txIndex)`: student, amount, reason, executed, numConfirmations

## Tests

Multisig tests are in [`code/tests/Altarian42.js`](/code/tests/Altarian42.js). They cover submitting, confirming, revoking and executing, plus the rejection cases above.
