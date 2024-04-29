// Run: npx hardhat run scripts/factories/flexi/verify/manualTldVerification.js --network sepolia

const tldAddress = "0x1DD820F4f48eBC2B8e7F666F34fbC5820808074e";

async function main() {
  console.log("Copy the line below and paste it in your terminal to verify the TLD contract on Etherscan:");
  console.log("");
  console.log("npx hardhat verify --network " + network.name + " --constructor-args scripts/factories/flexi/verify/arguments.js " + tldAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });