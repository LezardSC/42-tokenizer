// contracts/Wallet42.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract Wallet42 is ERC20Capped, ERC20Burnable {
    address payable public owner;

    constructor(uint256 cap) ERC20("Wallet42", "W42") ERC20Capped(cap * (10 ** 18)) {
        owner = msg.sender;
        _mint(owner, 420000 * (10 ** 18));
    } 
} 