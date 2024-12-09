import app from './index.js'
import Lock from '../models/lock.js'

app.get('/:chainId/locks/:ownerAddress', async (req, res) => {
  try {
    const chainId = req.params.chainId
    const ownerAddress = req.params.ownerAddress

    let locks = await Lock.find({ chainId, owner: ownerAddress })

    locks = locks.filter(lock => Number(lock.amountToWithdraw) > 0)

    res.json(locks)
  } catch (_) {
    res.json(null)
  }
})