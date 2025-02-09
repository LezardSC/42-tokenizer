# Documentation Multisig

## Vue d’ensemble

La fonctionnalité de **signature multiple (multisig)** dans le contrat `Altarian42` garantit que les actions critiques, telles que la récompense des étudiants avec des tokens, nécessitent l'approbation de plusieurs propriétaires. Cela renforce la sécurité et la gouvernance du système de tokens en empêchant les décisions unilatérales et en réduisant le risque d'abus ou d'erreurs.

## Détails de l’implémentation

### **Structure de propriété**

- **Propriétaires** : Liste des adresses désignées comme propriétaires du contrat.
- **Nombre de confirmations requises** : Le nombre minimum de confirmations des propriétaires nécessaire pour exécuter une transaction.

#### **Variables d'état**

```solidity
    address[] public owners;
    uint public numConfirmationsRequired;
    mapping(address => bool) public isOwner;
```

- **owners** : Un tableau stockant les adresses de tous les propriétaires.
- **numConfirmationsRequired** : Le nombre minimum de confirmations requis pour exécuter une transaction.
- **isOwner** : Une table de hachage permettant de vérifier rapidement si une adresse est propriétaire.

### **Initialisation du Constructeur**

Le constructeur initialise les propriétaires, définit le nombre de confirmations requis et s’assure que toutes les contraintes liées à la propriété sont respectées.

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
    }
```

## **Gestion des transactions**

Les transactions sont proposées, confirmées et exécutées via le mécanisme multisig.

#### **Structure `Transaction`**

```solidity
    struct Transaction {
        address student;
        uint256 amount;
        string reason;
        bool executed;
        uint numConfirmations;
    }
```

- `student` : Adresse de l’étudiant à récompenser.
- `amount` : Montant de tokens à attribuer.
- `reason` : Raison de la récompense.
- `executed` : Booléen indiquant si la transaction a été exécutée.
- `numConfirmations` : Nombre de confirmations obtenues.

#### **Variables d’état pour les transactions**

```solidity
    Transaction[] public transactions;
    mapping(uint => mapping(address => bool)) public isConfirmed;
```

- `transactions` : n tableau stockant toutes les transactions proposées.
- `isConfirmed` : Une table de hachage imbriquée permettant de suivre quels propriétaires ont confirmé une transaction donnée.

## **Modificateurs**

Les modificateurs sont utilisés pour appliquer le contrôle d'accès et valider l'état des transactions.

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

## **Fonctions principales**

1. **submitTransaction** : Permet à un propriétaire de proposer une transaction.
```Solidity
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
- ***Paramètres***:
    - `_student` : L'adresse de l'étudiant à récompenser.
    - `_amount` : Le montant de tokens à attribuer.
    - `_reason` : La raison de la récompense.
- ***Emit*** : Émet l'événement `SubmitTransaction`.


2. **confirmTransaction** : Permet à un propriétaire de confirmer une transaction existante.
```Solidity
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

- ***Paramètres***:
    - `_txIndex` : L'index de la transaction à confirmer.
- ***Emit***: Émet l'événement `ConfirmTransaction`.


3. **revokeConfirmation** : Permet à un propriétaire de révoquer sa confirmation.

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

- ***Paramètres*** :

    - `_txIndex` : L'index de la transaction dont la confirmation doit être révoquée.

- ***Emit***: Émet l'événement RevokeConfirmation.

4. **executeTransaction** : Exécute une transaction si elle a reçu suffisamment de confirmations.

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

- ***Paramètres***:

    - `_txIndex` : L'index de la transaction à exécuter.

- ***Appelle*** la fonction interne _rewardStudent pour créer des tokens pour l'étudiant.

- ***Émet***:
    - L'événement `ExecuteTransaction`.
    - L'événement `RewardGiven` (depuis `_rewardStudent`).

#### Événements

1. **SubmitTransaction**
Émis lorsqu'une transaction est soumise.

```solidity
    event SubmitTransaction(
        address indexed owner,
        uint indexed txIndex,
        address indexed student,
        uint256 amount,
        string reason
    );
```

- ***Paramètres***:

    - `owner` : L'adresse du propriétaire qui a soumis la transaction.
    - `txIndex` : L'index de la transaction.
    - `student` : L'adresse de l'étudiant à récompenser.
    - `amount` : Le montant de tokens à attribuer.
    - `reason` : La raison de la récompense.

2. **ConfirmTransaction**

Émis lorsqu'un propriétaire confirme une transaction.

```solidity
    event ConfirmTransaction(
        address indexed owner,
        uint indexed txIndex
    );
```

- **Paramètres**:
    `owner`: L'adresse du propriétaire qui a confirmé la transaction.
    `txIndex`: L'index de la transaction.

3. **RevokeConfirmation**

Émis lorsqu'un propriétaire révoque sa confirmation.

```solidity
    event RevokeConfirmation(
        address indexed owner,
        uint indexed txIndex
    );
```

- **Paramètres**:
    - `owner`: L'adresse du propriétaire qui a révoqué la confirmation.
    - `txIndex`:  L'index de la transaction.

4. **ExecuteTransaction**

Émis lorsqu'une transaction est exécutée.

```solidity
    event ExecuteTransaction(
        address indexed owner,
        uint indexed txIndex
    );
```

- **Paramètres**:
    - `owner`: L'adresse du propriétaire qui a exécuté la transaction.
    - `txIndex`: L'index de la transaction.

5. **RewardGiven (from `_rewardStudent`)**

Émis lorsqu'un étudiant est récompensé.

```solidity
    event RewardGiven(
        address indexed student,
        uint256 amount,
        string reason
    );
```

- **Paramètres**:
    - `student`: L'adresse de l'étudiant récompensé.
    - `amount`: Le montant de tokens attribué.
    - `reason`: La raison de la récompense.

déroulement des opérations

#### Déroulement des Opérations

1. **Soumettre une transaction**:
    Un propriétaire appelle `submitTransaction` pour proposer la récompense d'un étudiant. La transaction est ajoutée au tableau `transactions`.

2. **Confirmer une transaction**:
    - Les propriétaires appellent `confirmTransaction` pour approuver la transaction.
    - Chaque confirmation incrémente la variable `numConfirmations`.

3. **Exécuter une transaction**:
    - Une fois que la transaction a reçu suffisamment de confirmations (selon `numConfirmationsRequired`), un propriétaire appelle `executeTransaction`.
    - La transaction est marquée comme exécutée et la fonction `_rewardStudent` est appelée pour créer des tokens à destination de l'étudiant.

4. **Révoquer une confirmation** (Optionnel):
    Avant l'exécution, un propriétaire peut révoquer sa confirmation en appelant `revokeConfirmation`. Cela décrémente le nombre de confirmations de la transaction (`numConfirmations`).


## **Considérations de sécurité**

- **Contrôle d’accès** : Seuls les propriétaires peuvent proposer, confirmer, révoquer ou exécuter des transactions.
- **Prévention de double exécution** : Une transaction ne peut pas être exécutée plusieurs fois (`notExecuted`).
- **Suivi des confirmations** : Un propriétaire ne peut pas confirmer plusieurs fois la même transaction (`notYetConfirmed`).


## Tester la fonctionnalité Multisig

#### Cas de test

1. **Soumission d'une transaction**

**Test**: Un propriétaire peut soumettre une transaction..

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

2. **Confirmation d'une transaction**

**Test**: Les propriétaires peuvent confirmer une transaction.

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

3. **Exécution d'une transaction**

**Test**: Une transaction peut être exécutée après avoir reçu suffisamment de confirmations.

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

4. **Révocation d'une confirmation**

**Test**: Un propriétaire peut révoquer sa confirmation avant l'exécution.

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

5. **Empêcher les actions non autorisées**

- Les non-propriétaires ne peuvent pas soumettre de transactions ::

```javascript
    it("Should not allow a non-owner to submit a transaction", async function () {
        await expect(
            altarian42.connect(addr3).submitTransaction(student, rewardAmount, reason)
        ).to.be.revertedWith("Not owner");
    });
```

- **Ne peut pas confirmer plus d'une fois**:

```javascript
    it("Should not allow an owner to confirm a transaction more than once", async function () {
        await altarian42.submitTransaction(student, rewardAmount, reason);
        await altarian42.confirmTransaction(0);

        await expect(
            altarian42.confirmTransaction(0)
        ).to.be.revertedWith("Transaction already confirmed");
    });
```

- **Ne peut pas exécuter sans assez de confirmations**:

```javascript
    it("Should not allow executing a transaction without enough confirmations", async function () {
        await altarian42.submitTransaction(student, rewardAmount, reason);
        await altarian42.confirmTransaction(0);

        await expect(
            altarian42.executeTransaction(0)
        ).to.be.revertedWith("Cannot execute transaction");
    });
```

- **Ne peut pas exécuter des transactions déjà exécutées**:

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

#### Fonctions d'assistance

- **getTransactionCount**
    Retourne le nombre total de transactions.

```solidity
    function getTransactionCount() public view returns (uint) {
        return transactions.length;
    }
```

- **getTransaction**
    Récupère les détails d'une transaction spécifique.

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

## Exemple d'utilisation


1. **Proposer une transaction de récompense**

- Un propriétaire appelle `submitTransaction` en passant l'adresse de l'étudiant, le montant de la récompense et la raison.

```solidity
    altarian42.submitTransaction(studentAddress, 50, "Completed Project X");
```

2. **Confirmer la transaction**

- D'autres propriétaires appellent confirmTransaction en passant l'index de la transaction.

```solidity
    altarian42.confirmTransaction(0);
    altarian42.connect(addr1).confirmTransaction(0);
```

3. **Exécuter la transaction**

- Une fois que suffisamment de confirmations ont été recueillies, un propriétaire appelle `executeTransaction`.
`
```solidity
    altarian42.executeTransaction(0);
```

4. **Résultat**
    - L'étudiant reçoit les tokens.
    - La transaction est marquée comme exécutée.
    - Les événements pertinents sont émis.

## Considérations importantes

- **Indexation des transactions**: Les transactions sont indexées à partir de `0` dans le tableau `transactions`.
- **Gestion des propriétaires**: La liste des propriétaires est immuable après le déploiement. Aucune fonction n'est prévue pour ajouter ou supprimer dynamiquement des propriétaires.
- **Exigences de confirmation**: La valeur `numConfirmationsRequired` doit être inférieure ou égale au nombre de propriétaires et supérieure à zéro.
- **Réentrance**: Le contrat n'effectue pas d'appels externes dans les fonctions modifiant l'état après avoir vérifié les confirmations, ce qui réduit les risques de réentrance.

## Extensions potentielles

- **Gestion dynamique des propriétaires**: Implémenter des fonctions permettant d'ajouter ou de supprimer des propriétaires avec une approbation multisig.
- **Types de transactions**: Étendre la fonctionnalité multisig pour prendre en charge différents types de transactions, au-delà de la simple récompense des étudiants.
- **Émission d'événements améliorée**: Ajouter des paramètres supplémentaires aux événements afin de faciliter un meilleur suivi hors chaîne.

## Conclusion

Le mécanisme de multisignature dans le contrat `Altarian42` offre une méthode robuste et sécurisée pour gérer des opérations critiques, garantissant qu'aucun propriétaire ne peut agir de manière unilatérale. En exigeant plusieurs confirmations, le contrat favorise une gouvernance collaborative et réduit le risque d'actions non autorisées.