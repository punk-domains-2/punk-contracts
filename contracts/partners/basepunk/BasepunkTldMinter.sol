// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import { ReentrancyGuard } from  "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { IERC721 } from  "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { IERC20 } from  "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { OwnableWithManagers } from "../../access/OwnableWithManagers.sol";
import "../../lib/strings.sol";

interface IFlexiPunkTLD is IERC721 {
  function royaltyFeeReceiver() external view returns(address);
  function royaltyFeeUpdater() external view returns(address);

  function mint (
    string memory _domainName,
    address _domainHolder,
    address _referrer
  ) external payable returns(uint256);

}

interface ITldStats {
  function addWeiSpent(address _user, uint256 _weiSpent) external;
}

// .basepunk domain minter contract
// - no minting restrictions (anyone can mint)
// - tiered pricing
// - NFT holders get one 4+ char domain for free
// - revenue goes to the revenue distributor contract address
contract BasepunkTldMinter is OwnableWithManagers, ReentrancyGuard {
  address public distributorAddress; // revenue distributor contract address
  address public nftAddress;
  address public statsAddress;

  address[] public partnerNftAddresses; // Partner NFTs that get a discount on minting

  bool public paused = true;

  uint256 public discountBps = 5000; // Discount for partner NFTs (in bips, 5000bps = 50%)
  uint256 public referralFee = 1000; // share of each domain purchase (in bips) that goes to the referrer
  uint256 public royaltyFee = 5000; // share of each domain purchase (in bips) that goes to Punk Domains
  uint256 public constant MAX_BPS = 10_000;

  uint256 public price1char; // 1 char domain price
  uint256 public price2char; // 2 chars domain price
  uint256 public price3char; // 3 chars domain price
  uint256 public price4char; // 4 chars domain price
  uint256 public price5char; // 5 chars domain price
  uint256 public price6char; // 6+ chars domain price

  IFlexiPunkTLD public immutable tldContract;

  mapping (address => bool) public claimedFreeDomain; // NFT holder => claimed free domain

  // CONSTRUCTOR
  constructor(
    address _distributorAddress,
    address _nftAddress,
    address _tldAddress,
    address _statsAddress,
    uint256 _price1char,
    uint256 _price2char,
    uint256 _price3char,
    uint256 _price4char,
    uint256 _price5char,
    uint256 _price6char
  ) {
    distributorAddress = _distributorAddress;
    nftAddress = _nftAddress;
    tldContract = IFlexiPunkTLD(_tldAddress);
    statsAddress = _statsAddress;

    price1char = _price1char;
    price2char = _price2char;
    price3char = _price3char;
    price4char = _price4char;
    price5char = _price5char;
    price6char = _price6char;
  }

  // READ

  function canMintPartnerNft(address user_) public view returns(bool) {
    for (uint256 i = 0; i < partnerNftAddresses.length; i++) {
      if (IERC721(partnerNftAddresses[i]).balanceOf(user_) > 0) {
        return true;
      }
    }
    return false;
  }

  function hasClaimedFreeDomain(address _nftHolder) external view returns(bool) {
    return claimedFreeDomain[_nftHolder];
  }

  // WRITE

  function mint(
    string memory _domainName,
    address _domainHolder,
    address _referrer
  ) external nonReentrant payable returns(uint256 tokenId) {
    require(!paused, "Minting paused");

    // find price
    uint256 domainLength = strings.len(strings.toSlice(_domainName));
    uint256 selectedPrice;

    if (domainLength == 1) {
      selectedPrice = price1char;
    } else if (domainLength == 2) {
      selectedPrice = price2char;
    } else if (domainLength == 3) {
      selectedPrice = price3char;
    } else if (domainLength == 4) {
      selectedPrice = price4char;
    }  else if (domainLength == 5) {
      selectedPrice = price5char;
    } else {
      selectedPrice = price6char;
    }

    require(msg.value >= selectedPrice, "Value below price");

    // send royalty fee
    if (royaltyFee > 0) {
      uint256 royaltyPayment = (selectedPrice * royaltyFee) / MAX_BPS;
      (bool sentRoyaltyFee, ) = tldContract.royaltyFeeReceiver().call{value: royaltyPayment}("");
      require(sentRoyaltyFee, "Failed to send royalty fee");
    }

    // send referral fee
    if (referralFee > 0 && _referrer != address(0)) {
      uint256 referralPayment = (selectedPrice * referralFee) / MAX_BPS;
      (bool sentReferralFee, ) = _referrer.call{value: referralPayment}("");
      require(sentReferralFee, "Failed to send referral fee");
      selectedPrice = msg.value - referralPayment;
    }

    // send the rest to distributor
    (bool sent, ) = distributorAddress.call{value: address(this).balance}("");
    require(sent, "Failed to send domain payment to distributor contract");

    // mint a domain
    tokenId = tldContract.mint{value: 0}(_domainName, _domainHolder, address(0));

    // add wei spent to stats
    ITldStats(statsAddress).addWeiSpent(msg.sender, selectedPrice);
  }

  /// @notice A free 4+ char domain mint for NFT holders
  function nftFreeMint(
    string memory _domainName,
    address _domainHolder
  ) external nonReentrant returns(uint256 tokenId) {
    require(!paused, "Minting paused");
    require(IERC721(nftAddress).balanceOf(msg.sender) > 0, "Sender does not own the NFT");
    require(!claimedFreeDomain[msg.sender], "Sender already claimed free domain");

    uint256 domainLength = strings.len(strings.toSlice(_domainName));
    require(domainLength > 3, "Domain must be 4+ chars");

    claimedFreeDomain[msg.sender] = true;
    
    // mint a domain
    tokenId = tldContract.mint{value: 0}(_domainName, _domainHolder, address(0));
  }

  /// @notice A discounted domain mint for partner NFT holders
  function partnerFreeMint(
    string memory _domainName,
    address _domainHolder,
    address _referrer
  ) external nonReentrant payable returns(uint256 tokenId) {
    require(!paused, "Minting paused");

    // check if user owns partner NFT
    require(canMintPartnerNft(msg.sender), "Sender does not own a partner NFT");
    
    // find price
    uint256 domainLength = strings.len(strings.toSlice(_domainName));
    uint256 selectedPrice;

    if (domainLength == 1) {
      selectedPrice = price1char;
    } else if (domainLength == 2) {
      selectedPrice = price2char;
    } else if (domainLength == 3) {
      selectedPrice = price3char;
    } else if (domainLength == 4) {
      selectedPrice = price4char;
    }  else if (domainLength == 5) {
      selectedPrice = price5char;
    } else {
      selectedPrice = price6char;
    }

    // apply discount
    selectedPrice = (selectedPrice * (MAX_BPS - discountBps)) / MAX_BPS;

    require(msg.value >= selectedPrice, "Value below price");

    // send royalty fee
    if (royaltyFee > 0) {
      uint256 royaltyPayment = (selectedPrice * royaltyFee) / MAX_BPS;
      (bool sentRoyaltyFee, ) = tldContract.royaltyFeeReceiver().call{value: royaltyPayment}("");
      require(sentRoyaltyFee, "Failed to send royalty fee");
    }

    // send referral fee
    if (referralFee > 0 && _referrer != address(0)) {
      uint256 referralPayment = (selectedPrice * referralFee) / MAX_BPS;
      (bool sentReferralFee, ) = _referrer.call{value: referralPayment}("");
      require(sentReferralFee, "Failed to send referral fee");
      selectedPrice = msg.value - referralPayment;
    }

    // send the rest to distributor
    (bool sent, ) = distributorAddress.call{value: address(this).balance}("");
    require(sent, "Failed to send domain payment to distributor contract");

    // mint a domain
    tokenId = tldContract.mint{value: 0}(_domainName, _domainHolder, address(0));

    // add wei spent to stats
    ITldStats(statsAddress).addWeiSpent(msg.sender, selectedPrice);
  }

  // OWNER

  function addPartnerNftAddress(address _partnerNftAddress) external onlyManagerOrOwner {
    partnerNftAddresses.push(_partnerNftAddress);
  }

  /// @notice This changes price in the minter contract
  function changePrice(uint256 _price, uint256 _chars) external onlyManagerOrOwner {
    require(_price > 0, "Cannot be zero");

    if (_chars == 1) {
      price1char = _price;
    } else if (_chars == 2) {
      price2char = _price;
    } else if (_chars == 3) {
      price3char = _price;
    } else if (_chars == 4) {
      price4char = _price;
    } else if (_chars == 5) {
      price5char = _price;
    } else if (_chars == 6) {
      price6char = _price;
    }
  }

  function changePartnerDiscount(uint256 _discountBps) external onlyManagerOrOwner {
    require(_discountBps < MAX_BPS, "Cannot exceed 100%");
    discountBps = _discountBps;
  }

  /// @notice This changes referral fee in the minter contract
  function changeReferralFee(uint256 _referralFee) external onlyManagerOrOwner {
    require(_referralFee <= 2000, "Cannot exceed 20%");
    referralFee = _referralFee;
  }

  function ownerFreeMint(
    string memory _domainName,
    address _domainHolder
  ) external nonReentrant onlyManagerOrOwner returns(uint256 tokenId) {
    // mint a domain
    tokenId = tldContract.mint{value: 0}(_domainName, _domainHolder, address(0));
  }

  /// @notice Recover any ERC-20 token mistakenly sent to this contract address
  function recoverERC20(address tokenAddress_, uint256 tokenAmount_, address recipient_) external onlyManagerOrOwner {
    IERC20(tokenAddress_).transfer(recipient_, tokenAmount_);
  }

  /// @notice Recover any ERC-721 token mistakenly sent to this contract address
  function recoverERC721(address tokenAddress_, uint256 tokenId_, address recipient_) external onlyManagerOrOwner {
    IERC721(tokenAddress_).transferFrom(address(this), recipient_, tokenId_);
  }

  function removePartnerNftAddress(address _partnerNftAddress) external onlyManagerOrOwner {
    for (uint256 i = 0; i < partnerNftAddresses.length; i++) {
      if (partnerNftAddresses[i] == _partnerNftAddress) {
        partnerNftAddresses[i] = partnerNftAddresses[partnerNftAddresses.length - 1];
        partnerNftAddresses.pop();
        break;
      }
    }
  }

  /// @notice This changes the distributor address in the minter contract
  function setDistributorAddress(address _distributorAddress) external onlyManagerOrOwner {
    distributorAddress = _distributorAddress;
  }

  /// @notice This changes the TLD Stats address in the minter contract
  function setStatsAddress(address _statsAddress) external onlyManagerOrOwner {
    statsAddress = _statsAddress;
  }

  function togglePaused() external onlyManagerOrOwner {
    paused = !paused;
  }

  // withdraw ETH from contract
  function withdraw() external onlyManagerOrOwner {
    (bool success, ) = owner().call{value: address(this).balance}("");
    require(success, "Failed to withdraw ETH from contract");
  }

  // OTHER WRITE METHODS

  /// @notice This changes royalty fee in the minter contract
  function changeRoyaltyFee(uint256 _royaltyFee) external {
    require(_royaltyFee <= 6000, "Cannot exceed 60%");
    require(msg.sender == tldContract.royaltyFeeUpdater(), "Sender is not Royalty Fee Updater");
    royaltyFee = _royaltyFee;
  }

  // RECEIVE & FALLBACK
  receive() external payable {}
  fallback() external payable {}
 
}