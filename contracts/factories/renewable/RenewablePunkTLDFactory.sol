// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import "../../lib/strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./RenewablePunkTLD.sol";
import "../../interfaces/IPunkForbiddenTlds.sol";

/// @title Punk Domains TLD Factory contract (Renewable domains)
/// @author Tempe Techie
/// @notice Factory contract dynamically generates new TLD contracts.
contract RenewablePunkTLDFactory is Ownable, ReentrancyGuard {
  using strings for string;

  // Custom errors
  error TldTooShort();
  error TldTooLong();
  error InvalidDotCount();
  error ContainsSpaces();
  error MustStartWithDot();
  error TldForbidden();
  error BuyingDisabled();
  error InsufficientValue();
  error PaymentFailed();

  string[] public tlds; // existing TLDs
  mapping (string => address) public tldNamesAddresses; // a mapping of TLDs (string => TLDaddress)

  address public forbiddenTlds; // address of the contract that stores the list of forbidden TLDs
  address public metadataAddress; // default FlexiPunkMetadata address
  
  uint256 public price; // price for creating a new TLD
  bool public buyingEnabled = false; // buying TLDs enabled (true/false)
  uint256 public nameMaxLength = 40; // the maximum length of a TLD name

  event TldCreated(address indexed user, address indexed owner, string tldName, address indexed tldAddress);
  event ChangeTldPrice(address indexed user, uint256 tldPrice);
  event ChangeForbiddenTldsAddress(address indexed user, address indexed forbiddenTlds);
  event ChangeMetadataAddress(address indexed user, address indexed metadataAddress);
  event ChangeNameMaxLength(address indexed user, uint256 maxLength);
  event ToggleBuyingTlds(address indexed user, bool buyingEnabled);

  constructor(
    uint256 _price, 
    address _forbiddenTlds,
    address _metadataAddress
  ) {
    price = _price;
    forbiddenTlds = _forbiddenTlds;
    metadataAddress = _metadataAddress;
  }

  // READ
  function getTldsArray() public view returns(string[] memory) {
    return tlds;
  }

  function _validTldName(string memory _name) view internal {
    // ex-modifier turned into internal function to optimize contract size
    if (strings.len(strings.toSlice(_name)) <= 1) revert TldTooShort(); // at least two chars, which is a dot and a letter
    if (bytes(_name).length >= nameMaxLength) revert TldTooLong();
    if (strings.count(strings.toSlice(_name), strings.toSlice(".")) != 1) revert InvalidDotCount();
    if (strings.count(strings.toSlice(_name), strings.toSlice(" ")) != 0) revert ContainsSpaces();
    if (!strings.startsWith(strings.toSlice(_name), strings.toSlice("."))) revert MustStartWithDot();

    IPunkForbiddenTlds forbidden = IPunkForbiddenTlds(forbiddenTlds);
    if (forbidden.isTldForbidden(_name)) revert TldForbidden(); // TLD already exists or is restricted
  }

  // WRITE

  /// @notice Create a new top-level domain contract (ERC-721).
  /// @param _name Enter TLD name starting with a dot and make sure letters are in lowercase form.
  /// @return TLD contract address
  function createTld(
    string memory _name,
    string memory _symbol,
    address _tldOwner,
    bool _buyingEnabled
  ) external payable nonReentrant returns(address) {
    if (!buyingEnabled) revert BuyingDisabled();
    if (msg.value < price) revert InsufficientValue();

    (bool sent, ) = payable(owner()).call{value: address(this).balance}("");
    if (!sent) revert PaymentFailed(); // failed to send TLD payment to factory owner

    return _createTld(
      _name, 
      _symbol, 
      _tldOwner, 
      _buyingEnabled
    );
  }

  // create a new TLD (internal non-payable)
  function _createTld(
    string memory _nameRaw,
    string memory _symbol,
    address _tldOwner,
    bool _buyingEnabled
  ) internal returns(address) {
    string memory _name = strings.lower(_nameRaw);

    _validTldName(_name);

    bytes32 saltedHash = keccak256(abi.encodePacked(msg.sender, block.timestamp)); // salt for TLD to have a unique address
    RenewablePunkTLD tld = new RenewablePunkTLD{salt: saltedHash}(
      _name, 
      _symbol, 
      _tldOwner,
      _buyingEnabled,
      address(this),
      metadataAddress
    );

    IPunkForbiddenTlds forbidden = IPunkForbiddenTlds(forbiddenTlds);
    forbidden.addForbiddenTld(_name);

    tldNamesAddresses[_name] = address(tld); // store TLD name and address into mapping
    tlds.push(_name); // store TLD name into array

    emit TldCreated(_msgSender(), _tldOwner, _name, address(tld));

    return address(tld);
  }

  // OWNER

  /// @notice Factory contract owner can change the ForbiddenTlds contract address.
  function changeForbiddenTldsAddress(address _forbiddenTlds) external onlyOwner {
    forbiddenTlds = _forbiddenTlds;
    emit ChangeForbiddenTldsAddress(_msgSender(), _forbiddenTlds);
  }

  /// @notice Factory contract owner can change the metadata contract address.
  function changeMetadataAddress(address _mAddr) external onlyOwner {
    metadataAddress = _mAddr;
    emit ChangeMetadataAddress(_msgSender(), _mAddr);
  }

  /// @notice Factory contract owner can change TLD max name length.
  function changeNameMaxLength(uint256 _maxLength) external onlyOwner {
    nameMaxLength = _maxLength;
    emit ChangeNameMaxLength(_msgSender(), _maxLength);
  }

  /// @notice Factory contract owner can change price for minting new TLDs.
  function changePrice(uint256 _price) external onlyOwner {
    price = _price;
    emit ChangeTldPrice(_msgSender(), _price);
  }

  /// @notice Factory owner can create a new TLD for a specified address for free
  /// @param _name Enter TLD name starting with a dot and make sure letters are in lowercase form.
  /// @return TLD contract address
  function ownerCreateTld(
    string memory _name,
    string memory _symbol,
    address _tldOwner,
    bool _buyingEnabled
  ) external onlyOwner returns(address) {

    return _createTld(
      _name, 
      _symbol, 
      _tldOwner, 
      _buyingEnabled
    );

  }

  /// @notice Factory contract owner can enable or disable public minting of new TLDs.
  function toggleBuyingTlds() external onlyOwner {
    buyingEnabled = !buyingEnabled;
    emit ToggleBuyingTlds(_msgSender(), buyingEnabled);
  }

}
