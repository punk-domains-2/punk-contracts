// script to generate domains from NFT IDs
// NFT contract is on the SAME network as the TLD contract
// npx hardhat run scripts/partners/templates/broker/mintDomains1.js --network songbird

const tldAddress = "<tld-address>";
const minterAddress = "<domain-minter-address>";
const nftAddress = "<nft-collection-address>";

const startNftId = 1;
const endNftId = 500; 

const namePrefix = "<domain-name-prefix>";

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

  const nftInterface = new ethers.utils.Interface([
    "function ownerOf(uint256 tokenId) public view returns (address)"
  ]);

  const tldContract = new ethers.Contract(tldAddress, tldInterface, deployer);
  const minterContract = new ethers.Contract(minterAddress, minterInterface, deployer);
  const nftContract = new ethers.Contract(nftAddress, nftInterface, deployer);

  // MINT DOMAINS
  for (let i = startNftId; i <= endNftId; i++) {
    const domainName = namePrefix + i;
    let nftOwner;

    // get domain holder for domainName
    const domainHolder = await tldContract.getDomainHolder(domainName);

    // if domain name not minted yet, mint it
    if (domainHolder == ethers.constants.AddressZero) {
      try {
        nftOwner = await nftContract.ownerOf(i);
        await sleep(2000); // to avoid rate limit
      } catch (e) {
        continue;
      }
  
      console.log("Minting domain:", domainName, "for address:", nftOwner);

      try {
        if (nftOwner && nftOwner !== ethers.constants.AddressZero) {
          const tx = await minterContract.ownerFreeMint(domainName, nftOwner);
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