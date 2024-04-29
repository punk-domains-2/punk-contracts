// script to generate domains from ENS names (of user addresses from the CSV file)
// npx hardhat run scripts/partners/templates/broker/mintDomainsEns2.js --network degen
const fs = require("fs");
const path = require("path");

const csvFilePath = path.join(__dirname, "holder-addresses.csv");
const csv = fs.readFileSync(csvFilePath, "utf-8");

const startLine = 0; // first line is 0
const endLine = 50;

const addresses = csv.split("\n").map((line) => line.trim()).filter((line, index) => index >= startLine && index <= endLine);

const tldAddress = ""; // TODO: add TLD contract address
const minterAddress = ""; // TODO: add minter contract address

const readRpcUrl = "https://rpc.ankr.com/eth"; // Ethereum RPC URL

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Calling methods with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const tldInterface = new ethers.utils.Interface([
    "function getDomainHolder(string calldata _domainName) public view returns(address)"
  ]);

  const minterInterface = new ethers.utils.Interface([
    "function ownerFreeMint(string memory, address) external returns(uint256 tokenId)"
  ]);

  const tldContract = new ethers.Contract(tldAddress, tldInterface, deployer);
  const minterContract = new ethers.Contract(minterAddress, minterInterface, deployer);

  const readProvider = new ethers.providers.JsonRpcProvider(readRpcUrl); // read network provider

  for (const addr of addresses) {
    sleep(2000); // to avoid rate limit

    console.log("Address:", addr);

    // check if this address owns ENS name
    let ensName = await readProvider.lookupAddress(addr);
    console.log("ENS name:", ensName);

    if (!ensName) {
      console.log("No ENS name found for address:", addr);
      continue;
    }

    const ensHolder = addr;
    const domainName = ensName.replace(".eth", "");

    if (domainName.includes(".")) {
      console.log("Invalid domain name:", domainName);
      continue;
    }

    // check if there is already domain holder for punk domainName
    const domainHolder = await tldContract.getDomainHolder(domainName);

    // if domain name not minted yet, mint it
    if (domainHolder == ethers.constants.AddressZero) {
      console.log("Minting domain:", domainName, "for address:", ensHolder);

      try {
        if (ensHolder && ensHolder !== ethers.constants.AddressZero) {
          sleep(1000); // to avoid rate limit
          const tx = await minterContract.ownerFreeMint(domainName, ensHolder);
          await tx.wait();
        }
      } catch (e) {
        console.log("Domain already minted", e);
        continue;
      }

      console.log("Domain minted:", domainName);
    } else {
      console.log("Domain already minted:", domainName);
    }
  }
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