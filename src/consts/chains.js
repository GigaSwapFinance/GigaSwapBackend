export const CHAINS = [
  {
    id: 'sepolia',
    providers: {
      wss: `wss://rpc.ankr.com/eth_sepolia/ws/${process.env.ANKR_KEY}`,
      http: `https://rpc.ankr.com/eth_sepolia/${process.env.ANKR_KEY}`,
    },
  },

  {
    id: 'ethereum',
    providers: {
      wss: `wss://rpc.ankr.com/eth/ws/${process.env.ANKR_KEY}`,
      http: `https://rpc.ankr.com/eth/${process.env.ANKR_KEY}`,
    },
  },

  {
    id: 'arbitrum',
    providers: {
      wss: `wss://rpc.ankr.com/arbitrum/ws/${process.env.ANKR_KEY}`,
      http: `https://rpc.ankr.com/arbitrum/${process.env.ANKR_KEY}`,
    },
  },

  {
    id: 'polygon',
    providers: {
      wss: `wss://rpc.ankr.com/polygon_zkevm/ws/${process.env.ANKR_KEY}`,
      http: `https://rpc.ankr.com/polygon_zkevm/${process.env.ANKR_KEY}`,
    },
  }
]

export function getChainById(chainId) {
  return CHAINS.find(chain => chain.id === chainId)
}