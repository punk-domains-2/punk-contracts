// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import { OwnableWithManagers } from "../../access/OwnableWithManagers.sol";

contract UsedTxsRegistry is OwnableWithManagers {
  address public minterFdcAddress;
  mapping(string => bool) public isUsed; // check if tx hash has been used (format: string(sourceid-txhash))
  
  // CONSTRUCTOR
  constructor(address _minterFdcAddress) {
    minterFdcAddress = _minterFdcAddress;
  }

  // READ
  function isTxHashUsed(string memory _txHash) public view returns (bool) {
    return isUsed[_txHash];
  }

  // MINTER
  function setTxHashUsed(string memory _txHash) external {
    require(msg.sender == minterFdcAddress, "Only minter can set tx hash as used");
    isUsed[_txHash] = true;
  }

  // OWNER
  function ownerEditTxHash(string memory _txHash, bool _isUsed) external onlyManagerOrOwner {
    isUsed[_txHash] = _isUsed;
  }

  function setMinterFdcAddress(address _minterFdcAddress) external onlyManagerOrOwner {
    minterFdcAddress = _minterFdcAddress;
  }

}