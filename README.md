# Altarian 42

[Version française](/README-fr.md)

Altarian42 (A42) is an ERC20 token on Ethereum, made for the first project of 42's blockchain branch.

The idea: replace the school's wallet system with a token. Students earn A42 for projects, events and achievements, and spend it in the school shop. Rewards can only be minted when several staff members (the Bocal) approve them.

## Features

- **ERC20 token** built on OpenZeppelin (`ERC20`, `ERC20Capped`, `ERC20Burnable`).
- **Multisig rewards**: an owner proposes a reward, other owners confirm it, and it can only be executed once enough confirmations are collected.
- **Capped supply**: total supply can never exceed the cap set at deployment.
- **Burn on purchase**: tokens spent in the shop are burned.
- **Achievements**: each reward reason is stored on-chain for the student.

## Design choices

- **Ethereum + Solidity**: the standard choice for smart contracts, with the most tooling and documentation.
- **Sepolia testnet**: to deploy and test for free in a real network environment.
- **OpenZeppelin**: audited ERC20 implementations, so only the custom logic had to be written.
- **Multisig**: no single owner can mint tokens alone. Owners are meant to be Bocal members; for example, 2 or 3 confirmations out of all of them to grant an achievement.
- **10 owners max**: keeps the group small enough that collecting confirmations stays practical.
- **Cap**: each owner gets 42,000 tokens at deployment, the rest of the cap is left for student rewards.
- **Hardhat**: to compile, test and deploy. Paths in `hardhat.config.js` were changed to fit the folder layout required by the subject.
- **Infura**: to reach Sepolia without running a node.

## Setup

### Prerequisites

- Node.js 16+ (tested with v20.9.0) and npm
- A wallet private key (MetaMask or any other wallet) to deploy
- An [Infura](https://www.infura.io/) API key, or another provider (then update `hardhat.config.js`)

### Installation

```bash
git clone <repository-url>
cd tokenizer
npm install
```

Create a `.env` file at the root, based on `.env.example`:

```plaintext
PRIVATE_KEY = ''
INFURA_SEPOLIA_ENDPOINT = 'https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID'
CONTRACT_ADDRESS = ''
OWNERS = ''
NUM_CONFIRMATIONS_REQUIRED = ''
```

`OWNERS` is a comma-separated list of owner addresses (10 max) and `NUM_CONFIRMATIONS_REQUIRED` is how many of them must approve a reward. If they're left empty, the deployer is the only owner and 1 confirmation is required.

### Compile, test, deploy

```bash
npx hardhat compile
npx hardhat test
npx hardhat run --network sepolia deployment/scripts/deploy.js
```

After deploying, put the new contract address in `CONTRACT_ADDRESS` in `.env` (do it again each time you redeploy).

## Documentation

- [Multisig](/documentation/en/Multisig.md): how rewards are proposed, confirmed and executed
- [Rewards and achievements](/documentation/en/RewardsAndAchievements.md): minting rewards and storing achievements
- [Purchasing and burning](/documentation/en/PurchasingAndBurning.md): spending tokens in the shop
- [Cap](/documentation/en/Cap.md): supply limit and initial distribution
- [Testing on Remix](/documentation/en/Remix.md): deploy and try the contract from the browser

## License

Project from the 42 School curriculum. The contract is under the MIT license.

## Author

jrenault
