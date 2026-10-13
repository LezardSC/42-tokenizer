require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  paths: {
    sources: "./code/contracts",
    tests: "./code/tests",
    cache: "./code/cache",
    artifacts: "./code/artifacts"
  },
  networks: {
    // Only configured when .env is filled, so compile, test and demo work without it
    ...(process.env.INFURA_SEPOLIA_ENDPOINT && process.env.PRIVATE_KEY && {
      sepolia: {
        url: process.env.INFURA_SEPOLIA_ENDPOINT,
        accounts: [process.env.PRIVATE_KEY]
      }
    })
  }
};
