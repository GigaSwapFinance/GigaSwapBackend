import Contract from './contract.js'
import { CONTRACTS } from '../consts/contracts.js'
import { getChainById } from '../consts/chains.js'
import Web3 from 'web3'
import axios from 'axios'

class NftService {
  constructor(chainId, tokenAddress) {
    const contractAbi = CONTRACTS.erc721.abi
    const provider = getChainById(chainId).providers.http

    this.address = tokenAddress
    this.chainId = chainId
    this.contract = new Contract(
      tokenAddress,
      contractAbi,
      provider,
    )
    this.provider = provider
    this.web3 = new Web3(this.provider)
  }

  async getNftBalance(address) {
    const currentBlock = await this.web3.eth.getBlockNumber()

    const [inEvents, outEvents] = await Promise.all([
      this.contract.getPastEvents('Transfer', { fromBlock: currentBlock - 500, toBlock: 'latest', filter: { to: address }}),
      this.contract.getPastEvents('Transfer', { fromBlock: currentBlock - 500, toBlock: 'latest', filter: { from: address }}),
    ])

    // console.log('11', currentBlock - 1000)
    // console.log({ inEvents, outEvents })

    const inBlocks = {}
    const outBlocks = {}
    const tokenIds = []

    for (let event of inEvents) {
      inBlocks[event.returnValues?.tokenId] = event.blockNumber
    }

    for (let event of outEvents) {
      outBlocks[event.returnValues?.tokenId] = event.blockNumber
    }

    for (let [tokenId, inBlockNumber] of Object.entries(inBlocks)) {
      const outBlockNumber = outBlocks[tokenId]

      if (!outBlockNumber) {
        tokenIds.push(tokenId)
        continue
      }

      if (inBlockNumber > outBlockNumber) {
        tokenIds.push(tokenId)
      }
    }

    return tokenIds.map(tokenId => ({
      owner: address,
      metadata: {},
      id: Number(tokenId),
    }))
  }

  async getNftCollection() {
    const [
      name,
      symbol,
      ownerOf,
    ] = await Promise.all([
      this.contract.call('name'),
      this.contract.call('symbol'),
    ])

    let token = {
      name,
      symbol,
      address: this.address,
      logoURI: '',
      type: 'ERC721',
    }

    return token
  }

  async getNftById(tokenId) {
    const tokenUri = await this.contract.call('tokenURI', [tokenId])
    const owner = await this.contract.call('ownerOf', [tokenId])
    const metadata = await this.getNftMetadata(tokenUri)

    let token = {
      owner,
      metadata,
      id: Number(tokenId),
    }

    return token
  }

  async getNftMetadata(tokenUri){
    let result = {}

    if (tokenUri.startsWith('https://')) {
      try {
        const { data } = await axios.get(tokenUri)
        result = data
      } catch (_) {
        //
      }
    }

    return result
  }
}

export default NftService