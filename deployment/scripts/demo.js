// Walks through the full Altarian42 lifecycle on a fresh contract:
// propose a reward, collect approvals, pay it, spend tokens in the shop,
// and show that the multisig rejects unauthorized calls.
//
// Usage: npx hardhat run deployment/scripts/demo.js
// Set DEMO_DELAY (ms) to change the pause between steps, NO_COLOR to disable colors.

const hre = require("hardhat");

const TOKEN_CAP = 42000000n;
const NUM_CONFIRMATIONS_REQUIRED = 2;
const REWARD = { amount: 50n, reason: "Completed ft_transcendence" };
const GOODIE = { item: "42 hoodie", cost: 30n };
const DELAY = Number(process.env.DEMO_DELAY ?? 700);

// Colors
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = code => text => useColor ? `\x1b[${code}m${text}\x1b[0m` : String(text);
const c = {
	bold: paint("1"),
	dim: paint("2"),
	red: paint("31"),
	green: paint("32"),
	yellow: paint("33"),
	blue: paint("34"),
	magenta: paint("35"),
	cyan: paint("36"),
};

// Helpers
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const pause = (factor = 1) => sleep(DELAY * factor);
const log = (text = "") => console.log(`  ${text}`);
const visible = text => text.replace(/\x1b\[[0-9;]*m/g, "").length;
const padEnd = (text, width) => text + " ".repeat(Math.max(width - visible(text), 0));
const amount = wei => c.bold(hre.ethers.formatUnits(wei, 18).replace(/\.0$/, ""));
const tokens = wei => `${amount(wei)} ${c.yellow("A42")}`;
const units = value => hre.ethers.parseUnits(value.toString(), 18);
const approvals = (count, required) =>
	`${c.green("●".repeat(count))}${c.dim("○".repeat(required - count))} ${count}/${required}`;

let step = 0;
const TOTAL_STEPS = 6;

async function section(title) {
	step++;
	log();
	log(`${c.magenta(`[${step}/${TOTAL_STEPS}]`)} ${c.bold(title)}`);
	await pause(0.5);
}

async function send(txPromise) {
	await (await txPromise).wait();
}

async function expectRevert(txPromise) {
	try {
		await (await txPromise).wait();
	} catch (error) {
		const message = error.reason ?? error.shortMessage ?? error.message;
		const reason = message.match(/reason string '(.*)'/)?.[1] ?? message;
		return c.red(`✖ ${reason}`);
	}
	throw new Error("Expected the transaction to revert");
}

function banner() {
	const title = ` ${c.bold("Altarian42")} ${c.yellow("(A42)")} `;
	const width = visible(title);
	log();
	log(c.cyan(`╭${"─".repeat(width)}╮`));
	log(`${c.cyan("│")}${title}${c.cyan("│")}`);
	log(c.cyan(`╰${"─".repeat(width)}╯`));
}

async function main() {
	const signers = await hre.ethers.getSigners();
	if (signers.length < 5) {
		throw new Error(
			`This demo needs 5 accounts (3 staff, a student, a stranger) but the "${hre.network.name}" network has ${signers.length}. ` +
			"Run it on the local Hardhat network: npx hardhat run deployment/scripts/demo.js"
		);
	}

	const [alice, bob, carol, student, stranger] = signers;
	const names = new Map([
		[alice.address, c.blue("Alice")],
		[bob.address, c.blue("Bob")],
		[carol.address, c.blue("Carol")],
		[student.address, c.green("Student")],
		[stranger.address, c.red("Stranger")],
	]);
	const who = signer => names.get(signer.address);

	banner();
	await pause();

	// Deployment
	await section("Launch the token");
	const owners = [alice, bob, carol];
	const factory = await hre.ethers.getContractFactory("Altarian42");
	const token = await factory.deploy(owners.map(owner => owner.address), NUM_CONFIRMATIONS_REQUIRED, TOKEN_CAP);
	await token.waitForDeployment();
	log(`Staff: ${owners.map(who).join(", ")} · ${c.bold(NUM_CONFIRMATIONS_REQUIRED)} approvals per reward`);
	await pause(1.5);

	// Proposal
	await section(`${c.blue("Alice")}${c.bold(" proposes a reward")}`);
	const txIndex = await token.getTransactionCount();
	await send(token.connect(alice).submitTransaction(student.address, REWARD.amount, REWARD.reason));
	log(`${tokens(units(REWARD.amount))} → ${who(student)} for "${c.cyan(REWARD.reason)}"`);
	await pause(1.5);

	// Confirmations
	await section("The staff approve it");
	for (const owner of [alice, bob]) {
		await send(token.connect(owner).confirmTransaction(txIndex));
		const { numConfirmations } = await token.getTransaction(txIndex);
		log(`${padEnd(`${who(owner)} approves`, 16)}${approvals(Number(numConfirmations), NUM_CONFIRMATIONS_REQUIRED)}`);
		await pause();
	}
	await pause(0.5);

	// Execution
	await section("The reward is paid");
	const balanceBefore = await token.balanceOf(student.address);
	await send(token.connect(carol).executeTransaction(txIndex));
	log(`${who(student)} wallet: ${amount(balanceBefore)} → ${tokens(await token.balanceOf(student.address))}`);
	const [achievement] = await token.getStudentAchievements(student.address);
	log(`${c.yellow("★")} ${c.cyan(achievement)}`);
	await pause(1.5);

	// Shop
	await section(`The student buys a "${GOODIE.item}"`);
	const shopBalanceBefore = await token.balanceOf(student.address);
	await send(token.connect(student).buyGoodies(GOODIE.item, GOODIE.cost));
	log(`${who(student)} wallet: ${amount(shopBalanceBefore)} → ${tokens(await token.balanceOf(student.address))}`);
	log(`${tokens(units(GOODIE.cost))} ${c.red("burned")}`);
	await pause(1.5);

	// Security
	await section("Cheating is blocked");
	const attempt = async (text, txPromise) => {
		log(`${padEnd(text, 30)}${await expectRevert(txPromise)}`);
		await pause();
	};
	await attempt(`${who(stranger)} creates a reward`,
		token.connect(stranger).submitTransaction(stranger.address, 1000n, "Free tokens"));
	await attempt(`${who(alice)} pays it twice`,
		token.connect(alice).executeTransaction(txIndex));
	const loneIndex = await token.getTransactionCount();
	await send(token.connect(carol).submitTransaction(carol.address, 1000n, "Self-reward"));
	await send(token.connect(carol).confirmTransaction(loneIndex));
	await attempt(`${who(carol)} self-rewards alone`,
		token.connect(carol).executeTransaction(loneIndex));

	log();
	log(`${c.green("✔")} ${c.bold("No one can create tokens alone.")}`);
	log();
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
