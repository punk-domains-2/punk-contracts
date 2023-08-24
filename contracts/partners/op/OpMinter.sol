// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../lib/strings.sol";

interface IPunkTLD is IERC721 {
  function changeDescription(string calldata _description) external;

  function mint(
    string memory _domainName,
    address _domainHolder,
    address _referrer
  ) external payable returns(uint256);

  function transferOwnership(address newOwner) external;
}

interface IOwnable {
  function transferOwnership(address newOwner) external;
}

contract OpMinter is Ownable, ReentrancyGuard {
  address public recipient;

  bool public paused = false;

  uint256 public price1char; // 1 char domain price
  uint256 public price2char; // 2 chars domain price
  uint256 public price3char; // 3 chars domain price
  uint256 public price4char; // 4 chars domain price
  uint256 public price5char; // 5+ chars domain price

  IPunkTLD public immutable tldContract;

  // CONSTRUCTOR
  constructor(
    address _tldAddress,
    address _recipient,
    uint256 _price1char,
    uint256 _price2char,
    uint256 _price3char,
    uint256 _price4char,
    uint256 _price5char
  ) {
    tldContract = IPunkTLD(_tldAddress);

    recipient = _recipient;

    price1char = _price1char;
    price2char = _price2char;
    price3char = _price3char;
    price4char = _price4char;
    price5char = _price5char;
  }

  // WRITE

  // manually redirect ETH to the owner (in case it wasn't redirected automatically)
  function manualRedirect() external {
    (bool success, ) = recipient.call{value: address(this).balance}("");
    require(success, "Failed to withdraw ETH from contract");
  }

  function mint(
    string memory _domainName,
    address _domainHolder
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
    } else {
      selectedPrice = price5char;
    }

    require(msg.value >= selectedPrice, "Value below price");

    // send the payment to punk distributor (which automatically sends it to RetroPGF.eth)
    (bool sent, ) = payable(recipient).call{value: address(this).balance}("");
    require(sent, "Failed to send domain payment");

    // mint the domain
    tokenId = tldContract.mint{value: 0}(_domainName, _domainHolder, address(0));
  }

  // OWNER

  /// @notice This changes price in the minter contract
  function changePrice(uint256 _price, uint256 _chars) external onlyOwner {
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
    }
  }

  function changeRecipient(address _recipient) external onlyOwner {
    recipient = _recipient;
  }

  function changeTldDescription(string calldata _description) external onlyOwner {
    tldContract.changeDescription(_description);
  }

  function ownerFreeMint(
    string memory _domainName,
    address _domainHolder
  ) external nonReentrant onlyOwner returns(uint256 tokenId) {
    // mint a domain
    tokenId = tldContract.mint{value: 0}(_domainName, _domainHolder, address(0));
  }

  /// @notice Recover any ERC-20 token mistakenly sent to this contract address
  function recoverERC20(address tokenAddress_, uint256 tokenAmount_, address recipient_) external onlyOwner {
    IERC20(tokenAddress_).transfer(recipient_, tokenAmount_);
  }

  /// @notice Recover any ERC-721 token mistakenly sent to this contract address
  function recoverERC721(address tokenAddress_, uint256 tokenId_, address recipient_) external onlyOwner {
    IERC721(tokenAddress_).transferFrom(address(this), recipient_, tokenId_);
  }

  // pause or unpause domain registrations
  function togglePaused() external onlyOwner {
    paused = !paused;
  }
  
  /// @notice Transfer any contract ownership to another address
  function transferAnyContractOwnership(address _contractAddress, address _newTldOwner) external onlyOwner {
    IOwnable(_contractAddress).transferOwnership(_newTldOwner);
  }

  /// @notice Transfer TLD ownership to another address
  function transferTldOwnership(address _newTldOwner) external onlyOwner {
    tldContract.transferOwnership(_newTldOwner);
  }

  // RECEIVE & FALLBACK
  receive() external payable {}
  fallback() external payable {}
 
}