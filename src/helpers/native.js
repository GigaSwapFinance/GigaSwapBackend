export function getNativeToken() {
  return {
    type: 'currency',
    symbol: 'ETH',
    name: 'Ethereum',
    logoURI: '/images/currencies/eth.svg',
    decimals: 18,
    address: '0x0000000000000000000000000000000000000000'
  }
}