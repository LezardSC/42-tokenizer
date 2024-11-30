
#### Prerequisites

- A web browser(Chrome, Firefox, etc.)
- Internet access to reach Remix IDE at `https://remix.ethereum.org/`

#### Steps

1. **Open Remix IDE**
	- Navigate to `https://remix.ethereum.org/` in your web browser.
2. **Set Up the Workspace**
	- In the Remix IDE, click on the "File Explorers" icon on the left panel.
	- Create a new file for your contract:
		- Right-click on the `contracts` folder and select "New File."
		- Name the file `Altarian42.sol`.

3. **Copy the Smart Contract Code**

	- Copy the content of your Altarian42.sol contract into the new file you just created in Remix.

4. **Import OpenZeppelin Contracts**

	- Since the contract uses OpenZeppelin contracts, you need to import them into Remix.
	- Remix supports importing from GitHub, so you can import OpenZeppelin contracts directly.

	**Update Import Statements:**

	Replace the import statements in your contract with the following:

	```solidity
	import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.0/contracts/token/ERC20/ERC20.sol";
	import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.0/contracts/token/ERC20/extensions/ERC20Capped.sol";
	import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.0/contracts/token/ERC20/extensions/ERC20Burnable.sol";
	```
	- Ensure that the version (v5.0.0) matches the one compatible with your contract.

5. **Compile the Contract**
	- Click on the "Solidity Compiler" icon on the left panel (it looks like a "gavel").
	- Ensure the compiler version matches the one specified in your contract pragma (e.g., 0.8.20).
	- Click on "Compile Altarian42.sol."
	- If you encounter any errors, check the import statements and ensure the correct Solidity version is selected.

6. **Deploy the Contract**

	- Click on the "Deploy & Run Transactions" icon on the left panel (it looks like a "play" button).

	- Under "Environment," select "JavaScript VM" for local testing or "Injected Provider" to deploy to a testnet via MetaMask.

	- **Constructor Parameters**:
		- **_owners (address[])**: Provide an array of owner addresses. In JavaScript VM, you can use accounts provided by Remix.
			- Example: `[account1, account2, account3]`
		- **_numConfirmationsRequired (uint256)**: Set the number of confirmations required for multisig transactions.
			- Example: `2`
		- **cap (uint256)**: Set the token cap. Remember to include the correct number of decimals.
			- Example: To set a cap of 1,000,000 tokens with 18 decimals: `1000000`

	- Input the constructor parameters in the "Deploy" section.
		- For array inputs, use JSON format. For example: `["0x123...", "0x456...", "0x789..."]`

	- Click on "Deploy."

7. **Interact with the Contract**
	- After deployment, the contract instance will appear under "Deployed Contracts."
	- Expand the contract to view available functions.

8. **Testing Functions**:
	- **submitTransaction**: Owners can propose transactions to reward students.
	- **confirmTransaction**: Owners can confirm proposed transactions.
	- **executeTransaction**: Once enough confirmations are received, an owner can execute the transaction.
	- **revokeConfirmation**: Owners can revoke their confirmation before execution.
	- **buyGoodies**: Students can spend tokens to purchase items.
	- **balanceOf: Check the token balance of an address.
	- **getStudentAchievements**: View the achievements of a student.

9. **Simulating Ownership and Roles**
	- In JavaScript VM, switch between accounts to simulate different owners and students.
	- Use the dropdown at the top of the "Deploy & Run Transactions" panel to change the active account.
	- **Note**: The accounts provided by Remix in JavaScript VM are pre-funded with ETH, which is helpful for testing.

10. **Testing Scenarios**
	- **Submit and Confirm a Transaction**:
		- As an owner (e.g., `account1`), call `submitTransaction` with the student's address, amount, and reason.
		- Switch to other owner accounts (e.g., `account2`) and call `confirmTransaction` with the transaction index.
	- **Execute a Transaction**:
		- Once the required confirmations are received, call `executeTransaction` to mint tokens to the student.
	- **Check Balances and Achievements**:
		- Use `balanceOf` to check a student's token balance.
		- Use `getStudentAchievements` to view the student's achievements.
	- **Buying Goodies**:
		- As the student, call `buyGoodies` with the item name and cost.
		- Verify that the student's balance decreases and the total supply is updated.

11. **Viewing Events and Logs**
	- Remix provides a console at the bottom where you can see emitted events.
	- Use these events to verify that actions are occurring as expected.
	- Look for events like `SubmitTransaction`, `ConfirmTransaction`, `ExecuteTransaction`, `RewardGiven`, and `GoodiePurchased`.

## Notes

- **Decimals Handling**: Remember that amounts are often expected to be in tokens without accounting for decimals since the contract handles the multiplication. For example, to mint 50 tokens, input 50, and the contract will multiply by 10 ** decimals().
- **Address Format**: In Remix's JavaScript VM, accounts are available in the dropdown and can be referenced directly.
- **Error Handling**: If a transaction fails, check the error message in the console to understand why (e.g., not enough confirmations, not an owner, insufficient balance).
- **Testing Edge Cases**: Try testing scenarios where transactions fail due to insufficient confirmations, invalid addresses, or exceeding the token cap.

#### Deploying to a Testnet (Optional)

If you want to deploy the contract to a testnet (e.g., Sepolia) and interact with it via Remix:

1. **Configure MetaMask**
	- Install MetaMask extension in your browser.
	- Add the Sepolia network to MetaMask.
	- Obtain test ETH from a Sepolia faucet.

2. **Connect Remix to MetaMask**
	- In Remix, under "Environment," select "Injected Provider."
	- Approve the connection in MetaMask.

3. **Deploy the Contract**
	- Provide the constructor parameters as before.
	- Deploy the contract.
	- **Note**: Transactions on a testnet will require gas fees paid in test ETH.

4. **Interact with the Contract**
	- Use MetaMask accounts to interact with the contract functions.
	- Be aware of network delays and gas fees on the testnet.
	- Monitor transactions in MetaMask and on a block explorer like [Etherscan](https://sepolia.etherscan.io/).