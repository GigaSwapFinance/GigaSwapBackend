import * as dotenv from 'dotenv'
dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

// console.log(process.env)

import('./database.js')
import('./api/index.js')
import('./monitoring.js')
