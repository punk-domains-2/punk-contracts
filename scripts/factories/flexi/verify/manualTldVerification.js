// Run: npx hardhat run scripts/factories/flexi/verify/manualTldVerification.js --network linea

const networkName = "linea";
const tldAddress = "0x6c66f1d5684630fb69350a7a88bcca60629d7252";

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