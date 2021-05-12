const mongoose = require('mongoose')
const User = mongoose.model('User')

const TodoSchema = new mongoose.Schema({
  text: String,
  completed: {type: Boolean, default: false},
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
}, {timestamps: true})

TodoSchema.methods.toJSONFor = function(user){
  return {
    text: this.text,
    completed: this.completed,
  }
}

mongoose.model('Todo', TodoSchema)