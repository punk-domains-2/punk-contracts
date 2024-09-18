// npx hardhat run scripts/partners/templates/simple-stats/deployMinter.js --network taiko
// it automatically adds minter address to the TLD contract as minter

const contractNameFactory = "MinterSimpleStats";

const distributorAddress = "0xE08033d0bDBcEbE7e619c3aE165E7957Ab577961";
const statsAddress = "0xa97c7AF10ee564EBf452A9347bB9653454Ba69C0"; // stats middleware address
const tldAddress = "0x4087fb91A1fBdef05761C02714335D232a2Bf3a1";

const paymentTokenDecimals = 18;

const price1char = ethers.utils.parseUnits("1", paymentTokenDecimals);
const price2char = ethers.utils.parseUnits("0.1", paymentTokenDecimals);
const price3char = ethers.utils.parseUnits("0.05", paymentTokenDecimals);
const price4char = ethers.utils.parseUnits("0.002", paymentTokenDecimals);
const price5char = ethers.utils.parseUnits("0.0009", paymentTokenDecimals);

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy contract
  const contract = await ethers.getContractFactory(contractNameFactory);
  const instance = await contract.deploy(
    distributorAddress, statsAddress, tldAddress,
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

  // add minter address to the Stats contract
  console.log("Adding minter address to the Stats contract...");
  const contractStats = await ethers.getContractFactory("TldStats");
  const instanceStats = await contractStats.attach(statsAddress);

  const tx2 = await instanceStats.setTldMinterAddress(instance.address);
  await tx2.wait();

  console.log("Wait a minute and then run this command to verify contract on the block explorer:");
  console.log("npx hardhat verify --network " + network.name + " " + instance.address + " " + distributorAddress + " " + statsAddress + " " + tldAddress + ' "' + price1char + '" "' + price2char + '" "' + price3char + '" "' + price4char + '" "' + price5char + '"');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });