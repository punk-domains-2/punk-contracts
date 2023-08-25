// npx hardhat run scripts/partners/astral/mintDomains1.js --network songbird

const domainsAirdrop = require('./domains_airdrop.json');

const tldAddress = "0xBDACF94dDCAB51c39c2dD50BffEe60Bb8021949a";
const minterAddress = "0xcE6BFf80F9f79f9d471b365F527c36592C2c15E5";
const start = 70; // start from this index

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

  // MINT DOMAINS
  for (let i = start; i < domainsAirdrop.length; i++) {
    const domainName = String(domainsAirdrop[i].domain).split(".")[0].trim().toLowerCase();

    const nftOwner = domainsAirdrop[i].address;

    // get domain holder for domainName
    const domainHolder = await tldContract.getDomainHolder(domainName);
    await sleep(2000); // to avoid rate limit

    // if domain name not minted yet, mint it
    if (domainHolder == ethers.constants.AddressZero) {
      console.log("Minting domain:", domainName, "for address:", nftOwner);

      try {
        if (nftOwner && nftOwner !== ethers.constants.AddressZero) {
          const tx = await minterContract.ownerFreeMint(domainName, nftOwner);
          await tx.wait();
          await sleep(1000); // to avoid rate limit
        }
      } catch (e) {
        console.log("Domain already minted", e);
        await sleep(2000); // to avoid rate limit
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