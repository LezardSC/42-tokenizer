# Testing on Remix

How to deploy and try `Altarian42` in the browser with [Remix](https://remix.ethereum.org), without installing anything.

## 1. Add the contract

1. Open https://remix.ethereum.org.
2. In the file explorer, create `contracts/Altarian42.sol` and paste the contract into it.
3. Replace the imports with GitHub URLs, since Remix doesn't have the npm packages:

```solidity
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/ERC20Burnable.sol";
```

If these links stop working, get the new paths from the [OpenZeppelin repository](https://github.com/OpenZeppelin/openzeppelin-contracts).

## 2. Compile

In the **Solidity Compiler** tab, pick a 0.8.x version (the project uses `0.8.20`) and click **Compile Altarian42.sol**.

## 3. Deploy

In the **Deploy & Run Transactions** tab:

- **Environment**: `Remix VM` to test locally, or `Injected Provider - MetaMask` to deploy on Sepolia (see below).
- **Constructor arguments**: owners, required confirmations, cap. For example, using three accounts from the **Account** dropdown:

```
["0x5B3...Eed", "0xAb8...09b", "0x4B0...e37"], 2, 1000000
```

The cap is in whole tokens, without decimals. Then click **Deploy**. The contract shows up under **Deployed Contracts**.

## 4. Try it out

Change the active account in the **Account** dropdown to act as different owners or as a student.

1. **Propose a reward**: as owner 1, call `submitTransaction` with a student address, an amount (e.g. `50`) and a reason.
2. **Confirm**: as owner 1 and owner 2, call `confirmTransaction(0)`.
3. **Execute**: as any owner, call `executeTransaction(0)`.
4. **Check**: `balanceOf(student)` and `getStudentAchievements(student)`.
5. **Buy**: as the student, call `buyGoodies("T-Shirt", 20)`, then check that `balanceOf` and `totalSupply` went down.

Amounts (`_amount`, `cost`) are always in whole tokens; the contract adds the decimals. Emitted events and revert messages appear in the console at the bottom.

Things worth trying: executing without enough confirmations, calling an owner function from a non-owner account, confirming twice, buying with too low a balance.

## Deploying on Sepolia

1. In MetaMask, enable test networks and select **Sepolia**.
2. Get test ETH from a faucet, e.g. https://sepolia-faucet.pk910.de/.
3. In Remix, choose `Injected Provider - MetaMask` as the environment and accept the connection.
4. Deploy as above; MetaMask asks you to confirm each transaction.

You can follow transactions on [Sepolia Etherscan](https://sepolia.etherscan.io/).

## Common issues

- **Compilation error**: check the compiler version and the import URLs.
- **Invalid constructor arguments**: addresses must be in quotes inside `[]`, numbers must not be.
- **`Not owner`**: the active account isn't one of the owners passed to the constructor.
- **Not enough gas on Sepolia**: get more test ETH.
- **MetaMask doesn't connect**: unlock it, check it's on Sepolia, reload Remix.
