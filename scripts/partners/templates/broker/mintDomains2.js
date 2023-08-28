// script to generate domains from other domains
// npx hardhat run scripts/partners/templates/broker/mintDomains2.js --network songbird

const writeTldAddress = "<write-tld-address>";
const minterAddress = "<domain-minter-address>";
const readTldAddress = "<read-tld-address>";

const readRpcUrl = "<read-rpc-url>"; // RPC URL for the network where TLD data is read from

const startId = 1; 
const endNftId = 200; 

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Calling methods with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const tldInterface = new ethers.utils.Interface([
    "function domainIdsNames(uint256 tokenId) public view returns(string memory)",
    "function getDomainHolder(string calldata _domainName) public view returns(address)",
    "function ownerOf(uint256 tokenId) public view returns (address)"
  ]);

  const minterInterface = new ethers.utils.Interface([
    "function ownerFreeMint(string memory, address) external returns(uint256 tokenId)"
  ]);

  const writeTldContract = new ethers.Contract(writeTldAddress, tldInterface, deployer);
  const minterContract = new ethers.Contract(minterAddress, minterInterface, deployer);

  // create custom provder with ethers
  const readProvider = new ethers.providers.JsonRpcProvider(readRpcUrl); // read network provider
  const readTldContract = new ethers.Contract(readTldAddress, tldInterface, readProvider); // read TLD contract

  // MINT DOMAINS
  for (let i = startId; i <= endNftId; i++) {
    let domainName = await readTldContract.domainIdsNames(i);
    let readDomainOwner;

    // get domain holder for domainName on the write network
    let domainHolder = await writeTldContract.getDomainHolder(domainName);

    if (domainHolder != ethers.constants.AddressZero) {
      console.log("Domain already exists:", domainName);
      
      domainName = domainName + i;

      console.log("Trying to mint domain name + id:", domainName);

      domainHolder = await writeTldContract.getDomainHolder(domainName);
    }

    // if domain name not minted yet, mint it
    if (domainHolder == ethers.constants.AddressZero) {
      try {
        readDomainOwner = await readTldContract.ownerOf(i);
        await sleep(2000); // to avoid rate limit
      } catch (e) {
        continue;
      }
  
      console.log("Minting domain:", domainName, "for address:", readDomainOwner);

      try {
        if (readDomainOwner && readDomainOwner !== ethers.constants.AddressZero) {
          const tx = await minterContract.ownerFreeMint(domainName, readDomainOwner);
          await tx.wait();
        }
      } catch (e) {
        console.log("Domain already minted", e);
        continue;
      }

      console.log("Domain minted:", domainName);
    } else {
      console.log("Domain already exists:", domainName);
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