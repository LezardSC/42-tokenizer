# Multisig Documentation

## Overview

The multisignature (multisig) functionality in the `Altarian42` contract ensures that critical actions, such as rewarding students with tokens, require approval from multiple owners. This enhances the security and governance of the token system by preventing unilateral decisions and reducing the risk of abuse or errors.

## Implementation Details

#### Ownership Structure

- **Owners**: A list of addresses that are designated as owners of the contract.
- **Number of Confirmations Required**: The minimum number of owner confirmations needed to execute a transaction.

###### State Variables

```solidity
    address[] public owners;
    uint public numConfirmationsRequired;
    mapping(address => bool) public isOwner;
```

- **owners**: An array storing the addresses of all owners.
- **numConfirmationsRequired**: The minimum number of confirmations required to execute a transaction.
- **isOwner**: A mapping to quickly check if an address is an owner.

###### Constructor Initialization

The constructor initializes the owners, sets the number of confirmations required, and ensures all ownership constraints are met.

```solidity
    constructor(
        address[] memory _owners,
        uint _numConfirmationsRequired,
        uint256 cap
    ) ERC20("Altarian", "A42") ERC20Capped(cap * (10 ** 18)) {
        require(_owners.length > 0, "Owners required");
        require(_owners.length <= 10, "Cannot have more than 10 owners");
        require(
            _numConfirmationsRequired > 0 &&
            _numConfirmationsRequired <= _owners.length,
            "Invalid number of required confirmations"
        );

        for (uint i = 0; i < _owners.length; i++) {
            address ownerAddr = _owners[i];

            require(ownerAddr != address(0), "Invalid owner");
            require(!isOwner[ownerAddr], "Owner not unique");

            isOwner[ownerAddr] = true;
            owners.push(ownerAddr);
        }
        numConfirmationsRequired = _numConfirmationsRequired;

        // Initial token distribution logic...
    }
```

#### Transaction Management

Transactions are proposed, confirmed, and executed through the multisig mechanism.

###### `Transaction` Struct

```solidity
    struct Transaction {
        address student;
        uint256 amount;
        string reason;
        bool executed;
        uint numConfirmations;
    }
```

- `student`: The address of the student to be rewarded.
- `amount`: The amount of tokens to reward.
- `reason`: A description or reason for the reward.
- `executed`: A boolean indicating if the transaction has been executed.
- `numConfirmations`: The number of confirmations the transaction has received.

###### State Variables for Transactions

```solidity
    Transaction[] public transactions;
    mapping(uint => mapping(address => bool)) public isConfirmed;
```

- `transactions`: An array storing all proposed transactions.
- `isConfirmed`: A nested mapping to track which owners have confirmed a given transaction.

#### Modifiers

Modifiers are used to enforce access control and validate transaction states.

```solidity
    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not owner");
        _;
    }

    modifier txExists(uint _txIndex) {
        require(_txIndex < transactions.length, "Transaction does not exist");
        _;
    }

    modifier notExecuted(uint _txIndex) {
        require(!transactions[_txIndex].executed, "Transaction already executed");
        _;
    }

    modifier notConfirmed(uint _txIndex) {
        require(!isConfirmed[_txIndex][msg.sender], "Transaction already confirmed");
        _;
    }
```

#### Functions

1. **submitTransaction**

Allows an owner to propose a new transaction.

```solidity
    function submitTransaction(
        address _student,
        uint256 _amount,
        string memory _reason
    ) public onlyOwner {
        uint txIndex = transactions.length;

        transactions.push(Transaction({
            student: _student,
            amount: _amount,
            reason: _reason,
            executed: false,
            numConfirmations: 0
        }));

        emit SubmitTransaction(msg.sender, txIndex, _student, _amount, _reason);
    }
```

- **Parameters**:
    - `_student`: Address of the student to reward.
    - `_amount`: Amount of tokens to be awarded.
    - `_reason`: Reason for the reward.

- **Emits**: `SubmitTransaction` event.

2. **confirmTransaction**

Allows an owner to confirm a proposed transaction.

```solidity
    function confirmTransaction(uint _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
        notConfirmed(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];
        transaction.numConfirmations += 1;
        isConfirmed[_txIndex][msg.sender] = true;

        emit ConfirmTransaction(msg.sender, _txIndex);
    }
```

- **Parameters**:
    - `_txIndex`: Index of the transaction to confirm.
- **Emits**: `ConfirmTransaction` event.

3. **revokeConfirmation**

Allows an owner to revoke their confirmation for a transaction.

```solidity
    function revokeConfirmation(uint _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
    {
        require(isConfirmed[_txIndex][msg.sender], "Transaction not confirmed");

        Transaction storage transaction = transactions[_txIndex];

        transaction.numConfirmations -= 1;
        isConfirmed[_txIndex][msg.sender] = false;

        emit RevokeConfirmation(msg.sender, _txIndex);
    }
```

- **Parameters**:
    - `_txIndex`: Index of the transaction to revoke confirmation.

- **Emits**: `RevokeConfirmation` event.

4. **executeTransaction**

Executes a transaction if it has received enough confirmations.

```solidity
    function executeTransaction(uint _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];

        require(
            transaction.numConfirmations >= numConfirmationsRequired,
            "Cannot execute transaction"
        );

        transaction.executed = true;
        _rewardStudent(
            transaction.student,
            transaction.amount,
            transaction.reason
        );

        emit ExecuteTransaction(msg.sender, _txIndex);
    }
```

- **Parameters**:
    - `_txIndex`: Index of the transaction to execute.

- **Calls**: Internal `_rewardStudent` function to mint tokens.

- **Emits**:
        `ExecuteTransaction` event.
        `RewardGiven` event (from `_rewardStudent`).


#### Events

1. **SubmitTransaction**

Emitted when a transaction is submitted.

```solidity
    event SubmitTransaction(
        address indexed owner,
        uint indexed txIndex,
        address indexed student,
        uint256 amount,
        string reason
    );
```

- **Parameters**:
        `owner`: Address of the owner who submitted the transaction.
        `txIndex`: Index of the transaction.
        `student`: Address of the student to be rewarded.
        `amount`: Amount of tokens to reward.
        `reason`: Reason for the reward.

2. **ConfirmTransaction**

Emitted when a transaction is confirmed by an owner.

```solidity
    event ConfirmTransaction(
        address indexed owner,
        uint indexed txIndex
    );
```

- **Parameters**:
    `owner`: Address of the owner who confirmed the transaction.
    `txIndex`: Index of the transaction.

3. **RevokeConfirmation**

Emitted when an owner revokes their confirmation.

```solidity
    event RevokeConfirmation(
        address indexed owner,
        uint indexed txIndex
    );
```

- **Parameters**:
    - `owner`: Address of the owner who revoked the confirmation.
    - `txIndex`: Index of the transaction.

4. **ExecuteTransaction**

Emitted when a transaction is executed.

```solidity
    event ExecuteTransaction(
        address indexed owner,
        uint indexed txIndex
    );
```

- **Parameters**:
    - `owner`: Address of the owner who executed the transaction.
    - `txIndex`: Index of the transaction.

5. **RewardGiven (from `_rewardStudent`)**

Emitted when a student is rewarded.

```solidity
    event RewardGiven(
        address indexed student,
        uint256 amount,
        string reason
    );
```

- **Parameters**:
    - `student`: Address of the student rewarded.
    - `amount`: Amount of tokens rewarded.
    - `reason`: Reason for the reward.

#### Workflow Summary

1. **Submit Transaction**:
    An owner calls `submitTransaction` to propose rewarding a student.
    The transaction is added to the `transactions` array.

2. **Confirm Transaction**:
    - Owners call `confirmTransaction` to approve the transaction.
    - Each confirmation increments `numConfirmations`.

3. **Execute Transaction**:
    - Once the transaction has enough confirmations (as per `numConfirmationsRequired`), an owner calls `executeTransaction`.
    - The transaction is marked as executed, and `_rewardStudent` is called to mint tokens to the student.

4. **Revoke Confirmation** (Optional):
    Before execution, an owner can revoke their confirmation by calling `revokeConfirmation`.
    This decrements the number of confirmations for the transaction (`numConfirmations`).

## Security Considerations

- **Access Control**: Only owners can submit, confirm, revoke, or execute transactions.
- **Prevent Double Execution**: Transactions cannot be executed more than once (`notExecuted` modifier).
**Confirmation Tracking**: The contract ensures that an owner does not confirm the same transaction more than once (`notConfirmed` modifier).
- **Transaction Existence**: The contract checks that a transaction exists before any operation (`txExists` modifier).

## Testing the Multisg Functionality

#### Test Cases

1. **Submitting a Transaction**

**Test**: An owner can submit a transaction.

```javascript
    it("Should allow an owner to submit a transaction", async function () {
        await expect(
            altarian42.submitTransaction(student, rewardAmount, reason)
        ).to.emit(altarian42, "SubmitTransaction")
            .withArgs(owner.address, 0, student, rewardAmount, reason);

        const txCount = await altarian42.getTransactionCount();
        expect(txCount).to.equal(1);
    });
```

2. **Confirming a Transaction**

**Test**: Owners can confirm a transaction.

```javascript
    it("Should allow owners to confirm a transaction", async function () {
        await altarian42.submitTransaction(student, rewardAmount, reason);

        await expect(altarian42.confirmTransaction(0))
            .to.emit(altarian42, "ConfirmTransaction")
            .withArgs(owner.address, 0);

        await expect(altarian42.connect(addr1).confirmTransaction(0))
            .to.emit(altarian42, "ConfirmTransaction")
            .withArgs(addr1.address, 0);

        const transaction = await altarian42.getTransaction(0);
        expect(transaction.numConfirmations).to.equal(2);
    });
```

3. **Executing a Transaction**

**Test**: A transaction can be executed after enough confirmations.

```javascript
    it("Should execute a transaction after enough confirmations", async function () {
        await altarian42.submitTransaction(student, rewardAmount, reason);
        await altarian42.confirmTransaction(0);
        await altarian42.connect(addr1).confirmTransaction(0);

        const studentInitialBalance = await altarian42.balanceOf(student);

        await expect(altarian42.executeTransaction(0))
            .to.emit(altarian42, "ExecuteTransaction")
            .withArgs(owner.address, 0)
            .and.to.emit(altarian42, "RewardGiven")
            .withArgs(student, rewardAmount, reason);

        const studentFinalBalance = await altarian42.balanceOf(student);
        expect(studentFinalBalance - studentInitialBalance).to.equal(
            ethers.parseUnits(rewardAmount.toString(), 18)
        );
    });
```

4. **Revoking a Confirmation**

**Test**: An owner can revoke their confirmation before execution.

```javascript
    it("Should allow an owner to revoke a confirmation", async function () {
        await altarian42.submitTransaction(student, rewardAmount, reason);
        await altarian42.confirmTransaction(0);

        await expect(altarian42.revokeConfirmation(0))
            .to.emit(altarian42, "RevokeConfirmation")
            .withArgs(owner.address, 0);

        const transaction = await altarian42.getTransaction(0);
        expect(transaction.numConfirmations).to.equal(0);
    });
```

5. **Preventing Unauthorized Actions**

- Non-Owners Cannot Submit Transactions:

```javascript
    it("Should not allow a non-owner to submit a transaction", async function () {
        await expect(
            altarian42.connect(addr3).submitTransaction(student, rewardAmount, reason)
        ).to.be.revertedWith("Not owner");
    });
```

- **Cannot Confirm More Than Once**:

```javascript
    it("Should not allow an owner to confirm a transaction more than once", async function () {
        await altarian42.submitTransaction(student, rewardAmount, reason);
        await altarian42.confirmTransaction(0);

        await expect(
            altarian42.confirmTransaction(0)
        ).to.be.revertedWith("Transaction already confirmed");
    });
```

- **Cannot Execute Without Enough Confirmations**:

```javascript
    it("Should not allow executing a transaction without enough confirmations", async function () {
        await altarian42.submitTransaction(student, rewardAmount, reason);
        await altarian42.confirmTransaction(0);

        await expect(
            altarian42.executeTransaction(0)
        ).to.be.revertedWith("Cannot execute transaction");
    });
```

- **Cannot Execute Already Executed Transactions**:

```javascript
    it("Should not allow executing a transaction more than once", async function () {
        await altarian42.submitTransaction(student, rewardAmount, reason);
        await altarian42.confirmTransaction(0);
        await altarian42.connect(addr1).confirmTransaction(0);

        await altarian42.executeTransaction(0);

        await expect(
            altarian42.executeTransaction(0)
        ).to.be.revertedWith("Transaction already executed");
    });
```

#### Helper Functions

- **getTransactionCount**
    Returns the total number of transactions.

```solidity
    function getTransactionCount() public view returns (uint) {
        return transactions.length;
    }
```

- **getTransaction**
    Retrieves details of a specific transaction.

```solidity
    function getTransaction(uint _txIndex)
        public
        view
        returns (
            address student,
            uint256 amount,
            string memory reason,
            bool executed,
            uint numConfirmations
        )
    {
        Transaction storage transaction = transactions[_txIndex];

        return (
            transaction.student,
            transaction.amount,
            transaction.reason,
            transaction.executed,
            transaction.numConfirmations
        );
    }
```

## Usage Example

1. **Proposing a Reward Transaction**

- An owner calls `submitTransaction` with the student's address, reward amount, and reason.

```solidity
    altarian42.submitTransaction(studentAddress, 50, "Completed Project X");
```

2. **Confirming the Transaction**

- Other owners call `confirmTransaction` with the transaction index.

```solidity
    altarian42.confirmTransaction(0);
    altarian42.connect(addr1).confirmTransaction(0);
```

3. **Executing the Transaction**

- Once enough confirmations are gathered, an owner calls `executeTransaction`.

```solidity
    altarian42.executeTransaction(0);
```

4. **Result**
    - The student receives the tokens.
    - The transaction is marked as executed.
    - Relevant events are emitted.

## Important Considerations

- **Transaction Indexing**: Transactions are indexed starting from `0` in the `transactions` array.
- **Owner Management**: The list of owners is immutable after deployment. No functions are provided to add or remove owners dynamically.
- **Confirmation Requirements**: The `numConfirmationsRequired` must be less than or equal to the number of owners and greater than zero.
- **Reentrancy**: The contract does not use external calls in functions that change state after checking confirmations, reducing reentrancy risks.

## Potential Extensions

- **Dynamic Owner Management**: Implement functions to add or remove owners with multisig approval.
- **Transaction Types**: Extend the multisig functionality to support different types of transactions beyond rewarding students.
- **Enhanced Event Emission**: Include additional event parameters to facilitate better off-chain tracking.

## Conclusion

The multisignature mechanism in the `Altarian42` contract provides a robust and secure way to manage critical operations, ensuring that no single owner can act unilaterally. By requiring multiple confirmations, the contract promotes collaborative governance and reduces the risk of unauthorized actions.