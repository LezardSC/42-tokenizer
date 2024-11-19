const { expect } = require("chai");
const hre = require("hardhat");

describe("Altarian42 contract", function() {
	let Token;
	let altarian42;
	let owner;
	let addr1;
	let addr2;
	let tokenCap = 42000000;
	let tokenBlockReward = 50;

	this.beforeEach(async function () {
		Token  = await ethers.getContractFactory("Altarian42");
		[owner, addr1, addr2] = await hre.ethers.getSigners();

		altarian42 = await Token.deploy(tokenCap, tokenBlockReward);
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
		
		it("Should set the blockReward to the argument provided during deployement", async function() {
			const blockReward = await altarian42.blockReward();
			expect(Number(ethers.formatEther(blockReward))).to.equal(tokenBlockReward);
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
			
			// Try to send 1 token from addr1 (0 tokens) to owner (1000000 tokens).
			// `require` will evaluate false and revert the transaction.
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
});