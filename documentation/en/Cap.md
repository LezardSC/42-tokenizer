# Cap

The total supply of A42 can never go over a maximum set at deployment. This comes from OpenZeppelin's `ERC20Capped`.

```solidity
contract Altarian42 is ERC20Capped, ERC20Burnable { ... }
```

## Setting the cap

The cap is the third constructor argument, in whole tokens (the constructor adds the 18 decimals):

```solidity
constructor(
    address[] memory _owners,
    uint _numConfirmationsRequired,
    uint256 cap
) ERC20("Altarian", "A42") ERC20Capped(cap * (10 ** 18)) { ... }
```

## Initial distribution

Each owner receives 42,000 tokens at deployment. Deployment fails if this is more than the cap:

```solidity
uint256 tokensPerOwner = 42000 * (10 ** 18);
uint256 totalTokensToMint = tokensPerOwner * owners.length;

require(totalTokensToMint <= cap * (10 ** 18), "Total tokens to mint exceed cap");
```

The rest of the cap is left for student rewards.

## When the cap is checked

- In the constructor, for the initial distribution.
- In `_rewardStudent`, before each reward is minted: `"Reward exceeds token cap"`.

Burning tokens (see [Purchasing and burning](PurchasingAndBurning.md)) lowers the total supply, which frees up room under the cap for new rewards.
