// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

// domain minting stats contract
contract TldStats is Ownable {
  address public tldMinterAddress;
  uint256 public weiSpentTotal; // total wei spent for domain minting

  mapping (address => uint256) public weiSpent; // user => wei spent for domain minting

  // READ
  function getWeiSpent(address _user) external view returns(uint256) {
    return weiSpent[_user];
  }

  // WRITE
  function addWeiSpent(address _user, uint256 _weiSpent) external {
    require(msg.sender == tldMinterAddress, "TldStats: Only TldMinter can add wei spent");
    weiSpent[_user] += _weiSpent;
    weiSpentTotal += _weiSpent;
  }

  // OWNER
  function setTldMinterAddress(address _tldMinterAddress) external onlyOwner {
    tldMinterAddress = _tldMinterAddress;
  }
}