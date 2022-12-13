const InfuraKey = process.env.MM_INFURA_PROJECT_ID;
const infuraProjectId = InfuraKey === 'null' ? '' : InfuraKey;

const PopularList = [
  {
    chainId: '5727',
    nickname: 'NXTChain Network',
    rpcUrl: 'https://rpc.nxttechnologies.io/',
    ticker: 'NXT',
    rpcPrefs: {
      blockExplorerUrl: 'https://nxtscan.com',
      imageUrl: 'NXT',
    },
  },
  {
    chainId: '56',
    nickname: 'BNB Smart Chain',
    rpcUrl: 'https://bsc-dataseed1.binance.org',
    ticker: 'BNB',
    rpcPrefs: {
      blockExplorerUrl: 'https://bscscan.com',
      imageUrl: 'BNB',
    },
  },
  {
    chainId: '1',
    nickname: 'Ethereum',
    rpcUrl: 'https://rpc.flashbots.net',
    ticker: 'ETH',
    rpcPrefs: {
      blockExplorerUrl: 'https://etherscan.io',
      imageUrl: 'ETHEREUM',
    },
  },
];

export default PopularList;
