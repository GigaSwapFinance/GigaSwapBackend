import { getContractsByChainId } from './consts/contracts.js'
import { CronJob } from 'cron'
import Const from './models/const.js'
import { CHAINS } from './consts/chains.js'
import Web3 from 'web3'
import Trade from './services/trade.js'
import Direct from './services/direct.js'
import Lock from './services/lock.js'

function startMonitoring() {
  const job = new CronJob('*/20 * * * * *', monitorAllChains)

  monitorAllChains()
  job.start()
}

async function monitorAllChains() {
  for (let chain of CHAINS) {
    fetchEvents(chain)
  }
}

async function fetchEvents(chain) {
  try {
    const web3 = new Web3(chain.providers.http)
    const contracts = getContractsByChainId(chain.id)

    const saleContract = new web3.eth.Contract(contracts.erc20Sale.abi, contracts.erc20Sale.address)
    const directContract = new web3.eth.Contract(contracts.dealsController.abi, contracts.dealsController.address)
    const lockerContract = new web3.eth.Contract(contracts.erc20Locker.abi, contracts.erc20Locker.address)

    const constKey = `${chain.id}-last-block-number`
    const lastBlockNumber = await Const.findOne({ key: constKey })
    let currentBlockNumber = await web3.eth.getBlockNumber()

    const prevBlockNumber = lastBlockNumber?.value

    if (currentBlockNumber - prevBlockNumber > 75) {
      currentBlockNumber = prevBlockNumber + 75
    }

    if (!prevBlockNumber) {
      return Const.create({ key: constKey, value: currentBlockNumber })
    }

    if (prevBlockNumber === currentBlockNumber || prevBlockNumber > currentBlockNumber) {
      return
    }

    const createDirectEvents = await directContract.getPastEvents('NewDeal', { fromBlock: prevBlockNumber, toBlock: currentBlockNumber })
    const withdrawDirectEvents = await directContract.getPastEvents('OnWithdraw', { fromBlock: prevBlockNumber, toBlock: currentBlockNumber })
    const executeDirectEvents = await directContract.getPastEvents('Execute', { fromBlock: prevBlockNumber, toBlock: currentBlockNumber })
    const swapDirectEvents = await directContract.getPastEvents('Swap', { fromBlock: prevBlockNumber, toBlock: currentBlockNumber })

    const buyEvents = await saleContract.getPastEvents('OnBuy', { fromBlock: prevBlockNumber, toBlock: currentBlockNumber })
    const createEvents = await saleContract.getPastEvents('OnCreate', { fromBlock: prevBlockNumber, toBlock: currentBlockNumber })
    const withdrawEvents = await saleContract.getPastEvents('OnWithdraw', { fromBlock: prevBlockNumber, toBlock: currentBlockNumber })
    const priceEvents = await saleContract.getPastEvents('OnPrice', { fromBlock: prevBlockNumber, toBlock: currentBlockNumber })

    const lockCreateEvents = await lockerContract.getPastEvents('OnLockPosition', { fromBlock: prevBlockNumber, toBlock: currentBlockNumber })
    const lockWithdrawEvents = await lockerContract.getPastEvents('OnWithdraw', { fromBlock: prevBlockNumber, toBlock: currentBlockNumber })

    const saleEvents = [...buyEvents, ...createEvents, ...withdrawEvents, ...priceEvents]
    const directEvents = [...createDirectEvents, ...withdrawDirectEvents, ...executeDirectEvents, ...swapDirectEvents]
    const lockerEvents = [...lockCreateEvents, ...lockWithdrawEvents]

    console.log(
      `${chain.id}: ${prevBlockNumber} to ${currentBlockNumber}`,
      { saleEvents, directEvents, lockerEvents },
    )

    for (let event of saleEvents) {
      try {
        const trade = new Trade(chain.id)
        await trade.saveTrade(event.returnValues.positionId)
      } catch (e) {
        console.log(e)
      }
    }

    for (let event of directEvents) {
      try {
        const direct = new Direct(chain.id)
        await direct.saveTrade(event.returnValues.dealId, event.event)
      } catch (e) {
        console.log(e)
      }
    }

    for (let event of lockerEvents) {
      try {
        const lock = new Lock(chain.id)
        await lock.savePosition(event.returnValues.id)
      } catch (e) {
        console.log(e)
      }
    }

    await Const.updateOne({ key: constKey }, { value: currentBlockNumber })
  } catch (e) {
    console.log(`Error for chain ${chain.id}`, e)
  }
}

startMonitoring()