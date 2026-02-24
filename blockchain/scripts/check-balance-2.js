const hre = require("hardhat");

async function main() {
    const address = "0xbda5747bfd65f08dab54cb465ab97d405b1b1a7e";
    const balance = await hre.ethers.provider.getBalance(address);
    console.log(`Address: ${address}`);
    console.log(`Balance: ${hre.ethers.formatEther(balance)} ETH`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
