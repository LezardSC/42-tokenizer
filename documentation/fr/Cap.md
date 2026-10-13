# Cap

La supply totale d'A42 ne peut jamais dépasser un maximum fixé au déploiement. Cela vient de `ERC20Capped` d'OpenZeppelin.

```solidity
contract Altarian42 is ERC20Capped, ERC20Burnable { ... }
```

## Définir le cap

Le cap est le troisième argument du constructeur, en tokens entiers (le constructeur ajoute les 18 décimales) :

```solidity
constructor(
    address[] memory _owners,
    uint _numConfirmationsRequired,
    uint256 cap
) ERC20("Altarian", "A42") ERC20Capped(cap * (10 ** 18)) { ... }
```

## Distribution initiale

Chaque owner reçoit 42 000 tokens au déploiement. Le déploiement échoue si cela dépasse le cap :

```solidity
uint256 tokensPerOwner = 42000 * (10 ** 18);
uint256 totalTokensToMint = tokensPerOwner * owners.length;

require(totalTokensToMint <= cap * (10 ** 18), "Total tokens to mint exceed cap");
```

Le reste du cap est réservé aux récompenses des étudiants.

## Quand le cap est vérifié

- Dans le constructeur, pour la distribution initiale.
- Dans `_rewardStudent`, avant chaque récompense : `"Reward exceeds token cap"`.

Brûler des tokens (voir [Achat et burn](PurchasingAndBurning.md)) réduit la supply totale, ce qui libère de la place sous le cap pour de nouvelles récompenses.
