const router = require('express').Router()
const mongoose = require('mongoose')
const User = mongoose.model('User')
const Todo = mongoose.model('Todo')
const auth = require('../auth')

router.get('/todo', auth.required, (req, res, next) => {
  const query = {}

  User.findOne({username: req.query.author})
  .then(result => {
    const author = result

    if(author) query.author = author._id

    return Promise.all([
      Todo.find(query).exec(),
      req.payload ? User.findById(req.payload.id) : null,
    ])
    .then(results => {
      const todoList = results[0]
      const user = results[1]

      return res.json({
        todoList: todoList.map(todo =>
          todo.toJSONFor(user)
        )
      })
    })
  }).catch(next)
})

router.put('/todo', auth.required, (req, res, next) => {
  const todoList = req.body.todoList
  const options = { "upsert": true }

  User.findById(req.payload.id)
  .then(async user => {
    if (!user) return res.sendStatus(401)

    const author = user

    await Todo.deleteMany({ 'author': author._id }, err => {
      console.log(err)
    })

    todoList.map(async todo => {
      console.log('TODO', todo)
      await Todo.create(
        {
          'text': todo.text,
          'completed': todo.completed,
          'author': author._id,
        },
        options,
      )
    })
    
    return res.sendStatus(201)
  }).catch(next)
})

module.exports = router