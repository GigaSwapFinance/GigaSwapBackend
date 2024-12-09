import app from './index.js'
import TokenService from '../services/token.js'
import { getCurrencyPrice } from '../helpers/coingecko.js'

app.get('/:chainId/tokens/price', async (req, res) => {
  try {
    const chainId = req.params.chainId

    const price = await getCurrencyPrice()

    // console.log({ price })

    res.json(price)
  } catch (_) {
    res.json(null)
  }
})

app.get('/:chainId/tokens/:address', async (req, res) => {
  try {
    const chainId = req.params.chainId
    const tokenAddress = req.params.address
    const tokenService = new TokenService(chainId, tokenAddress)

    if (!tokenAddress) {
      return res.json(null)
    }

    const token = await tokenService.getToken()

    console.log({ token })

    res.json(token)
  } catch (_) {
    res.json(null)
  }
})

app.get('/:chainId/tokens/:address/price', async (req, res) => {
  try {
    const chainId = req.params.chainId
    const tokenAddress = req.params.address
    const tokenService = new TokenService(chainId, tokenAddress)

    if (!tokenAddress) {
      return res.json(null)
    }

    const price = await tokenService.getTokenPrice()

    res.json(price)
  } catch (_) {
    res.json(null)
  }
})