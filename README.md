# Altarian 42

If you're french, [here's a french version](/README-fr.md) of this README.

First project in the blockchain branch of 42 School. The aim of the project is to create its own crypto-currency on the Ethereum blockchain.

## Table of Contents

- [Introduction](#introduction)
- [Key Features](#key-features)
- [Design Choices and Rationale](#design-choices-and-rationale)
- [Setup Instructions](#setup-instructions)
- [Dependencies](#dependencies)
- [Usage](#usage)
- [Testing the Contract on Remix](#testing-the-contract-on-remix)
- [More documentation](#more-documentation)
- [Contributing](#contributing)
- [License](#license)

## Introduction

Altarian42 is a blockchain-based solution designed to modernize the school's wallet system. By leveraging Ethereum smart contracts, we provide a secure, transparent, and decentralized way for students to earn and spend tokens through projects, events, and achievements.

## Key Features

- **Token Rewards**: Students earn tokens by accomplishing projects, events, or achievements on the intra platform.
- **Token Spending**: Tokens can be used to purchase items in the school shop.
- **Multisignature Security**: Requires multiple approvals to validate each reward, enhancing security.
- **ERC20 Compliance**: Adheres to the ERC20 standard for broad compatibility.
- **Capped Supply**: Enforces a maximum token supply to maintain scarcity and value.
- **Burnable Tokens**: Allows tokens to be burned when students purchase items, reducing the total supply.

## Design Choices and Rationale

#### Use of Ethereum Blockchain

I chose the Ethereum blockchain as the foundation for Altarian42 due to its robust smart contract capabilities and widespread adoption. Ethereum's mature ecosystem provides a secure and decentralized platform for deploying smart contracts, ensuring that the token system is transparent and tamper-proof. Its support for programmable logic allows us to implement complex functionalities like multisignature mechanisms and token standards.

#### Solidity for Smart Contract Development

Solidity was selected as the programming language for developing the smart contract because it's the primary language for writing smart contracts on Ethereum. Its syntax similar to JavaScript and C++, making it accessible for developers. Solidity's features enable us to implement the required logic for token distribution, multisig functionality, and other custom behaviors needed for Altarian42.

#### Deployment on Sepolia Test Network

I opted to deploy and test the contract on the Sepolia test network. Sepolia is a public Ethereum testnet that simulates the main network's environment without the associated costs and risks. This allows us to thoroughly test the contract's functionality, security and performance in a realistic setting. Using Sepolia helps identify and resolve issues early in the development process.

#### Multisignature Implementation

To enhance security, we implemented a multisignature (multisig) mechanism for critical functions like rewarding students. This approach requires multiple approvals from designated owners before executing significant transactions or minting new tokens. It prevents any single owner from unilaterally issuing tokens, reducing the risk of abuse or errors. The multisig setup ensures that the governance of the token system is collaborative and secure.
The owners aims to be members of the school administration, here the Bocal.

To learn more about the Multisignature implementation, see the [Multisig Documentation](/documentation/en/Multisig.md).

#### Token Cap and Distribution Strategy

We introduced a capped token supply to enforce scarcity and maintain the token's value. An initial amount of tokens is distributed to the owners to facilitate initial testing and operations. The remaining tokens are reserved for rewarding students, ensuring that the token economy is sustainable. By controlling the total supply, we can prevent inflation and encourage responsible token management.

To learn more about the Cap and Distribution, see the [Cap Documentation](/documentation/en/Cap.md).

#### Limiting the Number of Owners

We limited the number of owners to a maximum of 10 to maintain a manageable and secure governance structure. Having a small group of trusted owners simplifies the coordination required for the multisig process. It reduces the complexity of obtaining confirmations for transactions and minimizes the risk of coordination issues that could arise with a large group. We can imagine that every member of the Bocal is an owner, and 2 or 3 of them are necessary to validate the action of giving an achievement to a student.

#### Utilizing OpenZeppelin Contracts

We leveraged OpenZeppelin's contracts for ERC20, ERC20Capped, and ERC20Burnable functionalities. OpenZeppelin provides well-audited, secure, and industry-standard implementations of smart contract components. Using these contracts reduces the risk of contract components, vulnerabilities and saves development time, allowing us to focus on implementing the custom logic specific to Altarian42.

#### Development with Hardhat

Hardhat was chosen as the development environment for its flexibility and powerful features. It provides a rich set of tools for compiling, testing, and deploying smart contracts. Hardhat's extensible plugin system and comprehensive debugging capabilities enhance development workflow. It allows us to write automated tests, simulate blockchain environments, and ensure that the contract behaves as expected under various scenarios.

I updated paths in `hardhat.config.js` to organize files properly, maintaining a clean and structured project layout. The main reason, of course, is to meet the project requirements.

#### Infura as Provider

To interact with the Ethereum blockchain, I use Infura, a trusted Ethereum infrastructure provider. Infura allows us to deploy and interact with the Altarian42 smart contract on the Sepolia testnet without running a full Ethereum node. Its reliability and ease of use make it an excellent choice for Ethereum-based projects.

To set up the project, you'll need an Infura API key to connect to the Sepolia network. You can obtain one by creating an account on [Infura](https://www.infura.io/). Ensure that your .env file includes your Infura project ID as shown below:

```plaintext
	INFURA_SEPOLIA_ENDPOINT = 'https://sepolia.infura.io/v3/YOUR_TOKEN'
```

## Setup Instructions

#### Prerequisites

- **Node.js**: Versions 16.0.0 or higher (v20.9.0 recommended to avoid unexpected behaviour, but every recent version should works).
- **npm**: Comes with Node.js
- **Git**: For version control.
- **MetaMask Wallet**: or any other wallet. Recommended but not mandatory, as a private key is required in order to deploy the contract.
- **An Infura account**: or any other providers. You will need to update the hardhat configs if you decide to use something else than Infura. Required for connecting to the Sepolia test network.

#### Installation Steps

1. **Clone the repository**
```bash
	git clone <repository-url>
	cd tokenizer
```

2. **Install Dependencies**
```bash
	npm install
	npm install @openzeppelin/contracts
	npm install dotenv
```

3. **Create an Environment File**
- Create a `.env` file in the root directory.
- Add necessary environment variables. You can find a template in the `.env.example` file.

4. **Compile the Contracts**
```bash
	npx hardhat compile
```

5. **Run Tests**
```bash
	npx hardhat test
```

6. **Deploy to Sepolia Network**
```bash
	npx hardhat run --network sepolia deployment/scripts/deploy.js
```

7. **Update Contract Address**
- After deployment, update the contract address in the `.env` file.
- Ensure you update this address every time you redeploy the contract.

## Dependencies

- **@openzeppelin/contracts**: For secure and standard implementations of ERC20 and other functionalities.
- **dotenv**: For managing environment variables.
- **Hardhat**: Development environment for compiling, testing, and deploying smart contracts.

## Usage
- **Earning Tokens**: Students earn tokens through predefined achievements, projects, and events.
To see more about the reward and achievements, see the [documentation](/documentation/en/RewardsAndAchievements.md).
- **Spending Tokens**: Tokens can be spent in the school shop to purchase items, promoting engagement.
To see more about purchasing and burning, see the [documentation](/documentation/en/PurchasingAndBurning.md)
- **Administrative Actions**: Owners can propose and approve transactions via the multisig mechanism, ensuring secure governance.

## Testing the Contract on Remix

If you prefer to test and interact with the `Altarian42` smart contract using the Remix IDE, see the [Testing on Remix Documentation](/documentation/en/Remix.md)

## More documentation

For a deeper dive into Altarian42, [check the full project documentation](/documentation/en/Altarian42.md).

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes. Ensure that all tests pass and adhere to the project's coding standards.

## License

This project is part of the **42 School curriculum** and follows its evaluation and submission guidelines.

## Author

login: jrenault
