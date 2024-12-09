import Contract from './contract.js'
import { CONTRACTS } from '../consts/contracts.js'
import TokenService from './token.js'
import Trade from '../models/trade.js'
import CONTRACT_ADDRESSES from '../assets/contract-addresses/index.js'
import { getChainById } from '../consts/chains.js'
import Web3 from 'web3'


class TradeService {
  constructor(chainId) {
    const contractAddress = CONTRACT_ADDRESSES[chainId].Erc20Sale
    const contractAbi = CONTRACTS.erc20Sale.abi
    const provider = getChainById(chainId).providers.http

    this.address = contractAddress
    this.chainId = chainId
    this.contract = new Contract(
      contractAddress,
      contractAbi,
      provider,
    )
    this.provider = provider
    this.web3 = new Web3(this.provider)
  }

  async getTradeById(tradeId) {
    return this.contract.call('getPosition', [tradeId])
  }

  async getBuyLimit(tradeId) {
    return this.contract.call('getBuyLimit', [tradeId])
  }

  async getLockSettings(tradeId) {
    return this.contract.call('getPositionLockSettings', [tradeId])
  }

  async getLastTradeId() {
    const currentBlockNumber = await this.web3.eth.getBlockNumber()

    const events = await this.contract.getPastEvents('OnCreate', {
      fromBlock: currentBlockNumber - 1000,
      toBlock: currentBlockNumber,
    })

    if (!events.length) {
      return null
    }

    const latestEvent = events[events.length - 1]
    const tradeId = latestEvent.returnValues?.positionId

    return tradeId
  }

  async saveTrade(tradeId) {
    let newTrade = {
      blockchainId: Number(tradeId)
    }

    const [
      tradeData,
      buyLimit,
      lockSettings,
    ] = await Promise.all([
      this.getTradeById(tradeId),
      this.getBuyLimit(tradeId),
      this.getLockSettings(tradeId)
    ])

    if (tradeData.owner.startsWith('0x00000000')) {
      return null
    }

    const token1Service = new TokenService(this.chainId, tradeData.asset1)
    const token2Service = new TokenService(this.chainId, tradeData.asset2)

    const asset1 = await token1Service.getToken()
    const asset2 = await token2Service.getToken()

    newTrade.asset1 = asset1
    newTrade.asset2 = asset2
    newTrade.owner = tradeData.owner
    newTrade.count1 = tradeData.count1
    newTrade.count2 = tradeData.count2
    newTrade.priceNom = tradeData.priceNom
    newTrade.priceDenom = tradeData.priceDenom
    newTrade.buyLimit = buyLimit
    newTrade.chainId = this.chainId
    newTrade.type = 'fractional'

    if (Number(lockSettings.receivePercent)) {
      newTrade.lockSettings = {
        releaseOnBuyPercent: lockSettings.receivePercent / 100,
        releaseOnUnlockPercent: lockSettings.unlockPercentByTime / 100,
        secondsToLock: lockSettings.lockTime,
      }
    }

    let trade = await Trade.findOne({ chainId: this.chainId, blockchainId: tradeId })

    if (trade) {
      trade = await Trade.findOneAndUpdate({ chainId: this.chainId, blockchainId: tradeId }, newTrade)
    } else {
      trade = await Trade.create(newTrade)
    }

    // console.log({ trade })

    return trade
  }
}

export default TradeService