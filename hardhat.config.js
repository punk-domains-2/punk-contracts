require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require('@openzeppelin/hardhat-upgrades');
require('dotenv').config();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: 'hardhat',

  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545/',
      chainId: 31337
    },
    arbitrumOne: {
      //url: 'https://arb-mainnet.g.alchemy.com/v2/' + process.env.ALCHEMY_API_KEY_ARBITRUM,
      url: "https://arb1.arbitrum.io/rpc",
      chainId: 42161,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gas: "auto", // gas limit
      gasPrice: 1000000000, // 1 gwei
    },
    arbitrumGoerli: {
      url: 'https://goerli-rollup.arbitrum.io/rpc',
      chainId: 421613,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gas: "auto", // gas limit
      gasPrice: 1000000000, // 1 gwei
    },
    arbitrumTestnet: {
      url: 'https://rinkeby.arbitrum.io/rpc',
      chainId: 421611,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gas: "auto", // gas limit
      gasPrice: 1000000000, // 1 gwei
    },
    aurora: {
      url: 'https://mainnet.aurora.dev',
      chainId: 1313161554,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gas: "auto", // gas limit
      gasPrice: 1000000000, // 1 gwei
    },
    auroraTestnet: {
      url: 'https://testnet.aurora.dev',
      chainId: 1313161555,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gas: "auto", // gas limit
      gasPrice: 1000000000, // 1 gwei
    },
    base: {
      url: 'https://mainnet.base.org', // https://base-mainnet.public.blastapi.io
      chainId: 8453,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gas: "auto", // gas limit
      gasPrice: 200000000, // 0.2 gwei
    },
    baseTestnet: {
      url: 'https://base-goerli.public.blastapi.io',
      chainId: 84531,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gas: "auto", // gas limit
      gasPrice: 1000000000, // 1 gwei
    },
    bsc: { // BNB Smart Chain mainnet
      url: 'https://bscrpc.com',
      chainId: 56,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gas: "auto", // gas limit
      gasPrice: 5000000000, // 5 gwei
    },
    flare: { // Flare mainnet
      url: 'https://flare-api.flare.network/ext/C/rpc',
      chainId: 14,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gas: "auto", // gas limit
      gasPrice: 75000000000, // 75 gwei
    },
    flareCoston: { // Flare Coston Testnet
      url: 'https://coston-api.flare.network/ext/bc/C/rpc',
      chainId: 16,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gas: "auto", // gas limit
      gasPrice: 25000000000, // 25 gwei
    },
    ftmTestnet: { // Fantom testnet
      url: "https://rpc.ankr.com/fantom_testnet", //'https://rpc.testnet.fantom.network',
      chainId: 4002,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gas: "auto", // gas limit
      gasPrice: 2000000000, // 1 gwei
    },
    mainnet: { // Ethereum
      url: 'https://eth-mainnet.g.alchemy.com/v2/' + process.env.ALCHEMY_API_KEY_ETHEREUM,
      chainId: 1,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gas: "auto", // gas limit
      gasPrice: 45000000000, // 10 gwei
    },
    mantleTestnet: { // Mantle testnet
      url: 'https://rpc.testnet.mantle.xyz', 
      chainId: 5001,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gas: "auto", // gas limit
      gasPrice: 1, // 1 wei
    },
    opera: { // Fantom mainnet
      url: 'https://rpc.ftm.tools', // "https://rpcapi.fantom.network", 
      chainId: 250,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gas: "auto", // gas limit
      gasPrice: 70000000000, // 70 gwei
    },
    optimisticEthereum: {
      url: 'https://opt-mainnet.g.alchemy.com/v2/' + process.env.ALCHEMY_API_KEY_OPTIMISM,
      chainId: 10,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gas: "auto", // gas limit
      gasPrice: 1000000000, // 1 gwei
    },
    optimisticGoerli: {
      url: 'https://goerli.optimism.io',
      chainId: 420,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gas: "auto", // gas limit
      gasPrice: 1000000000, // 1 gwei
    },
    optimisticKovan: {
      url: 'https://kovan.optimism.io',
      chainId: 69,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gas: "auto", // gas limit
      gasPrice: 1000000000, // 1 gwei
    },
    polygon: {
      //url: 'https://polygon-mainnet.g.alchemy.com/v2/' + process.env.ALCHEMY_API_KEY_POLYGON,
      url: 'https://1rpc.io/matic',
      chainId: 137,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gas: "auto", // gas limit
      gasPrice: 200000000000, // 100 gwei
    },
    polygonMumbai: {
      url: 'https://polygon-mumbai.g.alchemy.com/v2/' + process.env.ALCHEMY_API_KEY_MUMBAI,
      //url: 'https://matic-testnet-archive-rpc.bwarelabs.com', // https://matic-mumbai.chainstacklabs.com
      chainId: 80001,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gas: "auto", // gas limit
      gasPrice: 2000000000, // 2 gwei
    },
    polygonZkEvm: {
      url: 'https://zkevm-rpc.com',
      chainId: 1101,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gas: "auto", // gas limit
      gasPrice: 20000000000, // 20 gwei
    },
    polygonZkEvmTestnet: {
      url: 'https://rpc.public.zkevm-test.net',
      chainId: 1442,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gas: "auto", // gas limit
      gasPrice: 20000000000, // 20 gwei
    },
    sepolia: { // Sepolia testnet
      url: 'https://rpc2.sepolia.org',
      chainId: 11155111,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gas: "auto", // gas limit
      gasPrice: 1000000000, // 1 gwei
    },
    sokol: { // Gnosis Chain testnet
      url: 'https://sokol.poa.network',
      chainId: 77,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gas: "auto", // gas limit
      gasPrice: 40000000000, // 20 gwei
    },
    scroll: { // Scroll Mainnet
      url: 'https://rpc.scroll.io',
      chainId: 534352,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gas: "auto", // gas limit
      gasPrice: 1000000000, // 1 gwei
    },
    songbird: { // Songbird Mainnet
      url: 'https://songbird-api.flare.network/ext/C/rpc',
      chainId: 19,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gas: "auto", // gas limit
      gasPrice: 25000000000, // 25 gwei
    },
    taikoEldfell: { // Taiko Eldfell testnet (L3)
      url: 'https://rpc.l3test.taiko.xyz',
      chainId: 167006,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gas: "auto", // gas limit
      gasPrice: 1000000000, // 1 gwei
    },
    taikoGrimsvotn: { // Taiko Grimsvotn testnet (L2)
      url: 'https://rpc.test.taiko.xyz',
      chainId: 167005,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gas: "auto", // gas limit
      gasPrice: 1000000000, // 1 gwei
    },
    xdai: { // Gnosis Chain mainnet
      url: 'https://gnosischain-rpc.gateway.pokt.network',
      chainId: 100,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gas: "auto", // gas limit
      gasPrice: 20000000000, // 20 gwei
    }
  },

  etherscan: {
    apiKey: { // all possible key names here: https://gist.github.com/tempe-techie/95a3ad4e81b46c895928a0524fc2b7ac
      arbitrumOne: process.env.ARBISCAN_API_KEY,
      arbitrumTestnet: process.env.ARBISCAN_API_KEY,
      arbitrumGoerli: process.env.ARBISCAN_API_KEY,
      aurora: process.env.AURORASCAN_API_KEY,
      auroraTestnet: process.env.AURORASCAN_API_KEY,
      base: process.env.BASESCAN_API_KEY,
      baseTestnet: process.env.BASESCAN_API_KEY,
      bsc: process.env.BSC_API_KEY,
      flare: "randomstring",
      flareCoston: "randomstring",
      ftmTestnet: process.env.FTMSCAN_API_KEY,
      mainnet: process.env.ETHERSCAN_API_KEY,
      mantleTestnet: "randomstring",
      opera: process.env.FTMSCAN_API_KEY,
      optimisticEthereum: process.env.OPTIMISTIC_ETHERSCAN_API_KEY,
      optimisticGoerli: process.env.OPTIMISTIC_ETHERSCAN_API_KEY,
      optimisticKovan: process.env.OPTIMISTIC_ETHERSCAN_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY,
      polygonMumbai: process.env.POLYGONSCAN_API_KEY, 
      polygonZkEvm: process.env.POLYGONSCAN_ZKEVM_API_KEY, 
      polygonZkEvmTestnet: process.env.POLYGONSCAN_ZKEVM_API_KEY, 
      scroll: process.env.SCROLLSCAN_API_KEY,
      sepolia: process.env.ETHERSCAN_API_KEY,
      sokol: "randomstring",
      songbird: "randomstring",
      taikoEldfell: "randomstring",
      taikoGrimsvotn: "randomstring",
      xdai: process.env.GNOSISSCAN_API_KEY
    },
    customChains: [
      {
        network: "arbitrumGoerli",
        chainId: 421613,
        urls: {
          apiURL: "https://api-goerli.arbiscan.io/api",
          browserURL: "https://goerli.arbiscan.io"
        }
      },
      /* */
      {
        network: "base", // BaseScan (Etherscan)
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org"
        }
      },
      
      /* 
      {
        network: "base", // Blockscout
        chainId: 8453,
        urls: {
          apiURL: "https://base.blockscout.com/api",
          browserURL: "https://base.blockscout.com"
        }
      },
      */
      {
        network: "baseTestnet",
        chainId: 84531,
        urls: {
          apiURL: "https://base-goerli.blockscout.com/api", // "https://api-goerli.basescan.org/api",
          browserURL: "https://base-goerli.blockscout.com" // "https://goerli.basescan.org" 
        }
      },
      {
        network: "flare",
        chainId: 14,
        urls: {
          apiURL: "https://flare-explorer.flare.network/api",
          browserURL: "https://flare-explorer.flare.network"
        }
      },
      {
        network: "flareCoston",
        chainId: 16,
        urls: {
          apiURL: "https://coston-explorer.flare.network/api",
          browserURL: "https://coston-explorer.flare.network"
        }
      },
      {
        network: "mantleTestnet",
        chainId: 5001,
        urls: {
          apiURL: "https://explorer.testnet.mantle.xyz/api",
          browserURL: "https://explorer.testnet.mantle.xyz"
        }
      },
      {
        network: "optimisticGoerli",
        chainId: 420,
        urls: {
          apiURL: "https://api-goerli-optimism.etherscan.io/api",
          browserURL: "https://goerli-optimism.etherscan.io/"
        }
      },
      {
        network: "polygonZkEvm",
        chainId: 1101,
        urls: {
          apiURL: "https://zkevm.polygonscan.com/api",
          browserURL: "https://zkevm.polygonscan.com"
        }
      },
      {
        network: "polygonZkEvmTestnet",
        chainId: 1442,
        urls: {
          apiURL: "https://api-testnet-zkevm.polygonscan.com/api",
          browserURL: "https://testnet-zkevm.polygonscan.com"
        }
      },
      {
        network: "scroll",
        chainId: 534352,
        urls: {
          apiURL: "https://api.scrollscan.com/api",
          browserURL: "https://scrollscan.com/"
        }
      },
      {
        network: "songbird",
        chainId: 19,
        urls: {
          apiURL: "https://songbird-explorer.flare.network/api",
          browserURL: "https://songbird-explorer.flare.network/"
        }
      },
      {
        network: "taikoEldfell",
        chainId: 167006,
        urls: {
          apiURL: "https://explorer.l3test.taiko.xyz/api",
          browserURL: "https://explorer.l3test.taiko.xyz/"
        }
      },
      {
        network: "taikoGrimsvotn",
        chainId: 167005,
        urls: {
          apiURL: "https://explorer.test.taiko.xyz/api",
          browserURL: "https://explorer.test.taiko.xyz/"
        }
      },
      // Comment out the xdai object below to verify on Blockscout. Uncomment to verify on Gnosis Scan.
      {
        network: "xdai",
        chainId: 100,
        urls: {
          apiURL: "https://api.gnosisscan.io/api",
          browserURL: "https://gnosisscan.io"
        }
      }
    ]
  },

  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
  
};