const hre = require("hardhat");

async function main() {
    const address = "0x90f79bf6eb2c4f870365e785982e1f101e93b906";
    const balance = await hre.ethers.provider.getBalance(address);
    const network = await hre.ethers.provider.getNetwork();

    console.log(`Address: ${address}`);
    console.log(`Balance: ${hre.ethers.formatEther(balance)} ETH`);
    console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
