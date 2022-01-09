// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import "./lib/strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Web3PandaTLD.sol";

contract Web3PandaTLDFactory is Ownable {
  using strings for string;

  // STATE
  string[] public tlds; // an array of existing TLD names
  mapping (string => address) public tldNamesAddresses; // a mapping of TLDs (string => TLDaddress); if not address(0), it means the TLD has already been created
  mapping (string => bool) public forbidden; // forbidden TLDs (for example .eth, unstoppable domains, and TLDs that already exist in web2, like .com)
  
  uint256 public price; // price for creating a new TLD
  uint256 public royalty = 0; // payment amount in bips that Web3PandaDAO gets when a new domain is registered (injected in every newly created TLD contract)
  bool public buyingEnabled = false; // buying TLDs enabled (true/false)
  uint256 public nameMaxLength = 40; // the maximum length of a TLD name

  // EVENTS
  event TldCreated(address indexed user, address indexed owner, string indexed tldName, address tldAddress);

  // MODIFIERS
  modifier validTldName(string memory _name) {
    require(
      strings.len(strings.toSlice(_name)) > 1,
      "The TLD name must be longer than 1 character"
    );

    require(
      bytes(_name).length < nameMaxLength,
      "The TLD name is too long"
    );

    require(
      strings.count(strings.toSlice(_name), strings.toSlice(".")) == 1,
      "There should be exactly one dot in the name"
    );

    require(
      strings.startsWith(strings.toSlice(_name), strings.toSlice(".")) == true,
      "The dot must be at the start of the TLD name"
    );

    require(forbidden[_name] == false, "The chosen TLD name is on the forbidden list");

    require(tldNamesAddresses[_name] == address(0), "TLD with this name already exists");
    
    _;
  }

  // CONSTRUCTOR
  constructor(uint256 _price) {
    // forbidden TLDs

    forbidden[".eth"] = true;
    forbidden[".com"] = true;
    forbidden[".org"] = true;
    forbidden[".net"] = true;

    // set TLD price
    price = _price;
  }

  // READ

  // get the array of existing TLDs - is this needed?
  function getTldsArray() public view returns(string[] memory) {
    return tlds;
  }

  // WRITE

  // create a new TLD (public payable)
  function createTld(
    string memory _name,
    string memory _symbol,
    address _tldOwner,
    uint256 _domainPrice,
    bool _buyingEnabled
  ) public payable returns(address) {
    require(buyingEnabled == true, "Buying TLDs is disabled");
    require(msg.value >= price, "Value below price");

    return _createTld(
      _name, 
      _symbol, 
      _tldOwner, 
      _domainPrice, 
      _buyingEnabled
    );

  }

  // create a new TLD (internal non-payable)
  function _createTld(
    string memory _name,
    string memory _symbol,
    address _tldOwner,
    uint256 _domainPrice,
    bool _buyingEnabled
  ) internal validTldName(_name) returns(address) {

    // create a new TLD contract
    Web3PandaTLD tld = new Web3PandaTLD(
      _name, 
      _symbol, 
      _tldOwner, 
      _domainPrice, 
      _buyingEnabled,
      royalty,
      address(this)
    );

    tldNamesAddresses[_name] = address(tld); // store TLD name and address into mapping
    tlds.push(_name); // store TLD name into array

    emit TldCreated(msg.sender, _tldOwner, _name, address(tld));

    return address(tld);
  }

  // OWNER

  // add a new TLD to forbidden TLDs
  function addForbiddenTld(string memory _name) public onlyOwner validTldName(_name) {
    forbidden[_name] = true;
  }

  // change nameMaxLength (max length of a TLD name)
  function changeNameMaxLength(uint256 _maxLength) public onlyOwner {
    nameMaxLength = _maxLength;
  }

  // change the payment amount for a new TLD
  function changePrice(uint256 _price) public onlyOwner {
    price = _price;
  }
    
  // change nameMaxLength (max length of a TLD name)
  function changeRoyalty(uint256 _royalty) public onlyOwner {
    royalty = _royalty;
  }

  // create a new TLD for a specified address for free (only owner)
  function ownerCreateTld(
    string memory _name,
    string memory _symbol,
    address _tldOwner,
    uint256 _domainPrice,
    bool _buyingEnabled
  ) public onlyOwner returns(address) {

    return _createTld(
      _name, 
      _symbol, 
      _tldOwner, 
      _domainPrice, 
      _buyingEnabled
    );

  }

  // remove a TLD from forbidden TLDs
  function removeForbiddenTld(string memory _name) public onlyOwner {
    forbidden[_name] = false;
  }

  // enable/disable buying TLDs (except for the owner)
  function toggleBuyingTlds() public onlyOwner {
    buyingEnabled = !buyingEnabled;
  }
}