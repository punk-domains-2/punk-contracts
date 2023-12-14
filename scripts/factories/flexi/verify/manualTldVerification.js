// Run: npx hardhat run scripts/factories/flexi/verify/manualTldVerification.js --network taikoJolnir

const networkName = "taikoJolnir";
const tldAddress = "0x4087fb91A1fBdef05761C02714335D232a2Bf3a1";

async function main() {
  console.log("Copy the line below and paste it in your terminal to verify the TLD contract on Etherscan:");
  console.log("");
  console.log("npx hardhat verify --network " + networkName + " --constructor-args scripts/factories/flexi/verify/arguments.js " + tldAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });