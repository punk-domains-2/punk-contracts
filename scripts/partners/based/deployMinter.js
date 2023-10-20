// npx hardhat run scripts/partners/based/deployMinter.js --network base
// it automatically adds minter address to the TLD contract as minter

const contractNameFactory = "BasedTldMinter";

const distributorAddress = "0x368429C493CA2Bf94d8F945c0A916e59b48Ad17C"; // https://distributor.iggy.social/ 
const tldAddress = "0x273dB54929d8392c1997Be361Da89D41af202a49";
const sbtAddress = "0xAeb0c50A48c8355Ce46Ab696c02b9cdE2F30F1e3";
const statsAddress = "0x18de8635325047cAe90bCa6601E94971C4200CC4";

const paymentTokenDecimals = 18;

const price1char = ethers.utils.parseUnits("1", paymentTokenDecimals);
const price2char = ethers.utils.parseUnits("0.1", paymentTokenDecimals);
const price3char = ethers.utils.parseUnits("0.03", paymentTokenDecimals);
const price4char = ethers.utils.parseUnits("0.008", paymentTokenDecimals);
const price5char = ethers.utils.parseUnits("0.002", paymentTokenDecimals);
const price6char = ethers.utils.parseUnits("0.0005", paymentTokenDecimals);

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy contract
  const contract = await ethers.getContractFactory(contractNameFactory);
  const instance = await contract.deploy(
    distributorAddress, sbtAddress, tldAddress, statsAddress, 
    price1char, price2char, price3char, price4char, price5char, price6char
  );

  await instance.deployed();

  console.log("Contract address:", instance.address);

  // add minter address to the TLD contract
  console.log("Adding minter address to the TLD contract...");
  const contractTld = await ethers.getContractFactory("FlexiPunkTLD");
  const instanceTld = await contractTld.attach(tldAddress);

  const tx1 = await instanceTld.changeMinter(instance.address);
  await tx1.wait();

  console.log("Done!");

  // add minter address to the Stats contract
  console.log("Adding minter address to the Stats contract...");
  const contractStats = await ethers.getContractFactory("TldStats");
  const instanceStats = await contractStats.attach(statsAddress);

  const tx2 = await instanceStats.setTldMinterAddress(instance.address);
  await tx2.wait();

  console.log("Wait a minute and then run this command to verify contract on the block explorer:");
  console.log("npx hardhat verify --network " + network.name + " " + instance.address + " " + distributorAddress + " " + sbtAddress + " " + tldAddress + " " + statsAddress + ' "' + price1char + '" "' + price2char + '" "' + price3char + '" "' + price4char + '" "' + price5char + '" "' + price6char + '"');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });