import sepolia from './sepolia.json' assert { type: 'json' }
import ethereum from './ethereum.json' assert { type: 'json' }
import arbitrum from './arbitrum.json' assert { type: 'json' }
import polygon from './polygon.json' assert { type: 'json' }

const CONTRACT_ADDRESSES = {
  sepolia,
  ethereum,
  arbitrum,
  polygon,
}

export default CONTRACT_ADDRESSES