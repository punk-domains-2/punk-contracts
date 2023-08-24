// npx hardhat run scripts/partners/basebook/deployMinter.js --network base
// it automatically adds minter address to the TLD contract as minter

const contractNameFactory = "BasebookMinter";

const brokerAddress = "0xb29050965a5ac70ab487aa47546cdcbc97dae45d";
const tldAddress = "0x4087fb91A1fBdef05761C02714335D232a2Bf3a1";

const referralFee = 1000;
const royaltyFee = 0;
const brokerFee = 0;

const paymentTokenDecimals = 18;

const price1char = ethers.utils.parseUnits("1.337", paymentTokenDecimals);
const price2char = ethers.utils.parseUnits("0.420", paymentTokenDecimals);
const price3char = ethers.utils.parseUnits("0.069", paymentTokenDecimals);
const price4char = ethers.utils.parseUnits("0.008", paymentTokenDecimals);
const price5char = ethers.utils.parseUnits("0.004", paymentTokenDecimals);

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy contract
  const contract = await ethers.getContractFactory(contractNameFactory);
  const instance = await contract.deploy(
    brokerAddress, tldAddress,
    referralFee, royaltyFee, brokerFee, 
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
  console.log("npx hardhat verify --network " + network.name + " " + instance.address + " " + brokerAddress + " " + tldAddress + ' "' + referralFee + '" "' + royaltyFee + '" "' + brokerFee + '" "' + price1char + '" "' + price2char + '" "' + price3char + '" "' + price4char + '" "' + price5char + '"');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });