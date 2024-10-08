// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import "base64-sol/base64.sol";
import { OwnableWithManagers } from "../../access/OwnableWithManagers.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../../lib/strings.sol";

/// @title Domain metadata contract
/// @author Tempe Techie
/// @notice Contract that stores metadata for a TLD
contract MeowMetadata is OwnableWithManagers {
  string public description = "Digital identity for the Superposition web3 community.";
  string public bgColor = "#1e1e1e";

  // EVENTS
  event DescriptionChanged(address indexed user, string description);
  event BgColorChanged(address indexed user, string bgColor);

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
        '<rect x="0" y="0" width="500" height="500" fill="', bgColor,'"/>',
        '<g transform="translate(-55, 85)"><path fill="', bgColor,'" d="m541.88,0H0v495.29h98.89l79.65-103.74c14.51-18.9,22.38-42.07,22.38-65.9v-153.79c0-5.82,7.15-8.73,11.32-4.6l47.56,56.13h87.74l52.36-57.11c4.23-3.89,11.14-.94,11.14,4.77v150l1.79,174.24h129.05V0Z"/><path fill="#f5f6f7" d="m411.04,171.05c0-5.71-6.91-8.66-11.14-4.77l-52.36,57.11h-87.74l-47.56-56.13c-4.16-4.13-11.32-1.23-11.32,4.6v153.79c0,23.83-7.87,47-22.38,65.9l-79.65,103.74h313.95l-1.79-174.24v-150Z"/></g>',
        '<text x="50%" y="35%" dominant-baseline="middle" fill="white" text-anchor="middle" font-size="x-large" font-family="sans-serif">',
        _fullDomainName,'</text>',
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
  function changeBgColor(string calldata _bgColor) external onlyManagerOrOwner {
    bgColor = _bgColor;
    emit BgColorChanged(msg.sender, _bgColor);
  }
}