// script to generate domains from ENS names (ensNames object generated via https://csvjson.com/csv2json)
// npx hardhat run scripts/partners/templates/broker/mintDomainsEns1.js --network base

const ensNames = {
  "tempetechie.eth": {},
  "tekr0x.eth": {}
}

const tldAddress = "0x4087fb91A1fBdef05761C02714335D232a2Bf3a1";
const minterAddress = "0xfc79caeac4f44e0ebad2be7f42bf134806850d9e";

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

  // loop through the ENS names
  for (const ensName in ensNames) {
    console.log("ENS name:", ensName);

    if (!ensName.endsWith(".eth")) {
      console.log("Invalid ENS name:", ensName);
      continue;
    }

    let ensHolder;

    const domainName = ensName.replace(".eth", "");

    // check if there is already domain holder for punk domainName
    const domainHolder = await tldContract.getDomainHolder(domainName);

    // if domain name not minted yet, mint it
    if (domainHolder == ethers.constants.AddressZero) {
      try {
        ensHolder = await readProvider.resolveName(ensName);
        await sleep(2000); // to avoid rate limit
      } catch (e) {
        continue;
      }
  
      console.log("Minting domain:", domainName, "for address:", ensHolder);

      try {
        if (ensHolder && ensHolder !== ethers.constants.AddressZero) {
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
      await sleep(2000);
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