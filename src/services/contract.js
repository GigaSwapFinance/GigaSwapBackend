import web3 from './web3.js'

class Contract {
  constructor(contractAddress, contractAbi, providerUrl) {
    const contract = new web3.eth.Contract(contractAbi, contractAddress)
    contract.options.address = contractAddress

    this.contract = contract

    if (providerUrl) {
      this.contract.setProvider(providerUrl)
    }

    return this
  }

  async call(methodName, args = []) {
    return this.contract.methods[methodName](...args).call()
  }

  async getPastEvents(eventName, args = {}) {
    const result = await this.contract.getPastEvents(eventName, args)

    return result
  }
}

export default Contract