// contracts/Altarian42.sol
// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract Altarian42 is ERC20Capped, ERC20Burnable {
	address payable public owner;
	mapping(address => string[]) private studentAchievements;

	event RewardGiven(address indexed student, uint256 amount, string reason);
	event GoodiePurchased(address indexed buyer, string item, uint256 cost);

	modifier onlyOwner {
		require(msg.sender == owner, "Only the owner can call this function");
		_;
	}

	constructor(uint256 cap) ERC20("Altarian", "A42") ERC20Capped(cap * (10 ** 18)) {
		owner = payable(msg.sender);
		_mint(owner, 4200000 * (10 ** 18));
	}

	function _update(address from, address to, uint256 value) internal virtual override(ERC20, ERC20Capped) {
		super._update(from, to, value);
	}

	function rewardStudent(address student, uint256 amount, string memory reason) public onlyOwner {
		require(student != address(0), "Invalid student address");
		require(amount > 0, "Reward amount must be greater than zero");

		_mint(student, amount * (10 ** 18));
		studentAchievements[student].push(reason);
		emit RewardGiven(student, amount, reason);
	}

	function buyGoodies(string memory item, uint256 cost) public {
		require(bytes(item).length > 0, "Item name cannot be empty");
		require(cost > 0, "Cost must be greater than zero");
		require(balanceOf(msg.sender) >= cost * (10 ** 18), "Not enough balance to buy the item");
	
		_burn(msg.sender, cost * (10 ** 18));
		emit GoodiePurchased(msg.sender, item, cost);
	}

	function getStudentAchievements(address student) public view returns (string [] memory) {
		require(student != address(0), "Invalid student address");
		return studentAchievements[student];
	}
}
