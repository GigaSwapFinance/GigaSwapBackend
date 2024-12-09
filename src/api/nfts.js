import app from './index.js'
import NftService from '../services/nft.js'

app.get('/:chainId/nfts/:tokenAddress/balance/:address', async (req, res) => {
  try {
    const chainId = req.params.chainId
    const tokenAddress = req.params.tokenAddress
    const userAddress = req.params.address
    const nftService = new NftService(chainId, tokenAddress)

    if (!tokenAddress || !userAddress) {
      return res.json(null)
    }

    const nfts = await nftService.getNftBalance(userAddress)

    res.json(nfts)
  } catch (_) {
    res.json(null)
  }
})

app.get('/:chainId/nfts/:tokenAddress/:tokenId', async (req, res) => {
  try {
    const chainId = req.params.chainId
    const tokenAddress = req.params.tokenAddress
    const tokenId = req.params.tokenId
    const nftService = new NftService(chainId, tokenAddress)

    if (!tokenAddress || !tokenId) {
      return res.json(null)
    }

    const nft = await nftService.getNftById(tokenId)

    res.json(nft)
  } catch (_) {
    res.json(null)
  }
})

app.get('/:chainId/nfts/:address', async (req, res) => {
  try {
    const chainId = req.params.chainId
    const tokenAddress = req.params.address
    const nftService = new NftService(chainId, tokenAddress)

    if (!tokenAddress) {
      return res.json(null)
    }

    const token = await nftService.getNftCollection(tokenAddress)

    res.json(token)
  } catch (_) {
    res.json(null)
  }
})