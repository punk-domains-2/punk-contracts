// Run: npx hardhat run scripts/factories/flexi/verify/manualTldVerification.js --network songbird

const networkName = "songbird";
const tldAddress = "0xBDACF94dDCAB51c39c2dD50BffEe60Bb8021949a";

async function main() {
  console.log("npx hardhat verify --network " + networkName + " --constructor-args scripts/factories/flexi/verify/arguments.js " + tldAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });