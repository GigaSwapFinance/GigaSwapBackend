import mongoose from 'mongoose'

const assetType = {
  name: {
    type: String,
    required: true,
  },

  symbol: {
    type: String,
    required: true,
  },

  address: {
    type: String,
  },

  decimals: {
    type: Number,
  },

  type: {
    type: String,
  },

  logoURI: {
    type: String,
  },
}

const schema = new mongoose.Schema({
  id: {
    type: Number,
  },

  blockchainId: {
    type: Number,
    required: true,
  },

  asset: assetType,

  amount: {
    type: String,
    required: true,
  },

  amountToWithdraw: {
    type: String,
    required: true,
  },

  owner: {
    type: String,
    required: true,
  },

  chainId: {
    type: String,
    required: true,
  },

  unlockDate: {
    type: Number,
    required: true,
  },

  nextUnlockDate: {
    type: Number,
  },
}, {
  toJSON: {
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
    }
  }
})

schema.pre('validate', async function(next) {
  if (this.isNew) {
    this.id = await Lock.countDocuments() + 1
  }

  next()
})

const Lock = mongoose.model('Lock', schema)

export default Lock