const hre = require("hardhat");

async function main() {
	const AltarianToken = await hre.ethers.getContractFactory("Altarian42");
	const altarian42 = await AltarianToken.deploy(42000000n);

	await altarian42.waitForDeployment();

	const address = await altarian42.getAddress();
	console.log("altarian42 Token deployed at: ", address);
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});