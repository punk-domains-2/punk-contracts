// Deploy factory contract only (ForbiddenTlds and FlexiPunkMetadata need to be already deployed)
// after deployment, factory address will be automatically added to the ForbiddenTlds whitelist and to the Resolver
// if not, do it manually
// npx hardhat run scripts/factories/flexi/3_deployFactoryOnly.js --network holesky

async function main() {
  const contractNameFactory = "FlexiPunkTLDFactory";
  const metaAddress = "0x2f5cd4366c16AFC3b04A4b2327BbFf9e3955dbC1";
  const forbAddress = "0xbbA4dB63DA448C124ee38EeC636b697CA9bdf9e1";
  const resolverAddress = "0x2919f0bE09549814ADF72fb0387D1981699fc6D4"; // IMPORTANT: this script is made for non-upgradable Resolver. If you're using upgradable Resolver, you need to modify this script below (find: PunkResolverNonUpgradable line)

  let tldPrice = "45"; // default price in ETH

  // mainnet prices
  if (network.config.chainId === 255) {
    tldPrice = "40"; // ETH
  } else if (network.config.chainId === 137) {
    tldPrice = "80000"; // MATIC
  } else if (network.config.chainId === 100) {
    tldPrice = "75000"; // XDAI
  } else if (network.config.chainId === 56) {
    tldPrice = "250"; // BNB
  } else if (network.config.chainId === 19) {
    tldPrice = "2000000"; // SGB
  } else if (network.config.chainId === 250) {
    tldPrice = "270000"; // FTM
  }

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy contract1
  const contractFactory = await ethers.getContractFactory(contractNameFactory);

  const tldPriceWei = ethers.utils.parseUnits(tldPrice, "ether");
  const instanceFactory = await contractFactory.deploy(tldPriceWei, forbAddress, metaAddress);
  await instanceFactory.deployed();

  console.log("Factory contract deployed to:", instanceFactory.address);

  console.log("Adding factory contract to the ForbiddenTlds whitelist");

  // add factory address to the ForbiddenTlds whitelist
  const contractForbiddenTlds = await ethers.getContractFactory("PunkForbiddenTlds");
  const instanceForbiddenTlds = await contractForbiddenTlds.attach(forbAddress);

  await instanceForbiddenTlds.addFactoryAddress(instanceFactory.address);

  console.log("Done!");

  console.log("Adding factory contract to the Resolver");

  // add factory address to the Resolver
  const contractResolver = await ethers.getContractFactory("PunkResolverNonUpgradable");
  const instanceResolver = await contractResolver.attach(resolverAddress);

  await instanceResolver.addFactoryAddress(instanceFactory.address);

  console.log("Done!");

  console.log("Wait a minute and then run this command to verify contracts on Etherscan:");
  console.log("npx hardhat verify --network " + network.name + " " + instanceFactory.address + ' "' + tldPriceWei + '" ' + forbAddress + ' ' + metaAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });