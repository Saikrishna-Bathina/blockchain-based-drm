const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    const network = await hre.ethers.provider.getNetwork();

    console.log("Network:", network.name);
    console.log("Deployer Address:", deployer.address);
    console.log("Balance:", hre.ethers.formatEther(balance), "ETH");

    if (balance === 0n) {
        console.log("\nWARNING: Your balance is 0. You need Sepolia ETH to deploy.");
        console.log("Go to a faucet like https://sepoliafaucet.com/ or https://faucet.quicknode.com/drip");
    } else {
        console.log("\nYou have enough balance to attempt deployment!");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
