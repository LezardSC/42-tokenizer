# Documentation sur les Récompenses et Réalisations

## Vue d'ensemble

La fonctionnalité **Récompenses et Réalisations** du contrat `Altarian42` permet aux propriétaires de récompenser les étudiants en leur attribuant des tokens pour leurs accomplissements. Cela incite non seulement les étudiants à s'engager, mais permet également d'enregistrer leurs réalisations au sein du système.

## Détails d'implémentation

#### Structures de données

##### Variables d'état

```solidity
    mapping(address => string[]) private studentAchievements;
```

- **studentAchievements**: Associe l'adresse d'un étudiant à un tableau de chaînes, chacune représentant une réalisation ou la raison d'une récompense.

#### Fonctions
1. **_rewardStudent**

**Visibilité**: `internal`

**But**: Crée des tokens pour un étudiant et enregistre la réalisation.

```solidity
    function _rewardStudent(
        address student,
        uint256 amount,
        string memory reason
    ) internal
```

- **Paramètres**:
    - `student`: L'adresse de l'étudiant à récompenser.
    - `amount`: Le montant de tokens à créer (sans tenir compte des décimales).
    - `reason`: Une description ou raison pour la récompense.

- **Logique de la fonction**:
    
    1. **Validation**:
        - Vérifie que l'adresse `student` est valide (non nulle).
        - Vérifie que `amount` est supérieur à zéro.
    
    2. **Ajustement du montant **:
        - Multiplie `amount` par `10 ** 18` pour tenir compte des décimales du token.
    
    3. **Respect du cap**:
        - S'assure que la création de tokens n'excède pas le cap total défini.
    
    4. **Création des tokens**:
        - Crée le montant calculé de tokens pour le `student`.
    5. **Enregistrement de la réalisation**:
        - Ajoute la valeur de `reason` à la liste des réalisations de l'étudiant.
    6. **Émission d'événement **:
        - Émet l'événement `RewardGiven`.

- Extrait de code:

```solidity
    function _rewardStudent(
        address student,
        uint256 amount,
        string memory reason
    ) internal {
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

2. **getStudentAchievements**

**Visibilité: `public`**

**But**: Récupère la liste des réalisations pour un étudiant donné.

```solidity
    function getStudentAchievements(address student) public view returns (string[] memory)
```

- **Paramètres**:
        - `student`: L'adresse de l'étudiant.

- **Renvoie**:
    - Un tableau de chaînes contenant les réalisations de l'étudiant.

- **Logique de la fonction **:
    - Valide l'adresse de l'étudiant.
    - Renvoie les réalisations de l'étudiant à partir du mapping `studentAchievements`.

    **Extrait de code **:

```solidity
    function getStudentAchievements(address student) public view returns (string[] memory) {
        require(student != address(0), "Invalid student address");
        return studentAchievements[student];
    }
```

#### Événements

**RewardGiven**

Émis lorsqu'un étudiant reçoit une récompense.

```solidity

    event RewardGiven(
        address indexed student,
        uint256 amount,
        string reason
    );
```

- **Paramètres**:
    - `student`:  L'adresse de l'étudiant récompensé.
    - `amount`: Le montant de tokens créés (sans décimales).
    - `reason`: La raison de la récompense.

#### Déroulement des Opérations

1. **Soumission**:
    - Un propriétaire soumet une transaction de récompense via `submitTransaction`.

2. **Confirmation**:
    - Le nombre requis de propriétaires confirme la transaction en utilisant `confirmTransaction`.
    
3. **Execution**:
    - Un propriétaire exécute la transaction avec `executeTransaction`, qui appelle la fonction `_rewardStudent`.

4. **Création et enregistrement**:
    - Les tokens sont créés pour l'étudiant.
    - La réalisation est enregistrée.
    - L'événement `RewardGiven` est émis.

5. **Récupération**:
    - N'importe qui peut récupérer les réalisations d'un étudiant en utilisant `getStudentAchievements`.

## Exemple d'utilisation

#### Récompenser un étudiant

```solidity
    // Owner submits a reward transaction
    altarian42.submitTransaction(studentAddress, 50, "Completed Blockchain Project");

    // Other owners confirm the transaction
    altarian42.confirmTransaction(0);
    altarian42.connect(addr1).confirmTransaction(0);

    // Execute the transaction
    altarian42.executeTransaction(0);
```

**Récupération des réalisations**

```solidity
    // Retrieve the student's achievements
    string[] memory achievements = altarian42.getStudentAchievements(studentAddress);
```

## Considérations importantes

- **Contrôle d'accès**:
    - La fonction est uniquement appelable en interne via l'exécution multisignatures afin de garantir une autorisation appropriée.

- **Respect du plafond**:
    - S'assure que la création de récompenses ne dépasse pas le plafond total de tokens.

- **Émission d'événement**:
    - Facilite le suivi des récompenses et des réalisations hors chaîne.

## Tester la fonctionnalité des récompenses

**Cas de test**

1. **Récompense et enregistrement réussis**

    - **Test**: L'étudiant reçoit des tokens et sa réalisation est enregistrée.
    - **Attendu**: Le solde de l'étudiant augmente et la réalisation est récupérable.

```javascript
    it("Should reward a student and record the achievement", async function () {
        await altarian42.submitTransaction(student, rewardAmount, reason);
        await altarian42.confirmTransaction(0);
        await altarian42.connect(addr1).confirmTransaction(0);
        await altarian42.executeTransaction(0);

        const studentBalance = await altarian42.balanceOf(student);
        expect(studentBalance).to.equal(ethers.parseUnits(rewardAmount.toString(), 18));

        const achievements = await altarian42.getStudentAchievements(student);
        expect(achievements).to.include(reason);
    });
```

2. **Adresse d'étudiant invalide**

- **Test**: Récompenser une adresse invalide doit échouer.
- **Attendu**: La transaction est annulée avec le message "Invalid student address".

```javascript
    it("Should revert if student address is invalid", async function () {
        await altarian42.submitTransaction(ethers.constants.AddressZero, rewardAmount, reason);
        await altarian42.confirmTransaction(0);
        await altarian42.connect(addr1).confirmTransaction(0);

        await expect(
            altarian42.executeTransaction(0)
        ).to.be.revertedWith("Invalid student address");
    });
```

3. **Montant de récompense nul**

    - **Test**: Récompenser avec zéro token doit échouer.
    - **Attendu**: La transaction est annulée avec le message "Reward amount must be greater than zero".

```javascript
    it("Should revert if reward amount is zero", async function () {
        await altarian42.submitTransaction(student, 0, reason);
        await altarian42.confirmTransaction(0);
        await altarian42.connect(addr1).confirmTransaction(0);

        await expect(
            altarian42.executeTransaction(0)
        ).to.be.revertedWith("Reward amount must be greater than zero");
    });
```

4. **Dépassement du plafond de tokens**

    - **Test**: Une récompense qui dépasse le plafond doit échouer.
    - **Attendu**: La transaction est annulée avec le message "Reward exceeds token cap".

```javascript
    it("Should not allow rewarding beyond the cap", async function () {
        const excessiveAmount = tokenCap + 1n; // Assuming tokenCap is accessible

        await altarian42.submitTransaction(student, excessiveAmount, reason);
        await altarian42.confirmTransaction(0);
        await altarian42.connect(addr1).confirmTransaction(0);

        await expect(
            altarian42.executeTransaction(0)
        ).to.be.revertedWith("Reward exceeds token cap");
    });
```

## Considérations de sécurité

- **Contrôle d'accès**: Les récompenses ne peuvent être émises que via le mécanisme multisignatures.
- **Validation des entrées**: S'assure que des données invalides ne corrompent pas l'état du contrat.
- **Enregistrement des événements**: Aide à l'audit et au suivi des récompenses.

## Extensions potentielles

- **Achievements détaillées**: Inclure des horodatages ou des métadonnées supplémentaires.
- **Achievements publiques**: Permettre l'affichage public des réalisations des étudiants.