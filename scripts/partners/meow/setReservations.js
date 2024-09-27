// Get reserved names from testnet TLD contract and store them in the reservations contract on mainnet
// npx hardhat run scripts/partners/meow/setReservations.js --network superpositionTestnet

const reservationsAddress = "0x884e36636D5F26C55BFCb67e17E9bA809C3F02A8";

const testnetTldAddress = "0xe0789b1AEA5a53673aDD3822Cb8bFEB5c48D8F71";
const testnetRpcUrl = "https://testnet-rpc.superposition.so/";

const startTokenId = 100;
const endTokenId = 300;
const batchSize = 60;

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Running script with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // create testnet TLD contract instance
  const testnetTldInterface = new ethers.utils.Interface([
    "function domainIdsNames(uint256 tokenId) public view returns(string)",
    "function getDomainHolder(string calldata _domainName) public view returns(address)"
  ]);
  const testnetProvider = new ethers.providers.JsonRpcProvider(testnetRpcUrl);
  const testnetTldContract = new ethers.Contract(testnetTldAddress, testnetTldInterface, testnetProvider);

  const reservationsContract = await ethers.getContractAt("MeowReservations", reservationsAddress);

  const names = [];
  const holders = [];

  for (let tokenId = startTokenId; tokenId <= endTokenId; tokenId++) {
    sleep(1000);
    console.log(`Processing tokenId ${tokenId}...`);

    let domainName;
    let holder;

    try {
      domainName = await testnetTldContract.domainIdsNames(tokenId);
      holder = await testnetTldContract.getDomainHolder(domainName);
    } catch (error) {
      console.error(`Error processing tokenId ${tokenId}:`, error);
      continue;
    }

    console.log(`Domain name: ${domainName}`);
    console.log(`Holder: ${holder}`);

    if (holder !== ethers.constants.AddressZero) {
      // check if name is already reserved
      const resHolder = await reservationsContract.getResNameAddress(domainName);
      if (resHolder !== ethers.constants.AddressZero) {
        console.log(`Domain name ${domainName} is already reserved.`);
        continue;
      }

      names.push(domainName);
      holders.push(holder);

      // Check if we have batchSize names, then call setResNames and reset arrays
      if (names.length === batchSize) {
        console.log(`Setting reservations for ${names.length} names...`);

        try {
          const resTx = await reservationsContract.setResNames(names, holders);
          const resReceipt = await resTx.wait();

          if (resReceipt.status === 1) {
            console.log("Reservations set successfully.");
          } else {
            console.error("Failed to set reservations.");
            break;
          }
        } catch (error) {
          console.error(`Error setting reservations for names at tokenId ${tokenId}:`, error);
          console.log(`names first: ${names[0]}`);
          console.log(`names last: ${names[names.length - 1]}`);
          console.log(`holders first: ${holders[0]}`);
          console.log(`holders last: ${holders[holders.length - 1]}`);
          break;
        }

        names.length = 0;
        holders.length = 0;
      }
    }
    
  }

  // Handle any remaining names after the loop
  if (names.length > 0) {
    console.log(`Setting reservations for REMAINING ${names.length} names...`);
    try {
      const resTx = await reservationsContract.setResNames(names, holders);
      const resReceipt = await resTx.wait();

      if (resReceipt.status === 1) {
        console.log("REMAINING reservations set successfully.");
      } else {
        console.error("Failed to set REMAINING reservations.");
      }
    } catch (error) {
      console.error(`Error setting REMAINING reservations:`, error);
      console.log(`names first: ${names[0]}`);
      console.log(`names last: ${names[names.length - 1]}`);
      console.log(`holders first: ${holders[0]}`);
      console.log(`holders last: ${holders[holders.length - 1]}`);
    }
  }

  console.log("All reservations have been set.");
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });