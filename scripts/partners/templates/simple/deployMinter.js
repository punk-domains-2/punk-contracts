// npx hardhat run scripts/partners/templates/simple/deployMinter.js --network flare
// it automatically adds minter address to the TLD contract as minter

const contractNameFactory = "MinterSimple";

const distributorAddress = "0xFbaf1D1fBC5a2Fe2e48858a8A4585d5e7C12fc4A";
const tldAddress = "0xBDACF94dDCAB51c39c2dD50BffEe60Bb8021949a";

const paymentTokenDecimals = 18;

const price1char = ethers.utils.parseUnits("19999", paymentTokenDecimals);
const price2char = ethers.utils.parseUnits("9999", paymentTokenDecimals);
const price3char = ethers.utils.parseUnits("3999", paymentTokenDecimals);
const price4char = ethers.utils.parseUnits("599", paymentTokenDecimals);
const price5char = ethers.utils.parseUnits("299", paymentTokenDecimals);

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy contract
  const contract = await ethers.getContractFactory(contractNameFactory);
  const instance = await contract.deploy(
    distributorAddress, tldAddress,
    price1char, price2char, price3char, price4char, price5char
  );

  await instance.deployed();

  console.log("Contract address:", instance.address);

  // add minter address to the TLD contract
  /*
  console.log("Adding minter address to the TLD contract...");
  const contractTld = await ethers.getContractFactory("FlexiPunkTLD");
  const instanceTld = await contractTld.attach(tldAddress);

  await instanceTld.changeMinter(instance.address);
  */

  console.log("Done!");

  console.log("Wait a minute and then run this command to verify contract on the block explorer:");
  console.log("npx hardhat verify --network " + network.name + " " + instance.address + " " + distributorAddress + " " + tldAddress + ' "' + price1char + '" "' + price2char + '" "' + price3char + '" "' + price4char + '" "' + price5char + '"');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });