// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import "./interfaces/IFlexiTLDMetadata.sol";
import "../../interfaces/IBasePunkTLD.sol";
import "../../lib/strings.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "base64-sol/base64.sol";

/// @title Punk Domains TLD contract (Flexi)
/// @author Tempe Techie
/// @notice Dynamically generated NFT contract which represents a top-level domain
contract FlexiPunkTLD is IBasePunkTLD, ERC721, Ownable, ReentrancyGuard {
  using strings for string;

  uint256 public totalSupply;
  uint256 public idCounter; // up only
  
  bool public buyingEnabled; // buying domains enabled

  address immutable factoryAddress; // PunkTLDFactory address
  address public metadataAddress; // FlexiTLDMetadata address

  uint256 public override price; // domain price
  uint256 public royalty; // share of each domain purchase (in bips) that goes to Punk Domains
  uint256 public override referral = 1000; // share of each domain purchase (in bips) that goes to the referrer (referral fee)
  uint256 public nameMaxLength = 140; // max length of a domain name
  
  mapping (string => Domain) public override domains; // mapping (domain name => Domain struct)
  mapping (uint256 => string) public domainIdsNames; // mapping (tokenId => domain name)
  mapping (address => string) public defaultNames; // user's default domain

  constructor(
    string memory _name,
    string memory _symbol,
    address _tldOwner,
    uint256 _domainPrice,
    bool _buyingEnabled,
    uint256 _royalty,
    address _factoryAddress
  ) ERC721(_name, _symbol) {
    price = _domainPrice;
    buyingEnabled = _buyingEnabled;
    royalty = _royalty;
    factoryAddress = _factoryAddress;

    transferOwnership(_tldOwner);
  }

  // READ

  // Domain getters - you can also get all Domain data by calling the auto-generated domains(domainName) method
  function getDomainHolder(string calldata _domainName) public override view returns(address) {
    return domains[strings.lower(_domainName)].holder;
  }

  function getDomainData(string calldata _domainName) public view returns(string memory) {
    return domains[strings.lower(_domainName)].data; // should be a JSON object
  }

  /// @notice Flexi-specific function
  function getDomainTokenId(string calldata _domainName) public view returns(uint256) {
    return domains[strings.lower(_domainName)].tokenId;
  }

  function getFactoryOwner() public override view returns(address) {
    Ownable factory = Ownable(factoryAddress);
    return factory.owner();
  }

  function tokenURI(uint256 _tokenId) public view override returns (string memory) {
    string memory fullDomainName = string(abi.encodePacked(domains[domainIdsNames[_tokenId]].name, name()));

    return IFlexiTLDMetadata(metadataAddress).getMetadata(fullDomainName, address(this));
  }

  // WRITE

  /// @notice Flexi-specific function
  function burn(string calldata _domainName) external {
    require(domains[_domainName].holder == _msgSender(), "You do not own the selected domain");
    _burn(getDomainTokenId(_domainName));
  }

  function editDefaultDomain(string calldata _domainName) external {
    require(domains[_domainName].holder == _msgSender(), "You do not own the selected domain");
    defaultNames[_msgSender()] = _domainName;
    emit DefaultDomainChanged(_msgSender(), _domainName);
  }

  /// @notice Edit domain custom data. Make sure to not accidentally delete previous data. Fetch previous data first.
  /// @param _domainName Only domain name, no TLD/extension.
  /// @param _data Custom data needs to be in a JSON object format.
  function editData(string calldata _domainName, string calldata _data) external {
    require(domains[_domainName].holder == _msgSender(), "Only domain holder can edit their data");
    domains[_domainName].data = _data;
    emit DataChanged(_msgSender());
  }

  /// @notice Mint a new domain name as NFT (no dots and spaces allowed).
  /// @param _domainName Enter domain name without TLD and make sure letters are in lowercase form.
  /// @return token ID
  function mint(
    string memory _domainName,
    address _domainHolder,
    address _referrer
  ) external payable override nonReentrant returns(uint256) {
    require(buyingEnabled || _msgSender() == owner(), "Buying TLDs disabled");
    require(msg.value >= price, "Value below price");

    _sendPayment(msg.value, _referrer);

    return _mintDomain(_domainName, _domainHolder, "");
  }

  function _mintDomain(
    string memory _domainNameRaw, 
    address _domainHolder,
    string memory _data
  ) internal returns(uint256) {
    // convert domain name to lowercase (only works for ascii, clients should enforce ascii domains only)
    string memory _domainName = strings.lower(_domainNameRaw);

    require(strings.len(strings.toSlice(_domainName)) > 0, "Domain name empty");
    require(bytes(_domainName).length < nameMaxLength, "Domain name is too long");
    require(strings.count(strings.toSlice(_domainName), strings.toSlice(".")) == 0, "There should be no dots in the name");
    require(strings.count(strings.toSlice(_domainName), strings.toSlice(" ")) == 0, "There should be no spaces in the name");
    require(domains[_domainName].holder == address(0), "Domain with this name already exists");

    _mint(_domainHolder, idCounter);

    Domain memory newDomain;
    
    // store data in Domain struct
    newDomain.name = _domainName;
    newDomain.tokenId = idCounter;
    newDomain.holder = _domainHolder;
    newDomain.data = _data;

    // add to both mappings
    domains[_domainName] = newDomain;
    domainIdsNames[idCounter] = _domainName;

    if (bytes(defaultNames[_domainHolder]).length == 0) {
      defaultNames[_domainHolder] = _domainName; // if default domain name is not set for that holder, set it now
    }
    
    emit DomainCreated(_msgSender(), _domainHolder, string(abi.encodePacked(_domainName, name())));

    ++idCounter;
    ++totalSupply;

    return idCounter-1;
  }

  function _sendPayment(uint256 _paymentAmount, address _referrer) internal {
    if (royalty > 0 && royalty < 5000) { 
      // send royalty - must be less than 50% (5000 bips)
      (bool sentRoyalty, ) = payable(getFactoryOwner()).call{value: ((_paymentAmount * royalty) / 10000)}("");
      require(sentRoyalty, "Failed to send royalty to factory owner");
    }

    if (_referrer != address(0) && referral > 0 && referral < 5000) {
      // send referral fee - must be less than 50% (5000 bips)
      (bool sentReferralFee, ) = payable(_referrer).call{value: ((_paymentAmount * referral) / 10000)}("");
      require(sentReferralFee, "Failed to send referral fee");
    }

    // send the rest to TLD owner
    (bool sent, ) = payable(owner()).call{value: address(this).balance}("");
    require(sent, "Failed to send domain payment to TLD owner");
  }

  ///@dev Hook that is called before any token transfer. This includes minting and burning.
  function _beforeTokenTransfer(address from,address to,uint256 tokenId) internal override virtual {

    if (from != address(0)) { // run on every transfer but not on mint
      domains[domainIdsNames[tokenId]].holder = to; // change holder address in Domain struct
      domains[domainIdsNames[tokenId]].data = ""; // reset custom data
      
      if (bytes(defaultNames[to]).length == 0 && to != address(0)) {
        defaultNames[to] = domains[domainIdsNames[tokenId]].name; // if default domain name is not set for that holder, set it now
      }

      if (strings.equals(strings.toSlice(domains[domainIdsNames[tokenId]].name), strings.toSlice(defaultNames[from]))) {
        defaultNames[from] = ""; // if previous owner had this domain name as default, unset it as default
      }
    }

    if (to == address(0)) {
      --totalSupply;
    }
  }

  // OWNER

  /// @notice Only TLD contract owner can call this function. Flexi-specific function.
  function changeMetadataAddress(address _metadataAddress) external onlyOwner {
    metadataAddress = _metadataAddress;
  }

  /// @notice Only TLD contract owner can call this function.
  function changeNameMaxLength(uint256 _maxLength) external override onlyOwner {
    nameMaxLength = _maxLength;
  }

  /// @notice Only TLD contract owner can call this function.
  function changePrice(uint256 _price) external override onlyOwner {
    price = _price;
    emit TldPriceChanged(_msgSender(), _price);
  }

  /// @notice Only TLD contract owner can call this function.
  function changeReferralFee(uint256 _referral) external override onlyOwner {
    require(_referral < 5000, "Referral fee cannot be 50% or higher");
    referral = _referral; // referral must be in bips
    emit ReferralFeeChanged(_msgSender(), _referral);
  }

  /// @notice Only TLD contract owner can call this function.
  function toggleBuyingDomains() external onlyOwner {
    buyingEnabled = !buyingEnabled;
    emit DomainBuyingToggle(_msgSender(), buyingEnabled);
  }
  
  // FACTORY OWNER (current owner address of PunkTLDFactory)

  /// @notice Only Factory contract owner can call this function.
  function changeRoyalty(uint256 _royalty) external {
    require(getFactoryOwner() == _msgSender(), "Sender not factory owner");
    require(_royalty < 5000, "Royalty cannot be 50% or higher");
    royalty = _royalty; // royalty is in bips
    emit TldRoyaltyChanged(_msgSender(), _royalty);
  }
}