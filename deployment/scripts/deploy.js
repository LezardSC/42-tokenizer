const hre = require("hardhat");

const TOKEN_CAP = 42000000n;

async function main() {
	const [deployer] = await hre.ethers.getSigners();

	const owners = process.env.OWNERS
		? process.env.OWNERS.split(",").map(addr => addr.trim()).filter(addr => addr.length > 0)
		: [deployer.address];
	const numConfirmationsRequired = BigInt(process.env.NUM_CONFIRMATIONS_REQUIRED || 1);

	console.log("Owners: ", owners);
	console.log("Confirmations required: ", numConfirmationsRequired.toString());

	const AltarianToken = await hre.ethers.getContractFactory("Altarian42");
	const altarian42 = await AltarianToken.deploy(owners, numConfirmationsRequired, TOKEN_CAP);

	await altarian42.waitForDeployment();

	const address = await altarian42.getAddress();
	console.log("altarian42 Token deployed at: ", address);
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
