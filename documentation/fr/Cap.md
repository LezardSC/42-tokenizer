# Cap Documentation

WIP, PRIVILEGIER VERSION ANGLAISE

## Vue d'ensemble

La fonctionnalité **Cap** du contrat `Altarian42` impose une limite maximale à l'offre totale de tokens. Cela garantit la rareté des tokens et aide à maintenir la valeur du token dans le temps.

## Détails de l'implémentation

- **Héritage** : Le contrat hérite de `ERC20Capped`, qui fournit la fonctionnalité de plafonnement.

```solidity
	contrat Altarian42 is ERC20Capped, ERC20 Burnable { ... }
```

- **Initialisation du plafond** : Le plafond est défini lors du déploiement du contrat via le constructeur.

```solidity
	constructeur(
		address[] memory _owners,
		uint _numConfirmationsRequired,
		uint256 cap
	) ERC20(« Altarian », « A42 ») ERC20Capped(cap * (10 ** 18)) { ... }
```

- **Token Minting in Constructor** :
	- Chaque propriétaire reçoit 42 000 tokens.
	- Le total des tokens frappés est calculé et vérifié par rapport au plafond.

```solidity
	uint256 tokensPerOwner = 42000 * (10 ** 18) ;
	uint256 totalTokensToMint = tokensPerOwner * owners.length ;
	uint256 capAmount = cap * (10 ** 18) ;

	require(totalTokensToMint <= capAmount, « Total tokens to mint exceed cap ») ;

	for (uint i = 0 ; i < owners.length ; i++) {
		_mint(owners[i], tokensPerOwner) ;
	}
```


- **Récompenses en argent** :
	- Lorsqu'il récompense des étudiants, le contrat vérifie que la nouvelle offre totale ne dépasse pas le plafond.

```solidity
	uint256 newTotalSupply = totalSupply() + amountWithDecimals ;

	require(newTotalSupply <= cap(), « Reward exceeds token cap ») ;

	_mint(student, amountWithDecimals) ;
```

## Fonctions liées à Cap

- **Constructor** : Fixe le plafond et mint les tokens initiaux aux propriétaires.
- **_rewardStudent** :
	- Fonction interne qui mint des tokens pour récompenser les étudiants.
	- Vérifie le plafond avant de mint des tokens.

## Test de la fonctionnalité du plafond

##### Cas de test

1. **La distribution initiale de tokens ne dépasse pas le plafond**

	- Vérifie que le total des tokens initiaux mintés aux propriétaires est inférieur ou égal au plafond.

```javascript
	it(« Should enforce the token cap », async function () {
		const cap = await altarian42.cap() ;
		const totalSupply = await altarian42.totalSupply() ;

		expect(totalSupply).to.be.lte(cap) ;
	}) ;
```

2. **Impossible de monnayer des tokens au-delà du plafond**

	- Tente de récompenser un étudiant avec des tokens qui feraient que l'offre totale dépasserait le plafond.
    - Il s'attend à ce que la transaction soit retournée avec le message « Reward exceeds token cap ».

```javascript
	it(« Should not allow minting beyond the cap », async function () {
    	// En supposant que le plafond est de 1 000 000 de tokens
    	// L'offre totale est déjà proche du plafond
    	const excessiveRewardAmount = 1_000_000n ;

		await altarian42.submitTransaction(student, excessiveRewardAmount, reason) ;
		await altarian42.confirmTransaction(0) ;
		await altarian42.connect(addr1).confirmTransaction(0) ;

		await expect(
			altarian42.executeTransaction(0)
		).to.be.revertedWith(« Reward exceeds token cap ») ;
	}) ;
```


## Considérations importantes

    - Décimales : Tous les montants des tokens sont traités en tenant compte de 18 décimales ((10 ** 18)).

    - Application du plafond : Le plafond est appliqué à la fois lors du mint initial dans le constructor et lors de la récompense des étudiants.

	- Brûler des tokens : Lorsque des tokens sont brûlés via la fonction buyGoodies, l'offre totale diminue, ce qui permet de mint plus de tokens jusqu'au plafond.

## Conclusion

La fonctionnalité de plafonnement garantit que l'offre totale de tokens Altarian42 ne peut pas dépasser un maximum prédéfini, ce qui favorise la rareté et la conservation de la valeur.
En vérifiant soigneusement le plafond pendant les opérations de minage, le contrat maintient l'intégrité de l'économie des tokens.