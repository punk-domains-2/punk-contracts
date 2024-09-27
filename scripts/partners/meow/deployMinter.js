// npx hardhat run scripts/partners/meow/deployMinter.js --network superposition
// it automatically adds minter address to the TLD contract as minter

const contractNameFactory = "MeowMinter";

const distributorAddress = "0x98a37848dc2D0F07dE151Da3b3b92541563E1791";
const reservationsAddress = "0x1B03D6ecd88bE3B19aBe7c76a30636689cad9Bf8";
const tldAddress = "0x4087fb91A1fBdef05761C02714335D232a2Bf3a1";

const paymentTokenDecimals = 18;

const price1char = ethers.utils.parseUnits("10", paymentTokenDecimals);
const price2char = ethers.utils.parseUnits("1", paymentTokenDecimals);
const price3char = ethers.utils.parseUnits("0.1", paymentTokenDecimals);
const price4char = ethers.utils.parseUnits("0.01", paymentTokenDecimals);
const price5char = ethers.utils.parseUnits("0.0019", paymentTokenDecimals);

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy contract
  const contract = await ethers.getContractFactory(contractNameFactory);
  const instance = await contract.deploy(
    distributorAddress, reservationsAddress, tldAddress,
    price1char, price2char, price3char, price4char, price5char
  );

  await instance.deployed();

  console.log("Contract address:", instance.address);

  // add minter address to the TLD contract
  console.log("Adding minter address to the TLD contract...");
  const contractTld = await ethers.getContractFactory("FlexiPunkTLD");
  const instanceTld = await contractTld.attach(tldAddress);

  await instanceTld.changeMinter(instance.address);

  console.log("Done!");

  console.log("Wait a minute and then run this command to verify contract on the block explorer:");
  console.log("npx hardhat verify --network " + network.name + " " + instance.address + " " + distributorAddress + " " + reservationsAddress + " " + tldAddress + ' "' + price1char + '" "' + price2char + '" "' + price3char + '" "' + price4char + '" "' + price5char + '"');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });