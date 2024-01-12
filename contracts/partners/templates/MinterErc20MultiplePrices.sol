// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import { OwnableWithManagers } from "../../access/OwnableWithManagers.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../lib/strings.sol";

interface IFlexiPunkTLD {
  function mint(
    string memory _domainName,
    address _domainHolder,
    address _referrer
  ) external payable returns(uint256);
}

// generic minter contract (ERC-20 token for payment)
// - no minting restrictions (anyone can mint)
// - erc-20 token payment
// - two team addresses
contract MinterErc20MultiplePrices is OwnableWithManagers, ReentrancyGuard {
  address public devAddress;
  address public teamAddress;
  address public immutable tokenAddress;

  bool public paused = false;

  uint256 public referralFee = 1000; // share of each domain purchase (in bips) that goes to the referrer
  uint256 public constant MAX_BPS = 10_000;

  uint256 public price1char; // 1 char domain price
  uint256 public price2char; // 2 chars domain price
  uint256 public price3char; // 3 chars domain price
  uint256 public price4char; // 4 chars domain price
  uint256 public price5char; // 5 chars domain price
  uint256 public price6char; // 6+ chars domain price

  IFlexiPunkTLD public immutable tldContract;

  // CONSTRUCTOR
  constructor(
    address _tldAddress,
    address _devAddress,
    address _teamAddress,
    address _tokenAddress,
    uint256 _price1char,
    uint256 _price2char,
    uint256 _price3char,
    uint256 _price4char,
    uint256 _price5char,
    uint256 _price6char
  ) {
    tldContract = IFlexiPunkTLD(_tldAddress);
    devAddress = _devAddress;
    teamAddress = _teamAddress;
    tokenAddress = _tokenAddress;

    price1char = _price1char;
    price2char = _price2char;
    price3char = _price3char;
    price4char = _price4char;
    price5char = _price5char;
    price6char = _price6char;
  }

  // WRITE

  function mint(
    string memory _domainName,
    address _domainHolder,
    address _referrer
  ) external nonReentrant returns(uint256 tokenId) {
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
    } else if (domainLength == 5) {
      selectedPrice = price5char;
    } else {
      selectedPrice = price6char;
    }

    // send referral fee
    if (referralFee > 0 && _referrer != address(0)) {
      uint256 referralPayment = (selectedPrice * referralFee) / 10_000;
      selectedPrice -= referralPayment;
      IERC20(tokenAddress).transferFrom(msg.sender, _referrer, referralPayment);
    }

    // send team fees (half-half)
    IERC20(tokenAddress).transferFrom(msg.sender, devAddress, selectedPrice / 2);

    selectedPrice -= selectedPrice / 2;
    IERC20(tokenAddress).transferFrom(msg.sender, teamAddress, selectedPrice);

    // mint a domain
    tokenId = tldContract.mint{value: 0}(_domainName, _domainHolder, address(0));
  }

  // OWNER

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

  /// @notice This changes referral fee in the minter contract
  function changeReferralFee(uint256 _referralFee) external onlyManagerOrOwner {
    require(_referralFee <= 2000, "Cannot exceed 20%");
    referralFee = _referralFee;
  }

  function changeDevAddress(address _devAddress) external onlyManagerOrOwner {
    devAddress = _devAddress;
  }

  function changeTeamAddress(address _teamAddress) external onlyManagerOrOwner {
    teamAddress = _teamAddress;
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

  function togglePaused() external onlyManagerOrOwner {
    paused = !paused;
  }

  // recover ETH from contract
  function withdraw() external onlyManagerOrOwner {
    (bool success, ) = msg.sender.call{value: address(this).balance}("");
    require(success, "Failed to withdraw ETH from contract");
  }
 
}