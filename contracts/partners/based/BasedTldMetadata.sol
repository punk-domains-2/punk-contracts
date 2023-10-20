// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import { Base64 } from "base64-sol/base64.sol";
import { OwnableWithManagers } from "../../access/OwnableWithManagers.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import "../../lib/strings.sol";

/// @title Domain metadata contract
/// @author Tempe Techie
/// @notice Contract that stores metadata for a TLD
contract BasedTldMetadata is OwnableWithManagers {
  string public description = "The official web3 name and digital identity of the Based DAO web3 community.";
  string public brand = "Based DAO";
  string public colorLeft = "#155BFC";
  string public colorRight = "#155BFC";

  // EVENTS
  event DescriptionChanged(address indexed user, string description);
  event BrandChanged(address indexed user, string brand);

  // READ
  function getMetadata(string calldata _domainName, string calldata _tld, uint256 _tokenId) public view returns(string memory) {
    string memory fullDomainName = string(abi.encodePacked(_domainName, _tld));
    uint256 domainLength = strings.len(strings.toSlice(_domainName));

    return string(
      abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(abi.encodePacked(
        '{"name": "', fullDomainName, '", ',
        '"description": "', description, '", ',
        '"attributes": [',
          '{"trait_type": "length", "value": "', Strings.toString(domainLength) ,'"}'
        '], '
        '"image": "', _getImage(fullDomainName), '"}'))))
    );
  }

  function _getImage(string memory _fullDomainName) internal view returns (string memory) {
    string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">',
        '<defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">',
        '<stop offset="0%" style="stop-color:',colorLeft,';stop-opacity:1" />',
        '<stop offset="100%" style="stop-color:',colorRight,';stop-opacity:1" /></linearGradient></defs>',
        '<rect x="0" y="0" width="500" height="500" fill="url(#grad)"/>',
        '<text x="50%" y="50%" dominant-baseline="middle" fill="white" text-anchor="middle" font-size="x-large">',
        _fullDomainName,'</text><text x="50%" y="70%" dominant-baseline="middle" fill="white" text-anchor="middle">',
        brand,'</text>',
      '</svg>'
    ))));

    return string(abi.encodePacked("data:image/svg+xml;base64,", svgBase64Encoded));
  }

  // WRITE (OWNER)

  /// @notice Only metadata contract owner can call this function.
  function changeDescription(string calldata _description) external onlyManagerOrOwner {
    description = _description;
    emit DescriptionChanged(msg.sender, _description);
  }

  /// @notice Only metadata contract owner can call this function.
  function changeBrand(string calldata _brand) external onlyManagerOrOwner {
    brand = _brand;
    emit BrandChanged(msg.sender, _brand);
  }

  function changeColorLeft(string calldata _colorLeft) external onlyManagerOrOwner {
    colorLeft = _colorLeft;
  }

  function changeColorRight(string calldata _colorRight) external onlyManagerOrOwner {
    colorRight = _colorRight;
  }
}