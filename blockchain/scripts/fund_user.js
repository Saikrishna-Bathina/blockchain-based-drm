const hre = require("hardhat");

async function main() {
    const [owner] = await hre.ethers.getSigners();
    const recipient = "0xf4AEc57927278fF011081ea166fC38DAA4FDeAb8";
    const amount = hre.ethers.parseEther("100.0"); // 100 ETH

    console.log(`Sending ${hre.ethers.formatEther(amount)} ETH from ${owner.address} to ${recipient}...`);

    const tx = await owner.sendTransaction({
        to: recipient,
        value: amount,
    });

    await tx.wait();

    console.log(`Transferred! Transaction hash: ${tx.hash}`);

    const balance = await hre.ethers.provider.getBalance(recipient);
    console.log(`New balance of ${recipient}: ${hre.ethers.formatEther(balance)} ETH`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
