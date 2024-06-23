// Just storing the contract I do on remix for now.

// contracts/FortyTwoCoin.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.26;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";

contract FortyTwoCoin is ERC20 {
    constructor(uint256 initialSupply) ERC20("FortyTwoCoin", "FTC") {
        _mint(msg.sender, initialSupply);
    }
}