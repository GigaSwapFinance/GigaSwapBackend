import Web3 from 'web3'

const provider = new Web3.providers.HttpProvider(`wss://rpc.ankr.com/eth_sepolia/ws/${process.env.ANKR_KEY}`)
const web3 = new Web3(provider)

web3.eth.transactionBlockTimeout = 250
web3.eth.transactionPollingTimeout = 2000

export default web3