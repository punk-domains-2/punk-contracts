// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import { OwnableWithManagers } from "../../access/OwnableWithManagers.sol";

contract MeowReservations is OwnableWithManagers {
    mapping(string => address) public reservedNames;
    address public writer;

    constructor(address _writer) {
      writer = _writer;
    }

    // READ
    function getResNameAddress(string calldata _name) external view returns (address) {
      return reservedNames[_name];
    }

    // WRITER
    function setResName(string calldata _name, address _address) external {
      require(msg.sender == writer, "Only writer can set reserved name");
      reservedNames[_name] = _address;
    }

    function setResNames(string[] calldata _names, address[] calldata _addresses) external {
      require(msg.sender == writer, "Only writer can set reserved name");
      uint256 nameL = _names.length;
      for (uint256 i = 0; i < nameL;) {
        reservedNames[_names[i]] = _addresses[i];
        unchecked {
          ++i;
        }
      }
    }

    // MANAGER OR OWNER
    function setResNameManager(string calldata _name, address _address) external onlyManagerOrOwner {
      reservedNames[_name] = _address;
    }

    function setWriter(address _address) external onlyManagerOrOwner {
      writer = _address;
    }
  
}
