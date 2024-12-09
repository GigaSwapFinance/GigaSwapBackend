import Contract from './contract.js'
import { CONTRACTS } from '../consts/contracts.js'
import TokenService from './token.js'
import CONTRACT_ADDRESSES from '../assets/contract-addresses/index.js'
import { getChainById } from '../consts/chains.js'
import Web3 from 'web3'
import Lock from '../models/lock.js'

class LockService {
  constructor(chainId) {
    const provider = getChainById(chainId).providers.http

    this.provider = provider
    this.web3 = new Web3(this.provider)
    this.chainId = chainId

    const lockerAddress = CONTRACT_ADDRESSES[chainId].Erc20Locker
    const lockerAbi = CONTRACTS.erc20Locker.abi

    this.lockerAddress = lockerAddress
    this.lockerContract = new Contract(lockerAddress, lockerAbi, provider)
  }

  async getPositionById(lockerPositionId) {
    return this.lockerContract.call('position', [lockerPositionId])
  }

  async getUnlockDate(lockerPositionId) {
    return this.lockerContract.call('unlockAllTime', [lockerPositionId])
  }

  async getNextUnlockDate(lockerPositionId) {
    return this.lockerContract.call('unlockTime', [lockerPositionId])
  }

  async getRemainingAmount(lockerPositionId) {
    return this.lockerContract.call('remainingTokensToWithdraw', [lockerPositionId])
  }

  async savePosition(lockerPositionId) {
    let newPosition = {
      blockchainId: Number(lockerPositionId)
    }

    const positionData = await this.getPositionById(lockerPositionId)
    const positionOwnerAddress = positionData.withdrawer
    const tokenAddress = positionData.token
    const unlockDate = await this.getUnlockDate(lockerPositionId)
    const nextUnlockDate = await this.getNextUnlockDate(lockerPositionId)
    const amountToWithdraw = await this.getRemainingAmount(lockerPositionId)

    const tokenService = new TokenService(this.chainId, tokenAddress)
    const token = await tokenService.getToken()

    newPosition.asset = token
    newPosition.chainId = this.chainId
    newPosition.amount = positionData.count
    newPosition.amountToWithdraw = amountToWithdraw
    newPosition.owner = positionOwnerAddress
    newPosition.unlockDate = Number(unlockDate) * 1000
    newPosition.nextUnlockDate = nextUnlockDate === unlockDate ? null : Number(nextUnlockDate) * 1000

    let lock = await Lock.findOne({
      chainId: this.chainId,
      blockchainId: lockerPositionId,
    })

    if (lock) {
      lock = await Lock.findOneAndUpdate({
        chainId: this.chainId,
        blockchainId: lockerPositionId,
      }, newPosition)
    } else {
      lock = await Lock.create(newPosition)
    }

    // console.log({ lock })

    return lock
  }
}

export default LockService