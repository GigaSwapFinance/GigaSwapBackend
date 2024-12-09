import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },

  value: {
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

const Const = mongoose.model('Const', schema)

export default Const