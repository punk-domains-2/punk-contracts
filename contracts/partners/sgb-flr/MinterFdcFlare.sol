// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import { IEVMTransactionVerification } from "@flarenetwork/flare-periphery-contracts/flare/IEVMTransactionVerification.sol";
import { IEVMTransaction } from "@flarenetwork/flare-periphery-contracts/flare/IEVMTransaction.sol";
import { OwnableWithManagers } from "../../access/OwnableWithManagers.sol";

interface IContractRegistry {
  function getContractAddressByName(string memory contractName) external view returns(address);
}

interface IFdcVerification {
  function verifyEVMTransaction(IEVMTransaction.Proof calldata transaction) external view returns (bool);
}

interface IMinterFtso {
  function ownerFreeMint(
    string memory _domainName,
    address _domainHolder
  ) external returns(uint256 tokenId);
}

interface IUsedTxsRegistry {
  function isTxHashUsed(string memory _txHash) external view returns (bool);
  function setTxHashUsed(string memory _txHash) external;
}

contract MinterFdcFlare is OwnableWithManagers {
  address internal constant FLARE_CONTRACT_REGISTRY_ADDRESS = 0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019;
  address public minterAddress;
  address public usedTxsRegistryAddress;

  // CONSTRUCTOR
  constructor(address _minterAddress) {
    minterAddress = _minterAddress;
  }

  // READ
  function isEVMTransactionProofValid(IEVMTransaction.Proof calldata transaction) public view returns (bool) {
    // verify that this transaction was proved by data connector attestators
    return 
      IFdcVerification(
        IContractRegistry(FLARE_CONTRACT_REGISTRY_ADDRESS).getContractAddressByName("FdcVerification")
      ).verifyEVMTransaction(transaction);
  }

  // OWNER or MANAGER
  function setMinterAddress(address _minterAddress) external onlyManagerOrOwner {
    minterAddress = _minterAddress;
  }

  function setUsedTxsRegistryAddress(address _usedTxsRegistryAddress) external onlyManagerOrOwner {
    usedTxsRegistryAddress = _usedTxsRegistryAddress;
  }

  function validateProofAndMintDomain(
    IEVMTransaction.Proof calldata _transaction,
    address _domainHolder,
    string memory _domainName
  ) external onlyManagerOrOwner {
    require(isEVMTransactionProofValid(_transaction), "Invalid transaction proof");

    bytes memory txHash = abi.encodePacked(abi.encodePacked(_transaction.data.sourceId), "-", abi.encodePacked(_transaction.data.requestBody.transactionHash));
    require(!IUsedTxsRegistry(usedTxsRegistryAddress).isTxHashUsed(string(txHash)), "Transaction already used");
    IUsedTxsRegistry(usedTxsRegistryAddress).setTxHashUsed(string(txHash));

    IMinterFtso(minterAddress).ownerFreeMint(_domainName, _domainHolder);
  }
  
}
