import { CONTRACTS } from '../consts/contracts.js'
import Contract from './contract.js'
import { getTokenMetadataByAddress, getTokenPriceByAddress } from '../helpers/coingecko.js'
import Web3 from 'web3'
import TOKENS from '../assets/tokens/index.js'
import { getChainById } from '../consts/chains.js'

class TokenService {
  constructor(chainId, tokenAddress) {
    const contractAbi = CONTRACTS.erc20.abi
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

  async getToken() {
    const [
      name,
      symbol,
      decimals,
    ] = await Promise.all([
      this.contract.call('name'),
      this.contract.call('symbol'),
      this.contract.call('decimals'),
    ])

    let token = {
      name,
      symbol,
      decimals,
      address: this.address,
      logoURI: '',
      type: 'ERC20',
    }

    // only mainnet
    const tokenMetadata = await getTokenMetadataByAddress(this.address)

    if (tokenMetadata) {
      // console.log('metadata ' + this.address, tokenMetadata)
      token.logoURI = tokenMetadata.image?.large
    }

    const foundToken = TOKENS[this.chainId].find(token => token.address.toLowerCase() === this.address.toLowerCase())

    if (foundToken) {
      token.logoURI = foundToken.logoURI
    }

    return token
  }

  async getTokenPrice() {
    return getTokenPriceByAddress(this.address)
  }
}

export default TokenService