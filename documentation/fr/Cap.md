# Cap Documentation

WIP, PRIVILEGIER VERSION ANGLAISE

## Vue d'ensemble

La fonctionnalité **Cap** du contrat `Altarian42` impose une limite maximale à l'offre totale de tokens. Cela garantit une rareté des tokens et aide à maintenir leur valeur au fil du temps.

## Détails de l'implémentation

- **Héritage** : Le contrat hérite de `ERC20Capped`, qui fournit la fonctionnalité de plafond.

```solidity
	contrat Altarian42 is ERC20Capped, ERC20Burnable { ... }
```

- **Initialisation du Cap** : Le plafond est défini lors du déploiement du contrat via le constructeur.

```solidity
	constructeur(
		address[] memory _owners,
		uint _numConfirmationsRequired,
		uint256 cap
	) ERC20(« Altarian », « A42 ») ERC20Capped(cap * (10 ** 18)) { ... }
```

- **Minting des Tokens dans le Constructeur** :
	- Chaque propriétaire reçoit 42 000 tokens.
	- Le total des tokens mintés est calculé et vérifié par rapport au plafond.

```solidity
	uint256 tokensPerOwner = 42000 * (10 ** 18);
	uint256 totalTokensToMint = tokensPerOwner * owners.length;
	uint256 capAmount = cap * (10 ** 18);

	require(totalTokensToMint <= capAmount, "Total tokens to mint exceed cap");

	for (uint i = 0; i < owners.length; i++) {
		_mint(owners[i], tokensPerOwner);
	}
```


- **Minting des Récompenses** :
	- Lorsqu’un étudiant reçoit une récompense, le contrat vérifie que l’offre totale ne dépasse pas le cap.

```solidity
	uint256 newTotalSupply = totalSupply() + amountWithDecimals;

	require(newTotalSupply <= cap(), "Reward exceeds token cap");

	_mint(student, amountWithDecimals);
```

## Fonctions liées à Cap

- **Constructor** : Fixe le plafond et mint les tokens initiaux aux propriétaires.
- **_rewardStudent** :
	- Fonction interne qui mint des tokens pour récompenser les étudiants.
	- Vérifie que le plafond n’est pas dépassé avant de minter.

## Test de la fonctionnalité Cap

##### Cas de Test

1. **La distribution initiale de tokens ne dépasse pas le plafond**

	- Vérifie que le total des tokens initiaux mintés aux propriétaires est inférieur ou égal au plafond.

```javascript
	it("Doit respecter le plafond de tokens", async function () {
    	const cap = await altarian42.cap();
	    const totalSupply = await altarian42.totalSupply();

    	expect(totalSupply).to.be.lte(cap);
	});
```

2. **Impossible de monnayer des tokens au-delà du plafond**

	- Tente d’accorder une récompense qui dépasserait le plafond total des tokens.
    - La transaction doit échouer avec "Reward exceeds token cap".

```javascript
	it("Ne doit pas permettre de minter au-delà du plafond", async function () {
		// Supposons un plafond de 1 000 000 tokens
		// L’offre totale est déjà proche du plafond
		const excessiveRewardAmount = 1_000_000n;

		await altarian42.submitTransaction(student, excessiveRewardAmount, reason);
		await altarian42.confirmTransaction(0);
		await altarian42.connect(addr1).confirmTransaction(0);

		await expect(
			altarian42.executeTransaction(0)
		).to.be.revertedWith("Reward exceeds token cap");
	});

```


## Considérations importantes

    - Décimales : Toutes les quantités de tokens sont gérées avec `18 décimales (10 ** 18)`.

    - Application du plafond : Vérification à la fois lors de la création initiale et lors de la récompense des étudiants.

	- Brûler des tokens : Lorsqu’un token est brûlé via `buyGoodies`, l’offre totale diminue, permettant ainsi de mint de nouveaux tokens jusqu’au plafond.

## Conclusion

La fonctionnalité de plafond garantit que l’offre totale de tokens Altarian42 ne peut pas dépasser une limite prédéfinie, ce qui favorise la rareté et la stabilité de la valeur.
Grâce à ces vérifications rigoureuses, le contrat maintient l’intégrité de l’économie des tokens.