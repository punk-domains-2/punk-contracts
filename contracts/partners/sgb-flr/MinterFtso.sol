// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import { OwnableWithManagers } from "../../access/OwnableWithManagers.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../lib/strings.sol";

interface IFlexiPunkTLD is IERC721 {

  function owner() external view returns(address);

  function mint(
    string memory _domainName,
    address _domainHolder,
    address _referrer
  ) external payable returns(uint256);

}

interface IContractRegistry {
  function getContractAddressByName(string memory contractName) external view returns(address);
}

interface IFtsoRegistry {
  function getCurrentPriceWithDecimals(string memory _symbol) external view returns(uint256 _price, uint256 _timestamp, uint256 _assetPriceUsdDecimals);
}

/// @title domain minter contract that uses FTSO to get prices
contract MinterFtso is OwnableWithManagers, ReentrancyGuard {
  address public distributorAddress;
  address public contractRegistry = 0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019;

  bool public paused = false;

  string public ftsoRegistryName = "FtsoRegistry";
  string public nativeCoinTicker;

  uint256 public referralFee = 1_000; // share of each domain purchase (in bips) that goes to the referrer
  uint256 public constant MAX_BPS = 10_000;

  uint256 public price1charUsd; // 1 char domain price
  uint256 public price2charUsd; // 2 chars domain price
  uint256 public price3charUsd; // 3 chars domain price
  uint256 public price4charUsd; // 4 chars domain price
  uint256 public price5charUsd; // 5+ chars domain price

  IFlexiPunkTLD public immutable tldContract;

  // CONSTRUCTOR
  constructor(
    address _distributorAddress,
    address _tldAddress,
    string memory _nativeCoinTicker,
    uint256 _price1charUsd,
    uint256 _price2charUsd,
    uint256 _price3charUsd,
    uint256 _price4charUsd,
    uint256 _price5charUsd
  ) {
    distributorAddress = _distributorAddress;

    tldContract = IFlexiPunkTLD(_tldAddress);

    nativeCoinTicker = _nativeCoinTicker;

    price1charUsd = _price1charUsd;
    price2charUsd = _price2charUsd;
    price3charUsd = _price3charUsd;
    price4charUsd = _price4charUsd;
    price5charUsd = _price5charUsd;
  }

  // READ

  function getNativeCoinPriceWei() public view returns(uint256) {
    (uint256 price_,, uint256 decimals_) = IFtsoRegistry(IContractRegistry(contractRegistry)
                                            .getContractAddressByName(ftsoRegistryName))
                                            .getCurrentPriceWithDecimals(nativeCoinTicker);
    return price_ * (10 ** (18 - decimals_));
  }

  function price1char() public view returns(uint256) {
    return (price1charUsd / getNativeCoinPriceWei()) * 1e18;
  }

  function price2char() public view returns(uint256) {
    return (price2charUsd / getNativeCoinPriceWei()) * 1e18;
  }

  function price3char() public view returns(uint256) {
    return (price3charUsd / getNativeCoinPriceWei()) * 1e18;
  }

  function price4char() public view returns(uint256) {
    return (price4charUsd / getNativeCoinPriceWei()) * 1e18;
  }

  function price5char() public view returns(uint256) {
    return (price5charUsd / getNativeCoinPriceWei()) * 1e18;
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
      selectedPrice = price1char();
    } else if (domainLength == 2) {
      selectedPrice = price2char();
    } else if (domainLength == 3) {
      selectedPrice = price3char();
    } else if (domainLength == 4) {
      selectedPrice = price4char();
    } else {
      selectedPrice = price5char();
    }

    uint256 slippage = (selectedPrice * 1_000) / MAX_BPS; // 10% slippage
    require(msg.value >= (selectedPrice - slippage), "Value below price");

    // send referral fee
    if (referralFee > 0 && _referrer != address(0)) {
      uint256 referralPayment = (msg.value * referralFee) / MAX_BPS;
      (bool sentReferralFee, ) = _referrer.call{value: referralPayment}("");
      require(sentReferralFee, "Failed to send referral fee");
    }

    // send the rest (if any) to TLD owner
    (bool sent, ) = distributorAddress.call{value: address(this).balance}("");
    require(sent, "Failed to send domain payment to distributor address");

    // mint a domain
    tokenId = tldContract.mint{value: 0}(_domainName, _domainHolder, address(0));
  }

  // OWNER

  function changeContractRegistry(address _contractRegistry) external onlyManagerOrOwner {
    contractRegistry = _contractRegistry;
  }

  function changeDistributorAddress(address _distributorAddress) external onlyManagerOrOwner {
    distributorAddress = _distributorAddress;
  }

  function changeFtsoRegistryName(string memory _ftsoRegistryName) external onlyManagerOrOwner {
    ftsoRegistryName = _ftsoRegistryName;
  }

  function changeNativeCoinTicker(string memory _nativeCoinTicker) external onlyManagerOrOwner {
    nativeCoinTicker = _nativeCoinTicker;
  }

  /// @notice This changes price in the minter contract
  function changePrice(uint256 _priceUsd, uint256 _chars) external onlyManagerOrOwner {
    require(_priceUsd > 0, "Cannot be zero");

    if (_chars == 1) {
      price1charUsd = _priceUsd;
    } else if (_chars == 2) {
      price2charUsd = _priceUsd;
    } else if (_chars == 3) {
      price3charUsd = _priceUsd;
    } else if (_chars == 4) {
      price4charUsd = _priceUsd;
    } else if (_chars == 5) {
      price5charUsd = _priceUsd;
    }
  }

  /// @notice This changes referral fee in the minter contract
  function changeReferralFee(uint256 _referralFee) external onlyManagerOrOwner {
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

  function togglePaused() external onlyManagerOrOwner {
    paused = !paused;
  }

  // withdraw ETH from contract
  function withdraw() external onlyManagerOrOwner {
    (bool success, ) = distributorAddress.call{value: address(this).balance}("");
    require(success, "Failed to withdraw ETH from contract");
  }

  // RECEIVE & FALLBACK
  receive() external payable {}
  fallback() external payable {}
 
}