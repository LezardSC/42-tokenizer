# Documentation sur l'achat et la destruction de tokens

## Vue d'ensemble

La fonctionnalité d'**Achat et destruction** de tokens permet aux étudiants de dépenser leurs tokens pour acquérir des articles (goodies) dans la boutique de l'école. Lorsqu'un achat est effectué, le nombre correspondant de tokens est détruit, réduisant ainsi l'offre totale et favorisant la rareté des tokens.

## Détails d'implémentation

#### Fonctions

**buyGoodies**

**Visibilité: `public`**

**But**: Permet aux étudiants d'acheter des articles en brûlant des tokens.

```solidity
    function buyGoodies(string memory item, uint256 cost) public
```

- **Paramètres**:
    - `item`: Nom de l'article à acheter.
    - `cost`: Coût de l'article en tokens (sans décimales).

- **Logique de la fonction**:
    
    1. **Validation**:
        - Vérifie que `item` n'est pas une chaîne vide.
        - S'assure que `cost` est supérieur à zéro.
        - Vérifie que l'expéditeur dispose d'un solde suffisant.
    2. **Destruction des tokens**:
        - Brûle (détruit) le montant spécifié de tokens provenant de l'expéditeur.
    3. **Émission d'événement**:
        - Émet l'événement `GoodiePurchased`.

- **Extrait de code**:

```solidity
    function buyGoodies(string memory item, uint256 cost) public {
        require(bytes(item).length > 0, "Item name cannot be empty");
        require(cost > 0, "Cost must be greater than zero");
        require(balanceOf(msg.sender) >= cost * (10 ** 18), "Not enough balance to buy the item");

        _burn(msg.sender, cost * (10 ** 18));
        emit GoodiePurchased(msg.sender, item, cost);
    }
```

#### Événements

##### GoodiePurchased

Émis lorsqu'un achat est effectué.

```solidity
    event GoodiePurchased(
        address indexed buyer,
        string item,
        uint256 cost
    );
```

- **Paramètres**:
    - `buyer`: Adresse de l'étudiant effectuant l'achat.
    - `item`: Nom de l'article acheté.
    - `cost`: Coût de l'article (sans décimales).

## Déroulement des Opérations

1. **Initiation de l'achat**:
    - L'étudiant appelle `buyGoodies` en fournissant le nom de l'article et son coût.
2. **Validation**:
    - Le contrat valide les paramètres et vérifie le solde.
3. **Destruction des tokens**:
    - Les tokens sont brûlés (détruits) sur le solde de l'étudiant.
4. **Émission d'événement**:
    - L'événement `GoodiePurchased` est émis.

## Exemple d'utilisation

**Achat d'un article**

```solidity
    // L'étudiant souhaite acheter un "Notebook" pour 30 tokens
    altarian42.connect(studentSigner).buyGoodies("Notebook", 30);
```
- **Résultat**:
    - 30 tokens sont brûlés du solde de l'étudiant.
    - L'offre totale diminue de 30 tokens.

## Considérations importantes

- **Gestion des décimales**:
    - `cost` est spécifié sans décimales ; le contrat ajuste les décimales en interne.
    - **Contrôle d'accès**:
        Tout compte disposant d'un solde suffisant peut appeler `buyGoodies`.
    - **Émission d'événement**:
        Facilite le suivi des achats hors chaîne.

## Test de la fonctionnalité d'achat

#### Cas de test

1. **Achat réussi**
    - **Test**: L'étudiant achète un article avec succès.
    - **Attendu**: Les tokens sont brûlés et l'événement est émis.

```solidity
    it("Should allow a student to buy goodies and burn tokens", async function () {
        await expect(
            altarian42.connect(addr3).buyGoodies("T-shirt", cost)
        ).to.emit(altarian42, "GoodiePurchased")
        .withArgs(student, "T-shirt", cost);

        const studentBalance = await altarian42.balanceOf(student);
        expect(studentBalance).to.equal(
            ethers.parseUnits((rewardAmount - cost).toString(), 18)
        );
    });
```

2. **Solde insuffisant**

- **Test**: L'achat échoue si l'étudiant ne dispose pas d'un nombre suffisant de tokens.
- **Attendu**: La transaction est annulée avec le message "Not enough balance to buy the item".

```solidity
    it("Should fail if a student tries to buy goodies without enough balance", async function () {
        const highCost = rewardAmount + 1n;

        await expect(
            altarian42.connect(addr3).buyGoodies("Laptop", highCost)
        ).to.be.revertedWith("Not enough balance to buy the item");
    });
```

3. **Nom d'article vide**

- **Test**: Purchase fails if item name is empty.
- **Attendu**: La transaction est annulée avec le message "Item name cannot be empty".

```solidity
    it("Should fail if the item name is empty", async function () {
        await expect(
            altarian42.connect(addr3).buyGoodies("", cost)
        ).to.be.revertedWith("Item name cannot be empty");
    });
```

4. **Coût zéro**

- **Test**: Purchase fails if cost is zero.
- **Attendu**: La transaction est annulée avec le message "Cost must be greater than zero".

```solidity
    it("Should fail if the cost is zero", async function () {
        await expect(
            altarian42.connect(addr3).buyGoodies("Pen", 0)
        ).to.be.revertedWith("Cost must be greater than zero");
    });
```

## Considérations de sécurité

- **Sécurité contre les attaques par réentrance**: Utilise des fonctions intégrées qui sont protégées contre ce type d'attaque.
- **Validation des entrées**: Empêche les achats invalides et les destructions de tokens involontaires.
- **Accès ouvert**: Aucune restriction sur qui peut appeler `buyGoodies`, bien que des vérifications de solde soient effectuées.

## Extensions potentielles

- **Catalogue d'articles**: Implémenter une liste prédéfinie d'articles avec des prix fixes.
- **Historique des achats**: Enregistrer l'historique des achats pour chaque étudiant.

## Interaction avec l'économie des tokens

- **Réduction de l'offre**: La destruction de tokens diminue l'offre totale, ce qui peut potentiellement augmenter leur valeur.
- **Incitation**: Encourage les étudiants à gagner des tokens afin de pouvoir les dépenser sur des articles.