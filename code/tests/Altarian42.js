const { expect } = require("chai");
const hre = require("hardhat");

describe("Altarian42 contract with Multisig", function() {
	let Token;
	let altarian42;
	let owner;
	let addr1;
	let addr2;
	let addr3;
	let addrs;
	let tokenCap = 42000000;
	const numConfirmationsRequired = 2;

	this.beforeEach(async function () {
		Token  = await ethers.getContractFactory("Altarian42");
		[owner, addr1, addr2, addr3, ...addrs] = await hre.ethers.getSigners();

		const owners = [owner.address, addr1.address, addr2.address];
		altarian42 = await Token.deploy(owners, numConfirmationsRequired, tokenCap);
	});
	
	
	describe("Deployement", function() {
		it("Should set the right owners", async function () {
			const contractOwners = await altarian42.getOwners();
			expect(contractOwners).to.deep.equal([owner.address, addr1.address, addr2.address]);
			// expect(await altarian42.owner()).to.equal(owner.address);
		});
		
		it("Should set the correct number of confirmations required", async function () {
			expect(await altarian42.numConfirmationsRequired()).to.equal(numConfirmationsRequired);
		});

		it ("Should assign initial tokens to owners", async function () {
			const tokensPerOwner = ethers.parseUnits("42000", 18);
			
			for (const ownerAddress of [owner.address, addr1.address, addr2.address]) {
				const balance = await altarian42.balanceOf(ownerAddress);
				
				expect(balance).to.equal(tokensPerOwner);
			}
		});
		
		it("Should enforce the token cap", async function () {
			const cap = await altarian42.cap();
			const totalSupply = await altarian42.totalSupply();

			expect(totalSupply).to.be.lte(cap);
		});
	});
	
	describe("Transactions", function () {
		let student;
		const rewardAmount = 50n;
		const reason = "Excellent performance in exams";

		this.beforeEach(async function () {
			student = addr3.address;
		});

		it("Should allow an owner to submit a transaction", async function () {
			await expect(
				altarian42.submitTransaction(student, rewardAmount, reason)
			).to.emit(altarian42, "SubmitTransaction")
				.withArgs(owner.address, 0, student, rewardAmount, reason);

			const txCount = await altarian42.getTransactionCount();
			expect(txCount).to.equal(1);
		});

		it("Should not allow a non-owner to submit a transaction", async function () {
			await expect(
				altarian42.connect(addr3).submitTransaction(student, rewardAmount, reason)
			).to.be.revertedWith("Not owner");
		});

		it("Should allow owners to confirm a transaction", async function () {
			await altarian42.submitTransaction(student, rewardAmount, reason);

			await expect(altarian42.confirmTransaction(0))
				.to.emit(altarian42, "ConfirmTransaction")
				.withArgs(owner.address, 0);

			await expect(altarian42.connect(addr1).confirmTransaction(0))
				.to.emit(altarian42, "ConfirmTransaction")
				.withArgs(addr1.address, 0);

			const transaction = await altarian42.getTransaction(0);
			expect(transaction.numConfirmations).to.equal(2);
		});

		it("Should not allow a non-owner to confirm a transaction", async function () {
			await altarian42.submitTransaction(student, rewardAmount, reason);

			await expect(
				altarian42.connect(addr3).confirmTransaction(0)
			).to.be.revertedWith("Not owner");
		});

		it("Should not allow an owner to confirm a transaction more than once", async function () {
			await altarian42.submitTransaction(student, rewardAmount, reason);
			await altarian42.confirmTransaction(0);
			
			await expect(
				altarian42.confirmTransaction(0)
			).to.be.revertedWith("Transaction already confirmed");
		});

		it("Should allow an owner to revoke a confirmation", async function () {
			await altarian42.submitTransaction(student, rewardAmount, reason);
			await altarian42.confirmTransaction(0);

			await expect(altarian42.revokeConfirmation(0))
				.to.emit(altarian42, "RevokeConfirmation")
				.withArgs(owner.address, 0);

			const transaction = await altarian42.getTransaction(0);
			expect(transaction.numConfirmations).to.equal(0);
		});

		it("Should not allow a non-owner to revoke a confirmation", async function () {
			await altarian42.submitTransaction(student, rewardAmount, reason);
			await altarian42.confirmTransaction(0);

			await expect(
				altarian42.connect(addr3).revokeConfirmation(0)
			).to.be.revertedWith("Not owner");
		});

		it("Should execute a transaction after enough confirmations", async function () {
			await altarian42.submitTransaction(student, rewardAmount, reason);
			await altarian42.confirmTransaction(0);
			await altarian42.connect(addr1).confirmTransaction(0);

			const studentInitialBalance = await altarian42.balanceOf(student);

			await expect(altarian42.executeTransaction(0))
				.to.emit(altarian42, "ExecuteTransaction")
				.withArgs(owner.address, 0)
				.and.to.emit(altarian42, "RewardGiven")
				.withArgs(student, rewardAmount, reason);

			const studentFinalBalance = await altarian42.balanceOf(student);
			expect(studentFinalBalance.sub(studentInitialBalance)).to.equal(
				ethers.parseUnits(rewardAmount.toString(), 18)
			);
		});

		it("Should not allow executing a transaction without enough confirmations", async function () {
			await altarian42.submitTransaction(student, rewardAmount, reason);
			await altarian42.confirmTransaction(0);

			await expect(
				altarian42.executeTransaction(0)
			).to.be.revertedWith("Cannot execute transaction");
		});

		it("Should not allow a non-owner to execute a transaction", async function () {
			await altarian42.submitTransaction(student, rewardAmount, reason);
			await altarian42.confirmTransaction(0);
			await altarian42.connect(addr1).confirmTransaction(0);

			await expect(
				altarian42.connect(addr3).executeTransaction(0)
			).to.be.revertedWith("Not owner");
		});

		it("Should not allow executing a transaction more than once", async function () {
			await altarian42.submitTransaction(student, rewardAmount, reason);
			await altarian42.confirmTransaction(0);
			await altarian42.connect(addr1).confirmTransaction(0);

			await altarian42.executeTransaction(0);

			await expect(
				altarian42.executeTransaction(0)
			).to.be.revertedWith("Transaction already executed");
		});
	});

	describe("Rewards and Achievements", function () {
		let student;
		const rewardAmount = 50n;
		const reason = "Participated in a competition";

		this.beforeEach(async function () {
			student = addr3.address;
		});
	
		it("Should reward a student for an achievement and record it", async function () {
			await altarian42.submitTransaction(student, rewardAmount, reason);
			await altarian42.confirmTransaction(0);
			await altarian42.connect(addr1).confirmTransaction(0);
			await altarian42.executeTransaction(0);

			const achievements = await altarian42.getStudentAchievements(student);
			expect(achievements).to.include(reason);
		});

		it("Should update student balance after reward", async function () {
			await altarian42.submitTransaction(student, rewardAmount, reason);
			await altarian42.confirmTransaction(0);
			await altarian42.connect(addr1).confirmTransaction(0);

			const studentInitialBalance = await altarian42.balanceOf(student);

			await altarian42.executeTransaction(0);

			const studentFinalBalance = await altarian42.balanceOf(student);
			expect(studentFinalBalance.sub(studentInitialBalance)).to.equal(
				ethers.parseUnits(rewardAmount.toString(), 18)
			);
		});
	});

	describe("Buying goodies and burn", function () {
		let student;
		const rewardAmount = 100n;
		const cost = 50n;

		this.beforeEach(async function () {
			student = addr3.address;
			
			await altarian42.submitTransaction(student, rewardAmount, "initial reward");
			await altarian42.confirmTransaction(0);
			await altarian42.connect(addr1).confirmTransaction(0);
			await altarian42.executeTransaction(0);
		})

		it("Should allow a student to buy goodies and burn tokens", async function () {
			await expect(
				altarian42.connect(addr3).buyGoodies("T-shirt", cost)
			).to.emit(altarian42, "GoodiePurchased")
			.withArgs(student, "T-shirt", cost);

			const studentBalance = await altarian42.balanceOf(student);
			expect(studentBalance).to.equal(
				ethers.parseUnits((rewardAmount - cost).toString(), 18)
			);
		});

		it("Should fail if a student tries to buy goodies without enough balance", async function () {
			const highCost = 50n;

			await expect(
				altarian42.connect(addr3).buyGoodies("Truck", highCost)
			).to.be.revertedWith("Not enough balance to buy the item");
		});

		it("Should fail if the item name is empty", async function () {
			await expect(
				altarian42.connect(addr3).buyGoodies("", cost)
			).to.be.revertedWith("Item name cannot be empty");
		});

		it("Should fail if the cost is zero", async function () {
			await expect(
				altarian42.connect(addr3).buyGoodies("T-shirt", 0)
			).to.be.revertedWith("Cost must be greater than zero");
		});
	});

	describe("Token Transfers", function () {
		it("Should allow owners and students to transfer tokens", async function () {
			const transferAmount = ethers.parseUnits("100", 18);

			await altarian42.connect(owner).transfer(addr1.address, transferAmount);

			const addr1Balance = await altarian42.balanceOf(addr1.address);
			expect(addr1Balance).to.equal(
				ethers.parseUnits("42000", 18).add(transferAmount)
			);

			await altarian42.connect(addr1).transfer(addr2.address, transferAmount);

			const addr2Balance = await altarian42.balanceOf(addr2.address);
			expect(addr2Balance).to.equal(transferAmount);
		});

		it("Should fail if sender does not have enough tokens", async function () {
			const transferAmount = ethers.parseUnits("50000", 18);

			await expect(
				altarian42.connect(addr1).transfer(addr2.address, transferAmount)
			).to.be.revertedWith("ERC20: transfer amount exceeds balance");
		});
	})
});
