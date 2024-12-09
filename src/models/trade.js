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

  type: {
    type: String,
    default: 'fractional',
  },

  state: {
    type: String,
    default: 'created', // states: ['created', 'waiting_for_partner', 'executed', 'swapped', 'withdrawn']
  },

  asset1: assetType,

  asset2: assetType,

  count1: {
    type: String,
    required: true,
  },

  count2: {
    type: String,
    required: true,
  },

  owner: {
    type: String,
    required: true,
  },

  whitelistedAddresses: {
    type: Array,
    default: () => ([]),
  },

  buyLimit: {
    type: String,
    default: () => null,
  },

  lockSettings: {
    type: Object,
  },

  priceNom: {
    type: String,
  },

  priceDenom: {
    type: String,
  },

  chainId: {
    type: String,
    required: true,
  },

  dealPoints: {
    type: Array,
  },

  createdAt: {
    type: Number,
    default: Date.now(),
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
    this.id = await Trade.countDocuments() + 1
  }

  next()
})

const Trade = mongoose.model('Trade', schema)

export default Trade