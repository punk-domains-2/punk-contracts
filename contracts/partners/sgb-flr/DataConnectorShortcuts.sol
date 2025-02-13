// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

interface IContractRegistry {
  function getContractAddressByName(string memory contractName) external view returns(address);
}

interface IFdcHub {
  function requestAttestation(bytes calldata _data) external payable;
}

interface IFdcRequestFeeConfigurations {
  function getRequestFee(bytes calldata _data) external view returns (uint256 _fee);
}

interface IFlareSystemsManager {
  function firstVotingRoundStartTs() external view returns(uint64);
}

interface IRelay {
  function isFinalized(uint256 _protocolId, uint256 _votingRoundId) external view returns (bool);
}

/// @title Flare Data Connector Shortcuts
/// @author Tempe Techie
/// @notice A collection of shortcuts for the Data Connector to reduce the number of RPC calls
contract DataConnectorShortcuts {
  address public constant CONTRACT_REGISTRY = 0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019;

  // READ

  /// @notice Retrieves the address of a contract from the Contract Registry by its name
  /// @param contractName The name of the contract to look up
  /// @return The address of the requested contract
  function getContractAddressByName(string memory contractName) external view returns(address) {
    return IContractRegistry(CONTRACT_REGISTRY).getContractAddressByName(contractName);
  }

  /// @notice Timestamp when the first voting epoch started, in seconds since UNIX epoch.
  /// @return The timestamp of the first voting round start
  function getFirstVotingRoundStartTs() external view returns(uint64) {
    return IFlareSystemsManager(IContractRegistry(CONTRACT_REGISTRY)
            .getContractAddressByName("FlareSystemsManager"))
            .firstVotingRoundStartTs();
  }

  /// @notice Calculates the fee required for an attestation request
  /// @param _data The ABI encoded attestation request data
  /// @return _fee The calculated fee amount
  function getRequestFee(bytes calldata _data) external view returns (uint256 _fee) {
    return IFdcRequestFeeConfigurations(IContractRegistry(CONTRACT_REGISTRY)
            .getContractAddressByName("FdcRequestFeeConfigurations"))
            .getRequestFee(_data);
  }

  /// @notice Checks if a specific voting round has been finalized
  /// @param _protocolId The ID of the protocol (200 for FDC Protocol)
  /// @param _votingRoundId The ID of the voting round to check
  /// @return True if the voting round is finalized, false otherwise
  function isFinalized(uint256 _protocolId, uint256 _votingRoundId) external view returns (bool) {
    return IRelay(IContractRegistry(CONTRACT_REGISTRY)
            .getContractAddressByName("Relay"))
            .isFinalized(_protocolId, _votingRoundId);
  }

  // WRITE

  /// @notice Submits an attestation request to the FDC attestation providers
  /// @param _data The ABI encoded attestation request data
  /// @dev This function requires payment in the native currency
  function requestAttestation(bytes calldata _data) external payable {
    return IFdcHub(IContractRegistry(CONTRACT_REGISTRY)
            .getContractAddressByName("FdcHub"))
            .requestAttestation{value: msg.value}(_data);
  }
}