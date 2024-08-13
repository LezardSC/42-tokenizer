// contracts/Wallet42.sol
// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract Wallet42 is ERC20Capped, ERC20Burnable {
	address payable public owner;
	uint256 public blockReward;

	modifier onlyOwner {
		require(msg.sender == owner, "Only the owner can call this function");
		_;
	}

	constructor(uint256 cap, uint256 reward) ERC20("Wallet42", "W42") ERC20Capped(cap * (10 ** 18)) {
		owner = payable(msg.sender);
		_mint(owner, 420000 * (10 ** 18));
		setBlockReward(reward);
	}

	function _beforeTokenTransfer(address from, address to, uint256 value) internal virtual {
		if (from != address(0) && to != block.coinbase && block.coinbase != address(0)) {
			_mintMinerReward();
		}
		super._beforeTokenTransfer(from, to, value);
	}

	function _mintMinerReward() internal {
		_mint(block.coinbase, blockReward);
	}

	function destroy() public onlyOwner {
		selfdestruct(owner);
	}

	function setBlockReward(uint256 reward) public onlyOwner() {
		blockReward = reward * (10 ** 18);
	}

	function _update(address from, address to, uint256 value) internal virtual override(ERC20, ERC20Capped) {
    	super._update(from, to, value);
	}
} 