import Contract from './contract.js'
import { CONTRACTS } from '../consts/contracts.js'
import TokenService from './token.js'
import Trade from '../models/trade.js'
import CONTRACT_ADDRESSES from '../assets/contract-addresses/index.js'
import { getChainById } from '../consts/chains.js'
import Web3 from 'web3'
import NftService from './nft.js'
import { getNativeToken } from '../helpers/native.js'

class DirectService {
  constructor(chainId) {
    const provider = getChainById(chainId).providers.http

    this.provider = provider
    this.web3 = new Web3(this.provider)
    this.chainId = chainId

    const factoryContractAddress = CONTRACT_ADDRESSES[chainId].DealsFactory
    const factoryContractAbi = CONTRACTS.direct.abi

    this.factoryAddress = factoryContractAddress
    this.factoryContract = new Contract(factoryContractAddress, factoryContractAbi, provider)

    const controllerContractAddress = CONTRACT_ADDRESSES[chainId].GigaSwap
    const controllerContractAbi = CONTRACTS.dealsController.abi

    this.controllerAddress = factoryContractAddress
    this.controllerContract = new Contract(controllerContractAddress, controllerContractAbi, provider)
  }

  async getTradeById(tradeId) {
    return this.controllerContract.call('getDeal', [tradeId])
  }

  async getIsExecuted(tradeId) {
    return this.controllerContract.call('isExecuted', [tradeId])
  }

  async getIsSwapped(tradeId) {
    return this.controllerContract.call('isSwapped', [tradeId])
  }

  async getLastTradeId() {
    const currentBlockNumber = await this.web3.eth.getBlockNumber()

    const events = await this.controllerContract.getPastEvents('NewDeal', {
      fromBlock: currentBlockNumber - 100,
      toBlock: currentBlockNumber,
    })

    if (!events.length) {
      return null
    }

    const latestEvent = events[events.length - 1]
    const tradeId = latestEvent.returnValues?.dealId

    return tradeId
  }

  async saveTrade(tradeId, eventName) {
    let newTrade = {
      blockchainId: Number(tradeId)
    }

    const tradeData = await this.getTradeById(tradeId)
    const tradeInfo = tradeData[0]
    const tradeAssets = tradeData[1]
    const tradeOwnerAddress = tradeInfo?.owner1
    const tradePartnerAddress = tradeInfo?.owner2

    const isExecuted = await this.getIsExecuted(tradeId)
    const isSwapped = await this.getIsSwapped(tradeId)
    let isOwnerExecuted = false
    let isPartnerExecuted = false
    let isOwnerWithdrawn = false
    let isPartnerWithdrawn = false

    if (
      tradeInfo?.owner1?.startsWith('0x00000000')
      && tradeInfo?.owner2?.startsWith('0x00000000')
    ) {
      return null
    }

    if (!tradePartnerAddress.startsWith('0x00000000')) {
      newTrade.whitelistedAddresses = [tradePartnerAddress]
    }

    // console.log({ tradeInfo })

    for (let asset of tradeAssets) {
      const type = asset.dealPointTypeId
      const fromAddress = asset.from
      const toAddress = asset.to
      const tokenAddress = asset.tokenAddress
      const value = asset.value
      const isOwnersAsset = fromAddress.toLowerCase() === tradeOwnerAddress.toLowerCase()
      let isExecuted = asset.isExecuted
      let isWithdrawn = Number(asset.balance) === 0

      let token

      if (type === '1') {
        token = getNativeToken()
      } else if (type === '2') {
        const tokenService = new TokenService(this.chainId, tokenAddress)
        token = await tokenService.getToken()
      } else if (type === '3') {
        const tokenService = new NftService(this.chainId, tokenAddress)
        token = await tokenService.getNftCollection()
      }

      if (isOwnersAsset) {
        newTrade.asset1 = token
        newTrade.count1 = value
        isOwnerExecuted = isExecuted
        isOwnerWithdrawn = isSwapped && isWithdrawn
      } else {
        newTrade.asset2 = token
        newTrade.count2 = value
        isPartnerExecuted = isExecuted
        isPartnerWithdrawn = isSwapped && isWithdrawn
      }

      // console.log({
      //   type,
      //   fromAddress,
      //   toAddress,
      //   tokenAddress,
      //   value,
      // })
    }

    let tradeState = 'created'

    // states
    // 1 - created, not executed by owner
    // 2 - executed by owner
    // 3 - executed by partner, not swapped
    // 4 - swapped
    // 5 - withdrawn by owner
    // 6 - withdraw by partner

    // states: ['created', 'waiting_for_partner', 'executed', 'swapped', 'withdrawn']

    if (isOwnerWithdrawn && isPartnerWithdrawn) {
      tradeState = 'withdrawn'
    } else if (isSwapped) {
      tradeState = 'swapped'
    } else if (isPartnerExecuted && isOwnerExecuted) {
      tradeState = 'executed'
    } else if (isOwnerExecuted) {
      tradeState = 'waiting_for_partner'
    } else {
      tradeState = 'created'
    }

    newTrade.owner = tradeOwnerAddress
    newTrade.chainId = this.chainId
    newTrade.type = 'direct'
    newTrade.state = tradeState
    newTrade.dealPoints = tradeAssets.map(point => ({
      owner: point.owner,
      isSwapped: point.isSwapped,
      isExecuted: point.isExecuted,
      isWithdrawn: Number(point.balance) === 0,
      tokenAddress: point.tokenAddress,
      value: point.value,
      typeId: point.dealPointTypeId,
    }))

    // console.log({ tradeState, eventName })

    if (tradeState === 'created' && eventName === 'OnWithdraw') {
      return Trade.updateOne(
        {
          chainId: this.chainId,
          blockchainId: tradeId,
          type: 'direct',
        },
        {
          state: 'withdrawn',
        }
      )
    }

    let trade = await Trade.findOne({
      chainId: this.chainId,
      blockchainId: tradeId,
      type: 'direct',
    })

    if (trade) {
      trade = await Trade.findOneAndUpdate({
        chainId: this.chainId,
        blockchainId: tradeId,
        type: 'direct'
      }, newTrade)
    } else {
      trade = await Trade.create(newTrade)
    }

    return trade
  }
}

export default DirectService