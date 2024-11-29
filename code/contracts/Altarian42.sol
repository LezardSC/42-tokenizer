// contracts/Altarian42.sol
// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract Altarian42 is ERC20Capped, ERC20Burnable {
	address[] public owners;
	uint public numConfirmationsRequired;
	mapping(address => bool) public isOwner;
	mapping(address => string[]) private studentAchievements;

	struct Transaction {
		address student;
		uint256 amount;
		string reason;
		bool executed;
		uint numConfirmations;
	}

	Transaction[] public transactions;
	mapping(uint => mapping(address => bool)) public isConfirmed;

	// Multisig events
	event SubmitTransaction(
		address indexed owner,
		uint indexed txIndex,
		address indexed student,
		uint256 amount,
		string reason
	);

	event ConfirmTransaction(
		address indexed owner,
		uint indexed txIndex
	);

	event RevokeConfirmation(
		address indexed owner,
		uint indexed txIndex
	);

	event ExecuteTransaction(
		address indexed owner,
		uint indexed txIndex
	);

	// Main events
	event RewardGiven(
		address indexed student,
		uint256 amount,
		string reason
	);
	event GoodiePurchased(
		address indexed buyer,
		string item,
		uint256 cost
	);

	modifier onlyOwner() {
		require(isOwner[msg.sender], "Only one of the owners can call this function");
		_;
	}

	modifier txExists(uint _txIndex) {
		require(_txIndex < transactions.length, "Transaction does not exist");
		_;
	}

	modifier notExecuted(uint _txIndex) {
		require(!transactions[_txIndex].executed, "Transaction already executed");
		_;
	}

	modifier notConfirmed(uint _txIndex) {
		require(!isConfirmed[_txIndex][msg.sender], "Transaction already confirmed");
		_;
	}

	constructor(
		address[] memory _owners,
		uint _numConfirmationsRequired,
		uint256 cap
	) ERC20("Altarian", "A42") ERC20Capped(cap * (10 ** 18)) {
		require(_owners.length > 0, "Owners required");
		require(_owners.length <= 10, "Cannot have more than 10 owners");
		require(
			_numConfirmationsRequired > 0 &&
			_numConfirmationsRequired <= _owners.length,
			"Invalid number of required confirmations"
		);

		for (uint i = 0; i < _owners.length; i++) {
			address ownerAddr = _owners[i];

			require(ownerAddr != address(0), "Invalid owner");
			require(!isOwner[ownerAddr], "Owner not unique");

			isOwner[ownerAddr] = true;
			owners.push(ownerAddr);
		}
		numConfirmationsRequired = _numConfirmationsRequired;

		uint256 tokensPerOwner = 42000 * (10 ** 18);
		uint256 totalTokensToMint = tokensPerOwner * owners.length;
		uint256 capAmount = cap * (10 ** 18);

		require(totalTokensToMint <= capAmount, "Total tokens to mint exceed cap");

		for (uint i = 0; i < owners.length; i++) {
			_mint(owners[i], tokensPerOwner);
		}
	}

	function _update(address from, address to, uint256 amount) internal virtual override(ERC20, ERC20Capped) {
		super._update(from, to, amount);
	}

	// Multisig functions
	function submitTransaction(
		address _student,
		uint256 _amount,
		string memory _reason
	) public onlyOwner {
		uint txIndex = transactions.length;

		transactions.push(Transaction({
			student: _student,
			amount: _amount,
			reason: _reason,
			executed: false,
			numConfirmations: 0
		}));

		emit SubmitTransaction(msg.sender, txIndex, _student, _amount, _reason);
	}

	function confirmTransaction(uint _txIndex)
		public
		onlyOwner
		txExists(_txIndex)
		notExecuted(_txIndex)
		notConfirmed(_txIndex)
	{
			Transaction storage transaction = transactions[_txIndex];
			transaction.numConfirmations += 1;
			isConfirmed[_txIndex][msg.sender] = true;

			emit ConfirmTransaction(msg.sender, _txIndex);
	}

	function executeTransaction(uint _txIndex)
		public
		onlyOwner
		txExists(_txIndex)
		notExecuted(_txIndex)
	{
		Transaction storage transaction = transactions[_txIndex];
		
		require(
			transaction.numConfirmations >= numConfirmationsRequired,
			"Cannot execute transaction"
		);

		transaction.executed = true;
		_rewardStudent(
			transaction.student,
			transaction.amount,
			transaction.reason
		);

		emit ExecuteTransaction(msg.sender, _txIndex);
	}

	function revokeConfirmation(uint _txIndex)
		public
		onlyOwner
		txExists(_txIndex)
		notExecuted(_txIndex)
	{
		require(isConfirmed[_txIndex][msg.sender], "Transaction not confirmed");

		Transaction storage transaction = transactions[_txIndex];

		transaction.numConfirmations -= 1;
		isConfirmed[_txIndex][msg.sender] = false;

		emit RevokeConfirmation(msg.sender, _txIndex);
	}

	// Main functions
	function _rewardStudent(
		address student,
		uint256 amount,
		string memory reason
		) internal
	{
		require(student != address(0), "Invalid student address");
		require(amount > 0, "Reward amount must be greater than zero");

		uint256 amountWithDecimals = amount * (10 ** 18);
		uint256 newTotalSupply = totalSupply() + amountWithDecimals;

		require(newTotalSupply <= cap(), "Reward exceeds token cap");

		_mint(student, amountWithDecimals);
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

	// Helper functions
	function getOwners() public view returns (address[] memory) {
		return owners;
	}

	function getTransactionCount() public view returns (uint) {
		return transactions.length;
	}

	function getTransaction(uint _txIndex)
		public
		view
		returns (
			address student,
			uint256 amount,
			string memory reason,
			bool executed,
			uint numConfirmations
		)
	{
		Transaction storage transaction = transactions[_txIndex];

		return (
			transaction.student,
			transaction.amount,
			transaction.reason,
			transaction.executed,
			transaction.numConfirmations
		);
	}

	function getStudentAchievements(address student) public view returns (string [] memory) {
		require(student != address(0), "Invalid student address");
		return studentAchievements[student];
	}
}
