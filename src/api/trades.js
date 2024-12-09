import app from './index.js'
import Trade from '../models/trade.js'
import TradeService from '../services/trade.js'
import DirectService from '../services/direct.js'

app.get('/:chainId/trades', async (req, res) => {
  try {
    const chainId = req.params.chainId

    let trades = await Trade.find({ chainId })

    trades = trades
      .filter(trade => Number(trade.count1) > 0 && trade.state !== 'withdrawn' && !trade.whitelistedAddresses.length)
      // .filter(trade => ['created', ''].includes(trade.state))

    res.json(trades)
  } catch (_) {
    res.json(null)
  }
})

app.get('/trades/:id', async (req, res) => {
  try {
    const tradeId = req.params.id

    if (!tradeId) {
      return res.json({})
    }

    const trade = await Trade.findOne({ id: tradeId })

    res.json(trade.toJSON())
  } catch (_) {
    res.json(null)
  }
})

app.get('/trades/:id/update', async (req, res) => {
  try {
    const tradeId = req.params.id
    const trade = await Trade.findOne({ id: tradeId })

    // console.log({ trade, tradeId })

    if (!tradeId || !trade) {
      return res.json(null)
    }

    if (trade.type === 'fractional') {
      const tradeService = new TradeService(trade.chainId)
      res.json(await tradeService.saveTrade(trade.blockchainId))
    } else {
      const tradeService = new DirectService(trade.chainId)
      res.json(await tradeService.saveTrade(trade.blockchainId))
    }
  } catch (e) {
    console.error(e)
    res.json(null)
  }
})

app.get('/:chainId/trades/update-last-trade', async (req, res) => {
  try {
    const chainId = req.params.chainId
    const tradeService = new TradeService(chainId)

    const lastTradeId = await tradeService.getLastTradeId()

    let trade = null

    if (lastTradeId) {
      trade = await tradeService.saveTrade(lastTradeId)
    }

    res.json(trade)
  } catch (e) {
    // res.json(null)
  }
})

app.get('/:chainId/trades/:ownerAddress', async (req, res) => {
  try {
    const chainId = req.params.chainId
    const ownerAddress = req.params.ownerAddress

    let trades = await Trade.find({ chainId, owner: ownerAddress })
    let partnerTrades = await Trade.find({ chainId, whitelistedAddresses: ownerAddress })

    trades = trades
      .concat(partnerTrades)
      .filter(trade => (Number(trade.count1) > 0 || Number(trade.count2) > 0) && trade.state !== 'withdrawn')
    // .filter(trade => ['created', ''].includes(trade.state))

    res.json(trades)
  } catch (_) {
    res.json(null)
  }
})

// direct

app.get('/:chainId/direct/update-last-trade', async (req, res) => {
  try {
    const chainId = req.params.chainId
    const tradeService = new DirectService(chainId)

    const lastTradeId = await tradeService.getLastTradeId()

    if (!lastTradeId) {
      res.json(null)
    }

    const trade = await tradeService.saveTrade(lastTradeId)

    res.json(trade)
  } catch (e) {
    console.error(e)
    res.json(null)
  }
})