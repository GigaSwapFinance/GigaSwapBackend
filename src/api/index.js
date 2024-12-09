import express from 'express'
import cors from 'cors'
const app = express()

app.use(cors())
app.get('/', (req, res) => res.send('🤝 GigaSwap Server'))

import('./trades.js')
import('./tokens.js')
import('./nfts.js')
import('./locks.js')

app.listen(3000, () => console.log('Server started on port 3000'))

export default app