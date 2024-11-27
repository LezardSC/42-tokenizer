const { expect } = require("chai");
const hre = require("hardhat");

describe("Altarian42 contract", function() {
	let Token;
	let altarian42;
	let owner;
	let addr1;
	let addr2;
	let tokenCap = 42000000;

	this.beforeEach(async function () {
		Token  = await ethers.getContractFactory("Altarian42");
		[owner, addr1, addr2] = await hre.ethers.getSigners();

		altarian42 = await Token.deploy(tokenCap);
	});
	
	
	describe("Deployement", function() {
		it("Should set the right owner", async function () {
			expect(await altarian42.owner()).to.equal(owner.address);
		});
		
		it ("Should assign the total supply of tokens to the owner", async function () {
			const ownerBalance = await altarian42.balanceOf(owner.address);
			expect(await altarian42.totalSupply()).to.equal(ownerBalance);
		});
		
		it("Should set the max capped supply to the argument provided during deployement", async function () {
			const cap = await altarian42.cap();
			expect(Number(ethers.formatEther(cap))).to.equal(tokenCap);
		});
	});
	
	describe("Transactions", function () {
		it("Should transfer tokens between accounts", async function () {
			await altarian42.transfer(addr1.address, 50);
			const addr1Balance = await altarian42.balanceOf(addr1.address);
			expect(addr1Balance).to.equal(50);
			
			// We use .connect(signer) to send a transaction from another account
			await altarian42.connect(addr1).transfer(addr2.address, 50);
			const addr2Balance = await altarian42.balanceOf(addr2.address);
			expect(addr2Balance).to.equal(50);
		});
		
		it("Sould fail if sender doesn't have enough tokens", async function () {
			const initialOwnerBalance = await altarian42.balanceOf(owner.address);
			
			// Try to send 1 token from addr1 (0 tokens) to owner.
			await expect(
				altarian42.connect(addr1).transfer(owner.address, 1)
			).to.be.revertedWithCustomError(altarian42, "ERC20InsufficientBalance");
			
			// Owner balance shouldn't have changed.
			expect(await altarian42.balanceOf(owner.address)).to.equal(
				initialOwnerBalance
			);
		});
		
		it("Should update balances after transfers", async function () {
			const initialOwnerBalance = await altarian42.balanceOf(owner.address);
			
			await altarian42.transfer(addr1.address, 100);
			await altarian42.transfer(addr2.address, 50);
			
			const amountToSubstract = 150n;
			const finalOwnerBalance = await altarian42.balanceOf(owner.address);
			expect(finalOwnerBalance).to.equal(initialOwnerBalance - amountToSubstract);
			
			const addr1Balance = await altarian42.balanceOf(addr1.address);
			expect(addr1Balance).to.eq(100);
			const addr2Balance = await altarian42.balanceOf(addr2.address);
			expect(addr2Balance).to.equal(50);
		});
	});

	describe("Rewards and Achievements", function () {
		it("Should reward a student for an achievement", async function () {
			const student = addr1.address;
			const rewardAmount = 50n;
			const reason = "Cleaned the classroom";

			// Reward the student
			await altarian42.rewardStudent(student, rewardAmount, reason);

			// Verify the student's token balance
			const studentBalance = await altarian42.balanceOf(student);
			expect(studentBalance).to.equal(rewardAmount * (10n ** 18n));

			// Verify the student's achievements
			const achievements = await altarian42.getStudentAchievements(student);
			expect(achievements).to.include(reason);
		});

		it("Should emit an event when rewarding a student", async function () {
			const student = addr1.address;
			const rewardAmount = 500n;
			const reason = "Won a hackaton";

			// Expect the RewardGiven event to be emitted with the correct parameters
			await expect(altarian42.rewardStudent(student, rewardAmount, reason))
			.to.emit(altarian42, "RewardGiven")
			.withArgs(student, rewardAmount, reason);
		});

		it("Should fail to reward a student if the caller is not the owner", async function () {
			const student = addr1.address;
			const rewardAmount = 100n;
			const reason = "Watched an exam";

			// Try rewarding as addr1 (non-owner)
			await expect(
				altarian42.connect(addr1).rewardStudent(student, rewardAmount, reason)
			).to.be.revertedWith("Only the owner can call this function");
		});

		it("Should store multiple achievements for a student", async function () {
			const student = addr1.address;

			await altarian42.rewardStudent(student, 50, "Cleaned the classroom");
			await altarian42.rewardStudent(student, 100, "Won the math contest");

			// Verify all achievements are recorded
			const achievements = await altarian42.getStudentAchievements(student);
			expect(achievements).to.include("Cleaned the classroom");
			expect(achievements).to.include("Won the math contest");
		});

		it("Should fail to reward zero tokens", async function () {
			const student = addr1.address;
			await expect(altarian42.rewardStudent(student, 0, "Invalid reward"))
			.to.be.revertedWith("Reward amount must be greater than zero");
		});

		it("Should not exceed the capped supply when rewarding students", async function () {
			const student = addr1.address;
			const rewardAmount = tokenCap;

			await expect(
				altarian42.rewardStudent(student, rewardAmount, "Exceeded cap")
			).to.be.revertedWithCustomError(altarian42, "ERC20ExceededCap");
			
			const totalSupply = await altarian42.totalSupply();
			const cap = await altarian42.cap();
			expect(totalSupply).to.be.lte(cap);
		});

		it("Should handle many achievements for a single student", async function () {
			const student = addr1.address;

			for (let i = 0; i < 100; i++) {
				await altarian42.rewardStudent(student, 10n, `Achievement ${i}`);
			}

			const achievementCount = await altarian42.getStudentAchievements(student);
			expect(achievementCount.length).to.equal(100);
		});

		it("Should fail to reward the zero address", async function () {
			const rewardAmount = 50n;

			await expect(
				altarian42.rewardStudent("0x0000000000000000000000000000000000000000", rewardAmount, "Invalid address")
			).to.be.revertedWith("Invalid student address");
		});
	});

	describe("Buying goodies and burn", function () {
		it("Should allow a student to buy goodies and burn tokens", async function () {
			const student = addr1.address;
			const cost = 50n;

			await altarian42.rewardStudent(student, 100n, "Helped organize an event");
			await altarian42.connect(addr1).buyGoodies("T-shirt", cost);

			const studentBalance = await altarian42.balanceOf(student);
			expect(studentBalance).to.equal((100n - cost) * (10n ** 18n));

			const totalSupply = await altarian42.totalSupply();
			expect(totalSupply).to.equal((4200000n + 100n - cost) * (10n ** 18n));
		});

		it("Should fail if a student tries to buy goodies without enough balance", async function () {
			const cost = 50n;

			await expect(
				altarian42.connect(addr1).buyGoodies("T-shirt", cost)
			).to.be.revertedWith("Not enough balance to buy the item");
		});

		it("Should fail if the item name is empty", async function () {
			const student = addr1.address;
			const cost = 50n;

			await altarian42.rewardStudent(student, 100n, "Helped organize an event");

			await expect(
				altarian42.connect(addr1).buyGoodies("", cost)
			).to.be.revertedWith("Item name cannot be empty");
		});

		it("Should fail if the cost is zero", async function () {
			const student = addr1.address;

			await altarian42.rewardStudent(student, 100n, "Helped organize an event");

			await expect(
				altarian42.connect(addr1).buyGoodies("T-shirt", 0)
			).to.be.revertedWith("Cost must be greater than zero");
		});
	});
});
