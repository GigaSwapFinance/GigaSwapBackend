import axios from 'axios'

const BASE_URL = 'https://pro-api.coingecko.com/api/v3'
const KEY = process.env.CONGECKO_KEY

async function request(url, params = {}) {
  const { data } = await axios.get(BASE_URL + url + '?x_cg_pro_api_key=' + KEY, {
    params: params,
  })
  return data
}

export async function getTokenMetadataByAddress(tokenAddress) {
  let tokenData = null

  try {
    tokenData = await request(`/coins/ethereum/contract/${tokenAddress}`)
  } catch (e) {
    // console.error('Getting token data from coingecko by address error', e)
  }

  return tokenData
}

export async function getTokenInfoByAddress(tokenAddress) {
  let tokenData = null

  const chain = {
    1: 'ethereum',
  }

  try {
    tokenData = await request(`/coins/${chain[1]}/contract/${tokenAddress}`)
  } catch (e) {
    // console.error('Getting token data from coingecko by address error', e)
  }

  return tokenData
}

export async function getCurrencyPrice(id = 'ethereum') {
  let tokenPrice = null

  try {
    tokenPrice = await request(`/simple/price`, {
      ids: id,
      vs_currencies: 'usd'
    })
  } catch (e) {
    // console.error('Getting token data from coingecko by address error', e)
  }

  return tokenPrice.ethereum.usd
}

export async function getTokenPriceByAddress(tokenAddress) {
  const tokenData = await getTokenInfoByAddress(tokenAddress)
  return tokenData?.market_data?.current_price?.usd
}