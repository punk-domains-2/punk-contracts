// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import "../../interfaces/IPunkTLD.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SmolPunkDomains is Ownable, ReentrancyGuard {
  address[] public supportedNfts; // whitelisted Smolverse NFT addresses
  bool public paused = true;

  // a mapping that shows which NFT IDs have already minted a .smol domain; (NFT address => (tokenID => true/false))
  mapping (address => mapping (uint256 => bool)) public minted;

  uint256 public price; // domain price in $MAGIC
  uint256 public royaltyFee = 2_000; // share of each domain purchase (in bips) that goes to Punk Domains
  uint256 public referralFee = 1_000; // share of each domain purchase (in bips) that goes to the referrer
  uint256 public constant MAX_BPS = 10_000;

  // $MAGIC contract
  IERC20 public immutable magic;

  // TLD contract
  IPunkTLD public immutable tldContract; // .smol TLD contract

  // EVENTS
  event PriceChanged(address indexed user, uint256 price_);
  event ReferralChanged(address indexed user, uint256 referral_);
  event RoyaltyChanged(address indexed user, uint256 royalty_);

  // CONSTRUCTOR
  constructor(
    address _nftAddress, // the first whitelisted NFT address
    address _tldAddress,
    address _magicAddress,
    uint256 _price
  ) {
    supportedNfts.push(_nftAddress);
    tldContract = IPunkTLD(_tldAddress);
    magic = IERC20(_magicAddress);
    price = _price;
  }

  // READ

  /// @notice Returns true or false if address is eligible to mint a .smol domain
  function canUserMint(address _user) public view returns(bool canMint) {
    IERC721Enumerable nftContract;
    for (uint256 i = 0; i < supportedNfts.length && !canMint; i++) {
      nftContract = IERC721Enumerable(supportedNfts[i]);

      for (uint256 j = 0; j < nftContract.balanceOf(_user) && !canMint; j++) {
        canMint = !minted[supportedNfts[i]][nftContract.tokenOfOwnerByIndex(_user, j)];
      }
    }

    return canMint;
  }

  function getSupportedNftsArrayLength() public view returns(uint) {
    return supportedNfts.length;
  }

  function getSupportedNftsArray() public view returns(address[] memory) {
    return supportedNfts;
  }

  function isNftIdAlreadyUsed(address _nftAddress, uint256 _nftTokenId) public view returns(bool used) {
    return minted[_nftAddress][_nftTokenId]; 
  }

  // WRITE

  /// @notice A $MAGIC approval transaction is needed to be made before minting
  function mint(
    string memory _domainName,
    address _domainHolder,
    address _referrer
  ) external payable nonReentrant returns(uint256) {
    require(!paused || msg.sender == owner(), "Minting paused");
    
    bool canMint = false;

    // loop through NFT contracts and see if user holds any NFT
    IERC721Enumerable nftContract;
    for (uint256 i = 0; i < supportedNfts.length && !canMint; i++) {
      nftContract = IERC721Enumerable(supportedNfts[i]);

      // if user has NFTs, loop through them and see if any has not been used yet
      for (uint256 j = 0; j < nftContract.balanceOf(msg.sender) && !canMint; j++) {
        if (!minted[supportedNfts[i]][nftContract.tokenOfOwnerByIndex(msg.sender, j)]) {
          // if NFT has not been used yet, mark it as used and allow minting a new domain
          minted[supportedNfts[i]][nftContract.tokenOfOwnerByIndex(msg.sender, j)] = true;
          canMint = true;
        }
      }
    }

    require(canMint, "User cannot mint a domain");

    // send royalty fee
    uint256 royaltyPayment = (price * royaltyFee) / MAX_BPS;
    uint256 ownerPayment = price - royaltyPayment;
    magic.transferFrom(msg.sender, tldContract.getFactoryOwner(), royaltyPayment);

    // send referral fee
    if (referralFee > 0 && _referrer != address(0)) {
      uint256 referralPayment = (price * referralFee) / MAX_BPS;
      ownerPayment -= referralPayment;
      magic.transferFrom(msg.sender, _referrer, referralPayment);
    }

    // send the rest to the owner
    magic.transferFrom(msg.sender, owner(), ownerPayment);

    return tldContract.mint{value: 0}(_domainName, _domainHolder, address(0));
  }

  // OWNER

  /// @notice Owner can whitelist an NFT address
  function addWhitelistedNftContract(address _nftAddress) external onlyOwner {
    supportedNfts.push(_nftAddress);
  }

  function changeMaxDomainNameLength(uint256 _maxLength) external onlyOwner {
    require(_maxLength > 0, "Cannot be zero");
    tldContract.changeNameMaxLength(_maxLength);
  }

  function changeTldDescription(string calldata _description) external onlyOwner {
    tldContract.changeDescription(_description);
  }

  /// @notice This changes price in the wrapper contract
  function changePrice(uint256 _price) external onlyOwner {
    price = _price;
    emit PriceChanged(msg.sender, _price);
  }

  /// @notice This changes referral fee in the wrapper contract
  function changeReferralFee(uint256 _referral) external onlyOwner {
    require(_referral <= 2000, "Cannot exceed 20%");
    referralFee = _referral;
    emit ReferralChanged(msg.sender, _referral);
  }

  /// @notice Owner can mint a domain without holding/using an NFT
  function ownerMintDomain(
    string memory _domainName,
    address _domainHolder
  ) external payable nonReentrant onlyOwner returns(uint256) {
    return tldContract.mint{value: 0}(_domainName, _domainHolder, address(0));
  }

  // recover tokens
  function recoverERC20(address tokenAddress_, uint256 tokenAmount_, address recipient_) external onlyOwner {
    IERC20(tokenAddress_).transfer(recipient_, tokenAmount_);
  }

  function recoverERC721(address tokenAddress_, uint256 tokenId_, address recipient_) external onlyOwner {
    IERC721Enumerable(tokenAddress_).transferFrom(address(this), recipient_, tokenId_);
  }

  /// @notice Owner can remove whitelisted NFT address
  function removeWhitelistedNftContract(uint _nftIndex) external onlyOwner {
    supportedNfts[_nftIndex] = supportedNfts[supportedNfts.length - 1];
    supportedNfts.pop();
  }

  function transferTldOwnership(address _newTldOwner) external onlyOwner {
    tldContract.transferOwnership(_newTldOwner);
  }

  function togglePaused() external onlyOwner {
    paused = !paused;
  }

  // withdraw ETH from contract
  function withdraw() external onlyOwner {
    (bool success, ) = owner().call{value: address(this).balance}("");
    require(success, "Failed to withdraw ETH from contract");
  }

  // FACTORY OWNER

  /// @notice This changes royalty fee in the wrapper contract (cannot exceed 2000 bps or 20%)
  function changeRoyaltyFee(uint256 _royalty) external {
    require(_royalty <= 2000, "Cannot exceed 20%");
    require(msg.sender == tldContract.getFactoryOwner(), "Wrapper: Caller is not Factory owner");
    royaltyFee = _royalty;
    emit RoyaltyChanged(msg.sender, _royalty);
  }

  // RECEIVE & FALLBACK
  receive() external payable {}
  fallback() external payable {}
}