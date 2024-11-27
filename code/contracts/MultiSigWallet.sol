// contracts/MultiSigWallet.sol
// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

contract MultiSigWallet {
	// State Variables
	address[] public owners;
	mapping(address => bool) public isOwner;
	uint public numConfirmationsRequired;

	// Structs
	struct Transaction {
		address to;
		uint value;
		bytes data;
		bool executed;
		uint numConfirmations;
	}

	// Mappings
	mapping(uint => mapping(address => bool)) public isConfirmed;

	// Array of Transactions
	Transaction[] public transactions;

	// Events
	event Deposit(address indexed sender, uint amount, uint balance);
	event SubmitTransaction(
		address indexed owner,
		uint indexed txIndex,
		address indexed to,
		uint value,
		bytes data
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

	constructor(address[] memory _owners, uint _numConfirmationsRequired) {
		require(_owners.length > 0, "Owners required");
		require(
			_numConfirmationsRequired > 0 &&
			_numConfirmationsRequired <= _owners.length,
			"Invalid number of required confirmations"
		);

		for (uint i = 0; i < _owners.length; i++) {
			address owner = _owners[i];

			require(owner != address(0), "Invalid owner");
			require(!isOwner[owner], "Owner not unique");

			isOwner[owner] = true;
			owners.push(owner);
		}

		numConfirmationsRequired = _numConfirmationsRequired;
	}

	receive() external payable {
		emit Deposit(msg.sender, msg.value, address(this).balance);
	}

	modifier onlyOwner() {
		require(isOwner[msg.sender], "Not owner");
		_;
	}

	modifier txExists(uint _txIndex) {
		require(_txIndex < transactions.length, "Transaction does not exist");
	}
}