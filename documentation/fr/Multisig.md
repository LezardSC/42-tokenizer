# Documentation Multisig

WIP, PRIVILEGIER VERSION ANGLAISE

## Vue d'ensemble

La fonctionnalité multisignature (multisig) du contrat `Altarian42` garantit que les actions critiques, telles que la récompense des étudiants avec des tokens, nécessitent l'approbation de plusieurs propriétaires. Cela renforce la sécurité et la gouvernance du système de tokens en empêchant les décisions unilatérales et en réduisant le risque d'abus ou d'erreurs.

## Détails de la mise en œuvre

#### Structure de propriété

- **Propriétaires** : Une liste d'adresses désignées comme propriétaires du contrat.
- **Nombre de confirmations requises** : Le nombre minimum de confirmations de propriétaires nécessaires pour exécuter une transaction.

###### Variables d'état

```solidity
    address[] public owners ;
    uint public numConfirmationsRequired ;
    mapping(address => bool) public isOwner ;
```

- **owners** : Un tableau contenant les adresses de tous les propriétaires.
- **numConfirmationsRequired** : Le nombre minimum de confirmations requises pour exécuter une transaction.
- **isOwner** : Une correspondance permettant de vérifier rapidement si une adresse est un propriétaire.

###### Initialisation du constructeur

Le constructeur définit les propriétaires et le nombre de confirmations nécessaires.

```solidity
    constructor(
        adresse[] mémoire _propriétaires,
        uint _numConfirmationsRequired,
        uint256 cap
    ) ERC20(« Altarian », « A42 ») ERC20Capped(cap * (10 ** 18)) {
        require(_owners.length > 0, « Propriétaires requis ») ;
        require(_owners.length <= 10, « Impossible d'avoir plus de 10 propriétaires ») ;
        require(
            _numConfirmationsRequired > 0 &&
            _numConfirmationsRequired <= _owners.length,
            « Nombre incorrect de confirmations requises »
        ) ;

        for (uint i = 0 ; i < _owners.length ; i++) {
            address ownerAddr = _owners[i] ;

            require(ownerAddr != address(0), « Propriétaire non valide ») ;
            require(!isOwner[ownerAddr], « Propriétaire non unique ») ;

            isOwner[ownerAddr] = true ;
            owners.push(ownerAddr) ;
        }
        numConfirmationsRequired = _numConfirmationsRequired ;

        // Logique de distribution initiale des tokens...
    }
```

#### Gestion des transactions

Les transactions sont proposées, confirmées et exécutées par le biais du mécanisme multisig.

###### `Transaction` Struct

```solidity
    struct Transaction {
        adresse étudiant ;
        uint256 amount ;
        string reason ;
        bool executed ;
        uint numConfirmations ;
    }
```

- `student` : L'adresse de l'étudiant à récompenser.
- `amount` : La quantité de tokens à récompenser.
- `reason` : Une description ou une raison pour la récompense.
- `executed` : Un booléen indiquant si la transaction a été exécutée.
- `numConfirmations` : Le nombre de confirmations que la transaction a reçu.

###### Variables d'état pour les transactions

```solidity
    Transaction[] public transactions ;
    mapping(uint => mapping(address => bool)) public isConfirmed ;
```

- ``transactions` : Un tableau contenant toutes les transactions proposées.
- ``isConfirmed` : Un mapping imbriqué permettant de savoir quels propriétaires ont confirmé une transaction donnée.

#### Modifiers

Les modificateurs sont utilisés pour renforcer le contrôle d'accès et valider les états des transactions.

```solidity
    modifier onlyOwner() {
        require(isOwner[msg.sender], « Pas propriétaire ») ;
        _ ;
    }

    modifier txExists(uint _txIndex) {
        require(_txIndex < transactions.length, « La transaction n'existe pas ») ;
        _ ;
    }

    modifier notExecuted(uint _txIndex) {
        require(!transactions[_txIndex].executed, « Transaction déjà exécutée ») ;
        _ ;
    }

    modifier notConfirmed(uint _txIndex) {
        require(!isConfirmed[_txIndex][msg.sender], « Transaction déjà confirmée ») ;
        _ ;
    }
```


#### Fonctions

1. **submitTransaction**

Permet à un propriétaire de proposer une nouvelle transaction.

```solidity
    function submitTransaction(
        adresse _student,
        uint256 _montant,
        string memory _reason
    ) public onlyOwner {
        uint txIndex = transactions.length ;

        transactions.push(Transaction({
            student : _student,
            amount : _amount,
            reason : _reason,
            executed : false,
            numConfirmations : 0
        })) ;

        emit SubmitTransaction(msg.sender, txIndex, _student, _amount, _reason) ;
    }
```

- **Paramètres** :
    - `_student` : Adresse de l'étudiant à récompenser.
    - `_amount` : Montant des tokens à récompenser.
    - `_reason` : Raison de la récompense.

- **Emits** : L'événement `SubmitTransaction`.

2. **confirmTransaction**

Permet à un propriétaire de confirmer une transaction proposée.

```solidity
    function confirmTransaction(uint _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
        notConfirmed(_txIndex)
    {
        Stockage des transactions transaction = transactions[_txIndex] ;
        transaction.numConfirmations += 1 ;
        isConfirmed[_txIndex][msg.sender] = true ;

        emit ConfirmTransaction(msg.sender, _txIndex) ;
    }
```

- **Paramètres** :
    - `_txIndex` : Index de la transaction à confirmer.
- **Emissions** : L'événement `ConfirmTransaction`.

3. **revokeConfirmation**

Permet à un propriétaire de révoquer sa confirmation pour une transaction.

```solidity
    function revokeConfirmation(uint _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
    {
        require(isConfirmed[_txIndex][msg.sender], « Transaction non confirmée ») ;

        Stockage des transactions transaction = transactions[_txIndex] ;

        transaction.numConfirmations -= 1 ;
        isConfirmed[_txIndex][msg.sender] = false ;

        émet RevokeConfirmation(msg.sender, _txIndex) ;
    }
```


- **Paramètres** :
    - `_txIndex` : Index de la transaction à révoquer confirmation.

- **Emissions** : L'événement `RevokeConfirmation`.

4. **executeTransaction**

Exécute une transaction si elle a reçu suffisamment de confirmations.

```solidity
    function executeTransaction(uint _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex] ;

        require(
            transaction.numConfirmations >= numConfirmationsRequired,
            « Impossible d'exécuter la transaction »
        ) ;

        transaction.executed = true ;
        _rewardStudent(
            transaction.student,
            transaction.amount,
            transaction.reason
        ) ;

        émet ExecuteTransaction(msg.sender, _txIndex) ;
    }
```

- **Paramètres** :
    - `_txIndex` : Index de la transaction à exécuter.

- **Appels** : Fonction interne `_rewardStudent` pour monnayer les tokens.

- **Emits** :
        Evénement `ExecuteTransaction`.
        Événement `RewardGiven` (de `_rewardStudent`).


#### Evénements

1. **SubmitTransaction**

Emis lorsqu'une transaction est soumise.

```solidity
    événement SubmitTransaction(
        address indexed owner,
        uint indexé txIndex,
        adresse indexée étudiant,
        uint256 montant,
        string reason
    ) ;
```


- **Paramètres** :
        `owner` : Adresse du propriétaire qui a soumis la transaction.
        `txIndex` : Index de la transaction.
        `student` : Adresse de l'étudiant à récompenser.
        `amount` : Montant des tokens à récompenser.
        `reason` : Raison de la récompense.

2. **ConfirmTransaction**

Emis lorsqu'une transaction est confirmée par un propriétaire.

```solidity
    événement ConfirmTransaction(
        adresse indexée propriétaire,
        uint indexé txIndex
    ) ;
```

- **Paramètres** :
    `owner` : Adresse du propriétaire qui a confirmé la transaction.
    `txIndex` : Index de la transaction.

3. **RevokeConfirmation**

Emis lorsqu'un propriétaire révoque sa confirmation.

```solidity
    événement RevokeConfirmation(
        adresse indexée propriétaire,
        uint indexé txIndex
    ) ;
```

- **Paramètres** :
    - `owner` : Adresse du propriétaire qui a révoqué la confirmation.
    - `txIndex` : Index de la transaction.

4. **ExecuteTransaction**

Emis lorsqu'une transaction est exécutée.

```solidity
    événement ExecuteTransaction(
        address indexed owner,
        uint indexé txIndex
    ) ;
```

- **Paramètres** :
    - `owner` : Adresse du propriétaire qui a exécuté la transaction.
    - `txIndex` : Index de la transaction.

5. **RewardGiven (de `_rewardStudent`)**

Emis lorsqu'un étudiant est récompensé.

```solidity
    event RewardGiven(
        address indexed student,
        uint256 montant,
        string reason
    ) ;
```

- **Paramètres** :
    - `student` : Adresse de l'étudiant récompensé.
    - ``amount` : Montant des tokens récompensés.
    - `reason` : Raison de la récompense.

#### Résumé du flux de travail

1. **Submit Transaction** :
    Un propriétaire appelle `submitTransaction` pour proposer de récompenser un étudiant.
    La transaction est ajoutée au tableau `transactions`.

2. **Confirm Transaction** :
    - Les propriétaires appellent `confirmTransaction` pour approuver la transaction.
    - Chaque confirmation incrémente `numConfirmations`.

3. **Exécuter la transaction** :
    - Une fois que la transaction a reçu suffisamment de confirmations (selon `numConfirmationsRequired`), un propriétaire appelle `executeTransaction`.
    - La transaction est marquée comme exécutée, et `_rewardStudent` est appelé pour frapper des tokens à l'étudiant.

4. **Revoke Confirmation** (Optionnel) :
    Avant l'exécution, un propriétaire peut révoquer sa confirmation en appelant `revokeConfirmation`.
    Ceci décrémente `numConfirmations`.


## Security Considerations

- **Access Control**: Only owners can submit, confirm, revoke, or execute transactions.
- **Prevent Double Execution**: Transactions cannot be executed more than once (`notExecuted` modifier).
**Confirmation Tracking**: The contract ensures that an owner cannot confirm the same transaction more than once (`notConfirmed` modifier).
- **Transaction Existence**: The contract checks that a transaction exists before any operation (`txExists` modifier).

## Testing the Multisg Functionality

#### Test Cases

1. **Submitting a Transaction

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
- **Event Emission Enhancements**: Include more detailed events or additional parameters for better off-chain tracking.

## Conclusion

The multisignature mechanism in the `Altarian42` contract provides a robust and secure way to manage critical operations, ensuring that no single owner can act unilaterally. By requiring multiple confirmations, the contract promotes collaborative governance and reduces the risk of unauthorized actions.