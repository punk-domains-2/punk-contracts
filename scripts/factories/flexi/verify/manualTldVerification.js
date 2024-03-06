// Run: npx hardhat run scripts/factories/flexi/verify/manualTldVerification.js --network satoshivmTestnet

const networkName = "satoshivmTestnet";
const tldAddress = "0xbdacf94ddcab51c39c2dd50bffee60bb8021949a";

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