// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

interface IPunkTLD {

  function price() external view returns (uint256);

  function transferOwnership(address newOwner) external;

}