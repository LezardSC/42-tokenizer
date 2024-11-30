# Cap Documentation

## Overview

The **Cap** functionality in the `Altarian42` contract enforces a maximum limit on the total supply of tokens. This ensures token scarcity and helps maintain the token's value over time.

## Implementation Details

- **Inheritance**: The contract inherits from `ERC20Capped`, which provides the cap functionality.

```Solidity
	contract Altarian42 is ERC20Capped, ERC20 Burnable { ... }
```

- **Cap Initialization**: The cap is set during contract deployement via the constructor.

```Solidity
	constructor(
		address[] memory _owners,
		uint _numConfirmationsRequired,
		uint256 cap
	) ERC20("Altarian", "A42") ERC20Capped(cap * (10 ** 18)) { ... }
```
- **Token Minting in Constructor**:
	- Each owner is minted `42,000` tokens.
	- The total tokens minted are calculated and checked against the cap.

```Solidity
	uint256 tokensPerOwner = 42000 * (10 ** 18);
	uint256 totalTokensToMint = tokensPerOwner * owners.length;
	uint256 capAmount = cap * (10 ** 18);

	require(totalTokensToMint <= capAmount, "Total tokens to mint exceed cap");

	for (uint i = 0; i < owners.length; i++) {
		_mint(owners[i], tokensPerOwner);
	}
```

- **Minting Rewards**:
	- When rewarding students, the contract checks that the new total supply does not exceed the cap.

```Solidity
	uint256 newTotalSupply = totalSupply() + amountWithDecimals;

	require(newTotalSupply <= cap(), "Reward exceeds token cap");

	_mint(student, amountWithDecimals);
```

## Functions Related to Cap

- **Constructor**: Sets the cap and mints initial tokens to owners.
- **_rewardStudent**:
	- Internal function that mints tokens to students as rewards.
	- Checks against the cap before minting.

## Testing the Cap Functionality

##### Test Cases

1. **Initial Token Distribution Does Not Exceed Cap**

	- Verifies that the total initial tokens minted to owners are less than equal to the cap.

```javascript
	it("Should enforce the token cap", async function () {
		const cap = await altarian42.cap();
		const totalSupply = await altarian42.totalSupply();

		expect(totalSupply).to.be.lte(cap);
	});
```

2. **Cannot Mint Tokens Beyond Cap**

	- Attempts to reward a student with tokens that would cause the total supply to exceed the cap.
    - Expects the transaction to revert with "Reward exceeds token cap".

```javascript
	it("Should not allow minting beyond the cap", async function () {
    	// Assuming cap is 1,000,000 tokens
    	// Total supply is already close to cap
    	const excessiveRewardAmount = 1_000_000n;

		await altarian42.submitTransaction(student, excessiveRewardAmount, reason);
		await altarian42.confirmTransaction(0);
		await altarian42.connect(addr1).confirmTransaction(0);

		await expect(
			altarian42.executeTransaction(0)
		).to.be.revertedWith("Reward exceeds token cap");
	});
```

## Important Considerations

    - Decimals: All token amounts are handled with 18 decimals in mind ((10 ** 18)).

    - Cap Enforcement: The cap is enforced both during the initial minting in the constructor and when rewarding students.

	- Burning Tokens: When tokens are burned via the buyGoodies function, the total supply decreases, allowing for more tokens to be minted up to the cap.

## Conclusion

The cap functionality ensures that the total supply of Altarian42 tokens cannot exceed a predefined maximum, promoting scarcity and value retention.
By carefully checking the cap during minting operations, the contract maintains the integrity of the token economy.