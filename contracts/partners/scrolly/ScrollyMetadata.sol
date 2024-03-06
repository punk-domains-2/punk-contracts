// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import "base64-sol/base64.sol";
import { OwnableWithManagers } from "../../access/OwnableWithManagers.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../../lib/strings.sol";

/// @title Domain metadata contract
/// @author Tempe Techie
/// @notice Contract that stores metadata for a TLD
contract ScrollyMetadata is OwnableWithManagers {
  string public description = "A digital identity for Scrolly The Map web3 community.";
  string public brand = "https://sns.scrolly.xyz";

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
        '<rect x="0" y="0" width="500" height="500" fill="#007ced"/>',
        '<g><path transform="translate(140, 50)" fill="#ffffff" d="M 215.816406 110.503906 C 214.800781 104.109375 209.144531 99.300781 202.65625 99.300781 L 180.152344 99.300781 C 180.675781 92.507812 182.207031 84.625 183.925781 76.191406 C 188.773438 52.472656 194.269531 25.589844 178.777344 9.816406 C 175.140625 6.054688 170.089844 3.894531 164.917969 3.894531 L 25.84375 3.894531 L 25.84375 4.117188 C 23.367188 4.105469 20.898438 4.402344 18.578125 5.398438 C 12.265625 8.105469 8.640625 14.074219 8.882812 21.371094 C 9.0625 26.734375 11.941406 31.683594 16.222656 34 C 18.300781 35.125 20.839844 35.5625 23.328125 35.363281 L 23.328125 35.375 L 46.550781 35.375 C 47.378906 47.992188 44.511719 62.386719 41.765625 75.792969 C 39.664062 86.070312 37.683594 95.773438 37.640625 103.601562 C 37.59375 111.976562 40.910156 123.40625 50.425781 128.058594 C 52.996094 129.320312 55.8125 129.929688 58.628906 129.9375 L 58.628906 129.984375 L 197.710938 129.984375 C 201.652344 129.984375 205.566406 128.738281 208.746094 126.480469 C 212.042969 124.148438 214.460938 120.773438 215.535156 116.957031 C 216.113281 114.769531 216.210938 112.582031 215.8125 110.503906 Z M 17.699219 31.28125 C 14.363281 29.480469 12.117188 25.546875 11.976562 21.277344 C 11.777344 15.210938 14.628906 10.453125 19.800781 8.238281 C 21.703125 7.417969 23.734375 7.027344 25.769531 7.027344 C 30.023438 7.027344 34.300781 8.757812 37.460938 11.976562 C 39.050781 13.589844 40.398438 15.34375 41.535156 17.21875 L 23.667969 17.144531 L 25.820312 19.703125 C 26.722656 20.765625 29.589844 24.503906 28.800781 27.792969 C 28.199219 30.28125 26.050781 32.003906 23.175781 32.292969 C 21.246094 32.515625 19.253906 32.125 17.699219 31.285156 Z M 29.671875 32.285156 C 30.660156 31.214844 31.457031 29.980469 31.808594 28.515625 C 32.535156 25.46875 31.335938 22.449219 30.015625 20.261719 L 43.164062 20.316406 C 44.835938 23.972656 45.820312 28.007812 46.332031 32.285156 L 29.667969 32.285156 Z M 40.734375 103.625 C 40.777344 96.097656 42.730469 86.527344 44.800781 76.414062 C 49.671875 52.589844 55.191406 25.59375 39.671875 9.800781 C 38.554688 8.660156 37.25 7.800781 35.929688 6.984375 L 164.917969 6.984375 C 169.253906 6.984375 173.496094 8.796875 176.566406 11.96875 C 190.910156 26.578125 185.589844 52.605469 180.90625 75.570312 C 179.136719 84.1875 177.5625 92.261719 177.035156 99.296875 L 63.578125 99.296875 L 63.578125 99.320312 C 59.5 99.320312 55.875 101.8125 54.125 105.824219 C 52.3125 109.980469 52.984375 114.511719 55.886719 117.652344 L 56.347656 118.148438 L 72.710938 118.148438 C 71.6875 120.40625 70.03125 122.449219 67.902344 123.972656 C 63.316406 127.222656 56.832031 127.742188 51.792969 125.277344 C 43.558594 121.253906 40.695312 111.089844 40.734375 103.621094 Z M 73.722656 111.019531 C 73.953125 112.335938 73.929688 113.714844 73.683594 115.054688 L 57.738281 115.054688 C 55.730469 112.46875 55.988281 109.28125 56.964844 107.058594 C 57.945312 104.824219 60.195312 102.417969 63.578125 102.417969 C 68.59375 102.417969 72.859375 106.03125 73.722656 111.023438 Z M 212.554688 116.128906 C 211.671875 119.246094 209.691406 122.027344 206.957031 123.960938 C 204.300781 125.84375 201.015625 126.886719 197.714844 126.886719 L 68.878906 126.886719 C 69.136719 126.722656 69.441406 126.664062 69.6875 126.488281 C 74.9375 122.765625 77.78125 116.335938 76.769531 110.488281 C 76.199219 107.195312 74.460938 104.378906 72.046875 102.390625 L 202.65625 102.390625 C 207.632812 102.390625 211.984375 106.089844 212.769531 111.03125 C 213.082031 112.6875 213.011719 114.414062 212.550781 116.132812 Z M 212.554688 116.128906 " fill-opacity="1" fill-rule="nonzero"/></g>'
        '<text x="50%" y="50%" dominant-baseline="middle" fill="white" text-anchor="middle" font-size="x-large" font-family="sans-serif">',
        _fullDomainName,'</text>',
        '<text x="50%" y="70%" dominant-baseline="middle" fill="white" text-anchor="middle" font-family="sans-serif">',
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
}