# Testing the Altarian42 Contract on Remix

This tutorial guides you through deploying and interacting with the `Altarian42` smart contract using the **Remix IDE**.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Steps](#steps)
	- [1. Open Remix IDE](#1-open-remix-ide)
	- [2. Set Up the Workspace](#2-set-up-the-workspace)
	- [3. Copy the Smart Contract Code](#3-copy-the-smart-contract-code)
	- [4. Import OpenZeppelin Contracts](#4-import-openzeppelin-contracts)
	- [5. Compile the Contract](#5-compile-the-contract)
	- [6. Deploy the Contract](#6-deploy-the-contract)
	- [7. Interact with the Contract](#7-interact-with-the-contract)
	- [8. Testing Functions](#8-testing-functions)
	- [9. Simulating Ownership and Roles](#9-simulating-ownership-and-roles)
	- [10. Testing Scenarios](#10-testing-scenarios)
	- [11. Viewing Events and Logs](#11-viewing-events-and-logs)
- [Notes](#notes)
- [Deploying to a Testnet (Optional)](#deploying-to-a-testnet-optional)
	- [1. Configure MetaMask](#1-configure-metamask)
	- [2. Connect Remix to MetaMask](#2-connect-remix-to-metamask)
	- [3. Deploy the Contract](#3-deploy-the-contract)
	- [4. Interact with the Contract](#4-interact-with-the-contract)
- [Common Errors and Troubleshooting](#common-errors-and-troubleshooting)

## Prerequisites

- **Web Browser**: Chrome, Firefox, or any modern browser.
- **Internet Access**: To reach Remix IDE at https://remix.ethereum.org.
- **MetaMask Extension**: Installed and configured (only required for if you want to deploy the contract to testnets).

## Steps

#### 1. Open Remix IDE

- Navigate to https://remix.ethereum.org in your web browser.

#### 2. Set Up the Workspace

- In the Remix IDE, click on the **File Explorers** icon on the left panel.
- Create a new file for your contract:
	Right-click on the `contracts` folder and select New File.
	Name the file `Altarian42.sol`.

#### 3. Copy the Smart Contract Code

- Copy the content of your `Altarian42.sol` contract into the new file you just created in Remix.

#### 4. Import OpenZeppelin Contracts

- Since the contract uses OpenZeppelin contracts, you need to import them into Remix.
- Remix supports importing from GitHub, so you can import OpenZeppelin contracts directly.

##### Update Import Statements:

Replace the import statements in your contract with the following:

```Solidity
    import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";
    import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/ERC20Capped.sol";
    import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/ERC20Burnable.sol";
```

- If the links were deprecated in the future, find the new ones in [the official  OpenZeppelin github](https://github.com/OpenZeppelin/openzeppelin-contracts)

#### 5. Compile the Contract

- Click on the **Solidity Compiler** icon on the left panel (it looks like a gavel).
- Ensure the compiler version matches the one specified in your contract pragma (e.g., `0.8.20`).
- Click on **Compile Altarian42.sol**.
- If you encounter any errors, check the import statements and ensure the correct Solidity version is selected.

#### 6. Deploy the Contract

- Click on the **Deploy & Run Transactions** icon on the left panel (it looks like a play button).

##### Environment Selection

- Under Environment, select one of the following:
    - **JavaScript VM (Cancun (or London))**: For local testing within Remix.
    - **Injected Provider - MetaMask**: To deploy to a testnet via MetaMask.

##### Constructor Parameters

You need to input the constructor parameters:

1. **_owners (address[])**: An array of owner addresses.
    - Example:
        - If using Remix's JavaScript VM accounts:
	```json
        ["0x5B3...Eed", "0xAb8...09b", "0x4B0...e37"]
	```
        - To get the account addresses, copy them from the **Accounts** dropdown.

2. **_numConfirmationsRequired (uint256)**: The number of confirmations required for multisig transactions.
    - **Example**: `2`

3. **cap (uint256)**: The token cap (total supply limit).

    - **Example**: For a cap of 1,000,000 tokens, input `1000000`.

    - **Note**: Do not include decimals here; the contract handles the conversion.

**Inputting Constructor Parameters**

- In the **Deploy** section, enter the parameters in the following format:

```json
	["<owner1>", "<owner2>", "<owner3>"], <numConfirmationsRequired>,
    <cap>
```

- **Example**:

```json
    ["0x5B3...Eed", "0xAb8...09b", "0x4B0...e37"],
    2,
    1000000
```
    Ensure you separate the parameters with commas and that the array of addresses is enclosed in square brackets [].

##### Deploying

- Click on **deploy** or **transact**.
- If deploying to a testnet, MetaMask will prompt you to confirm the transaction.

#### 7. Interact with the Contract

- After deployment, the contract instance will appear under **Deployed Contracts**.
- Expand the contract to view available functions.

#### 8. Testing Functions

- **Multisig Functions**:
    - `submitTransaction`: Propose a new transaction.
    - `confirmTransaction`: Confirm a proposed transaction.
    - `executeTransaction`: Execute a transaction after sufficient confirmations.
    - `revokeConfirmation`: Revoke your confirmation before execution.

- **Token Functions**:
    - `balanceOf`: Check the token balance of an address.
    - `getStudentAchievements`: View the achievements of a student.
    - `buyGoodies`: Spend tokens to purchase items.

#### 9. Simulating Ownership and Roles

- **Switching Accounts**:
    - Use the **Accounts** dropdown at the top of the **Deploy & Run Transactions** panel to change the active account.
    - This allows you to simulate different owners and students.

- **Note**: In JavaScript VM, the accounts are pre-funded with ETH and have distinct addresses.

#### 10. Testing Scenarios

##### a. Submit and Confirm a Transaction

1. **Submit Transaction**:

    - As **Owner1**, call `submitTransaction` with:
        `_student`: Address of the student (e.g., another account).
        `_amount`: Amount to reward (e.g., 50).
        `_reason`: Reason for the reward (e.g., `"Excellent Performance"`).

2. **Confirm Transaction**:

    - Switch to **Owner2** and call `confirmTransaction` with:
        `_txIndex`: The index of the transaction (e.g., `0` for the first transaction).

3. **Optional**: Repeat confirmation with other owners if needed.

**b. Execute a Transaction**

- Once the required confirmations are received, as any owner, call `executeTransaction` with:
    - `_txIndex`: The index of the transaction to execute.

- Verify that the student’s balance has increased accordingly.

**c. Check Balances and Achievements**

- As the student, call `balanceOf` with your address to check your token balance.
- Call `getStudentAchievements` with your address to view your achievements.

**d. Buying Goodies**

- As the student, call `buyGoodies` with:
    - `item`: Name of the item (e.g., `"T-Shirt"`).
    - `cost`: Cost of the item in tokens (e.g., `20`).

- Verify that your balance decreases and the total supply reduces.

#### 11. Viewing Events and Logs

- The **Console** at the bottom of Remix displays logs and events.

- Look for events like:
    - `SubmitTransaction`
    - `ConfirmTransaction`
    - `ExecuteTransaction`
    - `RewardGiven`
    - `GoodiePurchased`

- These help you verify that actions are occurring as expected.

## Notes

- **Decimals Handling**:
    - Input amounts (like `_amount` and `cost`) without accounting for decimals.
    - The contract automatically handles the conversion to the correct decimal places.

- **Address Format**:
    - Use the addresses provided in the **Accounts** dropdown.
    - Ensure addresses are enclosed in quotes when inputting them as strings.

- **Error Handling**:

    - If a transaction fails, check the error message in the **Console**.

    - Common errors include:
        - Not enough confirmations.
        - Not an owner.
        - Insufficient balance.
        - Invalid transaction index.

- **Testing Edge Cases**:
	- Try submitting transactions with invalid data (e.g., zero amount, invalid addresses).
    - Attempt to execute transactions without sufficient confirmations.

## Deploying to a Testnet (Optional)

#### 1. Configure MetaMask

- **Install MetaMask**:
    - Add the MetaMask extension to your browser.

- **Add the Sepolia Network**:
    - Open MetaMask and click on the network dropdown.
    - Select **show testnet**
	- Select **Sepolia**
	- If it's not here, select **Add Network** and enter the Sepolia network details.

- **Obtain Test ETH**:

    - Use a Sepolia faucet to get test ETH.
    - [Example faucets](https://sepolia-faucet.pk910.de/)

#### 2. Connect Remix to MetaMask

- In Remix, under **Environment**, select **Injected Provider - MetaMask**.
- Approve the connection in MetaMask when prompted.

#### 3. Deploy the Contract

- Follow the same steps as in [Deploy the Contract](#6-deploy-the-contract).
- Ensure you have enough test ETH to cover gas fees.

#### 4. Interact with the Contract

- Use MetaMask accounts to interact with the contract functions.
- Transactions will appear in MetaMask for approval.
- Monitor transactions using a block explorer like [Etherscan for Sepolia](https://sepolia.etherscan.io/).

## Common Errors and Troubleshooting

- **Compilation Errors**:
    - Ensure that the Solidity compiler version in Remix matches the pragma version in your contract.
    - Check that import statements are correct and accessible.

- **Invalid Constructor Arguments**:
    - Ensure that arrays are properly formatted (e.g., `["address1", "address2"]`).
    - Check that numeric values are integers and do not include quotes.

- **Transaction Fails with 'Not Owner'**:
    - Verify that the account you're using is one of the owners.
    - Check the list of owners initialized during deployment.

- **Insufficient Gas**:
    - If deploying to a testnet, ensure you have enough test ETH in your MetaMask account.

- **Unable to Connect MetaMask to Remix**:
    - Refresh both Remix and MetaMask.
    - Ensure MetaMask is unlocked and on the correct network.

- **Events Not Showing**:
    - Make sure you are checking the Logs tab in the Remix console.
    - Ensure that the transaction was successful.

By following this tutorial, you should be able to deploy and interact with the `Altarian42` contract using Remix IDE. This hands-on approach allows you to test the contract's functionality and understand its behavior in a controlled environment.