import _ from 'lodash'

const filters = {
	all: todos => todos,
	active: todos => todos.filter(todo => !todo.completed),
	completed: todos => todos.filter(todo => todo.completed),
}

const app = new Vue({

	el: '#todo-app',

	data: {
		todos: [],
		newTodo: '',
		visibility: 'all',
		editingTodo: null,
		beforeEditCache: '',

		token: null,
		username: '',
		password: '',
		formType: 'auth',
		todosLoaded: false,
		updateDelay: 2000,
	},

	computed: {
		filtered: function() {
			if (!this.todos && !this.todos.length) return []

			return filters[this.visibility](this.todos)
		},
		remaining: function() {
			if (!this.todos && !this.todos.length) return []

			return this.todos.filter(todo => !todo.completed).length
		},
		allDone: {
			get: function() {
				return this.remaining === 0
			},
			set: function(value) {
				this.todos.forEach(function(todo) {
					todo.completed = value
				})
			}
		},
	},

	watch: {
		token() {
			if (this.token) this.loadTodos()
		},
	},

	methods: {
		logout() {
			this.token = null
			this.username = ''
			this.todoList = []
			this.todosLoaded = false
		},

		async loadTodos() {
			try {
				this.todos = await this.getTodoList()
				setTimeout(() => { this.todosLoaded = true }, this.updateDelay + 500)
			} catch(err) {
				console.error(err)
			}
		},

		async auth() {
			try {
				const user = await fetch('api/users/login', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
    			},
					body: JSON.stringify({
						user: {
							username: this.username,
							password: this.password,
						}
					}),
				})
				.then(res => res.json()) 
				.then(json => json.user)

				this.token = user.token	
			} catch(err) {
				console.error(err)
			}

			this.password = ''
		},

		async signup() {
			try {
				const user = await fetch('api/users', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
    			},
					body: JSON.stringify({
						user: {
							username: this.username,
							password: this.password,
						}
					}),
				})
				.then(res => res.json()) 
				.then(json => json.user)

				this.token = user.token	
			} catch(err) {
				console.error(err)
			}

			this.password = ''
		},

		create: function() {
			if (this.newTodo == '')
				return
			this.todos.push({
				text: this.newTodo.trim(),
				completed: false,
				createdAt: Date.now(),
			})
			this.newTodo = ''
		},

		destroy: function(todo) {
			this.todos.splice(this.todos.indexOf(todo), 1)
		},
		clear: function() {
			this.todos = this.todos.filter(todo => !todo.completed)
		},

		editTodo: function(todo) {
			this.editingTodo = todo
			this.beforeEditCache = todo.text
		},

		doneEdit: function(todo) {
			if (todo.text == '')
				this.destroy(todo)
			this.editingTodo = null
			this.beforeEditCache = ''
		},

		cancelEdit: function(todo) {
			this.editingTodo = null
			todo.text = this.beforeEditCache
			this.beforeEditCache = ''
		},

		getTodoList: async function() {
			try {
				const todoList = await fetch(`api/todo?author=${this.username}`, {
					headers: {
						'Content-Type': 'application/json',
						'Authorization': 'Bearer ' + this.token,
					},
				})
				.then(res => res.json())
				.then(json => json.todoList)

				return todoList
			} catch(err) {
				console.error(err)
			}
		},	

		postTodoList: async function(todoList) {
			try {
				await fetch('api/todo', {
			    method: 'PUT',
			    headers: {
			      'Content-Type': 'application/json',
			      'Authorization': 'Bearer ' + this.token,
			    },
			    body: JSON.stringify({
			    	'todoList': todoList,
			    }),
				})
			} catch(err) {
				console.error(err)
			}
		}
	},

	async created() {
		this.$watch('todos', {
			deep: true,
			handler: _.debounce(() => {
				if (!this.todosLoaded || 
						!this.token || 
						!this.todos
				) return

				this.postTodoList(this.todos)
			}, this.updateDelay)
		})
	},

	directives: {
		"todo-focus": function(el, binding) {
			if (binding.value) {
				el.focus();
			}
		}
	},
})