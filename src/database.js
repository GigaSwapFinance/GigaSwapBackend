import mongoose from 'mongoose'

mongoose
  .connect(process.env.DATABASE_CONNECTION_URL, {})
  .then(() => console.log(`Connected to DB via URL ${process.env.DATABASE_CONNECTION_URL}`))