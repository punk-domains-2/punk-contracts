// npx hardhat run scripts/partners/templates/simple/deployMinter.js --network degen
// it automatically adds minter address to the TLD contract as minter

const contractNameFactory = "MinterSimple";

const distributorAddress = "0xb29050965A5AC70ab487aa47546cdCBc97dAE45D";
const tldAddress = "0x4087fb91A1fBdef05761C02714335D232a2Bf3a1";

const paymentTokenDecimals = 18;

const price1char = ethers.utils.parseUnits("42069", paymentTokenDecimals);
const price2char = ethers.utils.parseUnits("6969", paymentTokenDecimals);
const price3char = ethers.utils.parseUnits("999", paymentTokenDecimals);
const price4char = ethers.utils.parseUnits("666", paymentTokenDecimals);
const price5char = ethers.utils.parseUnits("69", paymentTokenDecimals);

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
  console.log("Adding minter address to the TLD contract...");
  const contractTld = await ethers.getContractFactory("FlexiPunkTLD");
  const instanceTld = await contractTld.attach(tldAddress);

  await instanceTld.changeMinter(instance.address);

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