// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import "./interfaces/IRenewablePunkMetadata.sol";
import "../../lib/strings.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "base64-sol/base64.sol";

/// @title Punk Domains TLD contract (Renewable domains)
/// @author Tempe Techie
/// @notice Dynamically generated NFT contract which represents a top-level domain
contract RenewablePunkTLD is ERC721, Ownable, ReentrancyGuard {
  using strings for string;

  struct Domain {
    string name; // domain name that goes before the TLD name; example: "tempetechie" in "tempetechie.web3"
    uint256 tokenId;
    address holder;
    string data; // stringified JSON object, example: {"description": "Some text", "twitter": "@techie1239", "friends": ["0x123..."], "url": "https://punk.domains"}
    uint256 expiry; // the domain expiration timestamp (needs to be renewed before this date)
  }

  address public immutable factoryAddress; // RenewablePunkTLDFactory address
  address public metadataAddress; // RenewablePunkMetadata address
  address public minter; // address which is allowed to mint domains even if minting is paused
  address public renewer; // address which is allowed to renew domains

  bool public buyingEnabled = false; // buying domains enabled (means that minting is "paused")
  bool public metadataFrozen = false; // metadata address frozen forever
  bool public minterFrozen = false; // minter address frozen forever
  bool public renewerFrozen = false; // renewer address frozen forever

  uint256 public idCounter = 1; // up only
  uint256 public nameMaxLength = 140; // max length of a domain name
  uint256 public totalSupply;
  
  mapping (address => string) public defaultNames; // user's default domain
  mapping (uint256 => string) public domainIdsNames; // mapping (tokenId => domain name)
  mapping (string => Domain) public domains; // mapping (domain name => Domain struct)

  event DataChanged(address indexed user);
  event DefaultDomainChanged(address indexed user, string defaultDomain);
  event DomainBurned(address indexed user, string fullDomainName);
  event DomainBuyingToggle(address indexed user, bool domainBuyingToggle);
  event DomainCreated(address indexed user, address indexed owner, string fullDomainName);
  event MintingDisabledForever(address user);

  constructor(
    string memory _name,
    string memory _symbol,
    address _tldOwner,
    bool _buyingEnabled,
    address _factoryAddress,
    address _metadataAddress
  ) ERC721(_name, _symbol) {
    buyingEnabled = _buyingEnabled;
    metadataAddress = _metadataAddress;
    factoryAddress = _factoryAddress;
    transferOwnership(_tldOwner);
  }

  // READ

  // Domain getters - you can also get all Domain data by calling the auto-generated domains(domainName) method
  function getDomainHolder(string calldata _domainName) public view returns(address) {
    string memory dName = strings.lower(_domainName);

    if (block.timestamp > domains[dName].expiry) {
      return address(0);
    }

    return domains[dName].holder;
  }

  function getDomainData(string calldata _domainName) public view returns(string memory) {
    string memory dName = strings.lower(_domainName);

    if (block.timestamp > domains[dName].expiry) {
      return "";
    }
    
    return domains[dName].data; // should be a JSON object
  }

  function tokenURI(uint256 _tokenId) public view override returns (string memory) {
    string memory dName = domains[domainIdsNames[_tokenId]].name;
    // TODO: if expired, return metadata that says that this domain has expired
    return IRenewablePunkMetadata(metadataAddress).getMetadata(
      dName, 
      name(), 
      _tokenId,
      domains[dName].expiry
    );
  }

  // WRITE

  /// @notice Flexi&Renewable-specific function
  function burn(string calldata _domainName) external {
    string memory dName = strings.lower(_domainName);
    require(domains[dName].holder == _msgSender(), "You do not own the selected domain");
    uint256 tokenId = domains[dName].tokenId;
    delete domainIdsNames[tokenId]; // delete tokenId => domainName mapping
    delete domains[dName]; // delete string => Domain struct mapping

    if (keccak256(bytes(defaultNames[_msgSender()])) == keccak256(bytes(dName))) {
      delete defaultNames[_msgSender()];
    }

    _burn(tokenId); // burn the token
    --totalSupply;
    emit DomainBurned(_msgSender(), dName);
  }

  /// @notice Default domain is the domain name that reverse resolver returns for a given address.
  function editDefaultDomain(string calldata _domainName) external {
    string memory dName = strings.lower(_domainName);
    require(block.timestamp < domains[dName].expiry, "This domain has expired");
    require(domains[dName].holder == _msgSender(), "You do not own the selected domain");
    defaultNames[_msgSender()] = dName;
    emit DefaultDomainChanged(_msgSender(), dName);
  }

  /// @notice Edit domain custom data. Make sure to not accidentally delete previous data. Fetch previous data first.
  /// @param _domainName Only domain name, no TLD/extension.
  /// @param _data Custom data needs to be in a JSON object format.
  function editData(string calldata _domainName, string calldata _data) external {
    string memory dName = strings.lower(_domainName);
    require(block.timestamp < domains[dName].expiry, "This domain has expired");
    require(domains[dName].holder == _msgSender(), "Only domain holder can edit their data");
    domains[dName].data = _data;
    emit DataChanged(_msgSender());
  }

  // MINTER

  /// @notice Mint a new domain name as NFT (no dots and spaces allowed).
  /// @param _domainName Enter domain name without TLD and make sure letters are in lowercase form.
  /// @return token ID
  function mint(
    string memory _domainName,
    address _domainHolder
  ) external nonReentrant returns(uint256) {
    require(buyingEnabled || _msgSender() == owner(), "Buying domains disabled");
    require(_msgSender() == owner() || _msgSender() == minter, "Only owner or minter can mint domains");

    // TODO: 
    // if domain already minted, but expired, transfer it to the new owner
      // transfer code (check ERC-721 transfer function)
      // make sure to include the transfer event
      // delete custom data
      // add new owner to struct
      // if default domain name is not set for that holder, set it now
      // if previous owner had this domain name as default, unset it as default
    // else
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

    Domain memory newDomain; // Domain struct
    
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

  // RENEWER

    // TODO: renew a domain that has not expired yet

  // OWNER

  /// @notice Only TLD contract owner can call this function. Flexi&Renewable-specific function.
  function changeMetadataAddress(address _metadataAddress) external onlyOwner {
    require(!metadataFrozen, "Cannot change metadata address anymore");
    metadataAddress = _metadataAddress;
  }

  /// @notice Only TLD contract owner can call this function. Flexi&Renewable-specific function.
  function changeMinter(address _minter) external onlyOwner {
    require(!minterFrozen, "Cannot change the minter address anymore");
    minter = _minter;
  }

  /// @notice Only TLD contract owner can call this function.
  function changeNameMaxLength(uint256 _maxLength) external onlyOwner {
    nameMaxLength = _maxLength;
  }

  /// @notice Only TLD contract owner can call this function. Renewable-specific function.
  function changeRenewer(address _renewer) external onlyOwner {
    require(!renewerFrozen, "Cannot change the renewer address anymore");
    renewer = _renewer;
  }

  /// @notice Freeze metadata address. Only TLD contract owner can call this function.
  function freezeMetadata() external onlyOwner {
    metadataFrozen = true; // this action is irreversible
  }

  /// @notice Freeze the minter address. Only TLD contract owner can call this function.
  function freezeMinter() external onlyOwner {
    minterFrozen = true; // this action is irreversible
  }

  /// @notice Freeze the renewer address. Only TLD contract owner can call this function.
  function freezeRenewer() external onlyOwner {
    renewerFrozen = true; // this action is irreversible
  }

  /// @notice Only TLD contract owner can call this function.
  function toggleBuyingDomains() external onlyOwner {
    buyingEnabled = !buyingEnabled;
    emit DomainBuyingToggle(_msgSender(), buyingEnabled);
  }

  // BEFORE TOKEN TRANSFER HOOK

  ///@dev Hook that is called before any token transfer. This includes minting and burning.
  function _beforeTokenTransfer(address from,address to,uint256 tokenId) internal override virtual {

    // if domain is expired, prevent the transfer
    require(block.timestamp < domains[domainIdsNames[tokenId]].expiry, "This domain has expired");

    if (from != address(0)) { // run on every transfer but not on mint
      domains[domainIdsNames[tokenId]].holder = to; // change holder address in Domain struct
      
      if (bytes(defaultNames[to]).length == 0 && to != address(0)) {
        defaultNames[to] = domains[domainIdsNames[tokenId]].name; // if default domain name is not set for that holder, set it now
      }

      if (strings.equals(strings.toSlice(domains[domainIdsNames[tokenId]].name), strings.toSlice(defaultNames[from]))) {
        delete defaultNames[from]; // if previous owner had this domain name as default, unset it as default
      }
    }
    
  }

}