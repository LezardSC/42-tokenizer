// contracts/Altarian42.sol
// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract Altarian42 is ERC20Capped, ERC20Burnable {
	address payable public owner;
	uint256 public blockReward;

	modifier onlyOwner {
		require(msg.sender == owner, "Only the owner can call this function");
		_;
	}

	constructor(uint256 cap, uint256 reward) ERC20("Altarian", "A42") ERC20Capped(cap * (10 ** 18)) {
		owner = payable(msg.sender);
		_mint(owner, 4200000 * (10 ** 18));
		setBlockReward(reward);
	}

	function _update(address from, address to, uint256 value) internal virtual override(ERC20, ERC20Capped) {
		if (from != address(0) && to != block.coinbase && block.coinbase != address(0)) {
			_mintMinerReward();
		}
		super._update(from, to, value);
	}

	function _mintMinerReward() internal {
		_mint(block.coinbase, blockReward);
	}

	function setBlockReward(uint256 reward) public onlyOwner() {
		blockReward = reward * (10 ** 18);
	}

} 