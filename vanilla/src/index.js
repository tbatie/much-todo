import "./index.css";

const FILTER_ALL = 'all'
const FILTER_COMPLETED = 'completed'
const FILTER_REMAINING = 'remaining'

const routes = {
    '/': function () {
        saveTodoFilter(FILTER_ALL)
    },
    '#/remaining': function () {
        saveTodoFilter(FILTER_REMAINING)
    },
    '#/completed': function () {
        saveTodoFilter(FILTER_COMPLETED)
    }
}

window.addEventListener('DOMContentLoaded', function () {
    refreshAppState()
    var route = routes[window.location.hash]
    if(route === undefined) {
        route = routes[window.location.pathname]
    }

    if(route === undefined) {
        route = routes['/']
    }
    route()
})

const createUid = () => {
    return '_' + Math.random().toString(36).substr(2, 9)
}

const newTodo = (id, label, isSelected, isComplete) => {
    return {
        id: id,
        label: label,
        isSelected: isSelected,
        isComplete: isComplete
    }
}

const newAppState = (todosFilter = FILTER_ALL, todos = []) => {
    return {
        todosFilter: todosFilter,
        todos: todos,
        getVisibleTodos() {
            if (this.todosFilter === FILTER_COMPLETED) {
                return this.todos.filter(todo => todo.isComplete)
            } else if (this.todosFilter === FILTER_REMAINING) {
                return this.todos.filter(todo => !todo.isComplete)
            } else {
                return this.todos
            }
        },
        getVisibleSelectedTodos() {
            return this.getVisibleTodos().filter(todo => todo.isSelected)
        },

        areAnyVisible() {
            return this.getVisibleTodos().length !== 0
        },

        areAnySelected() {
            return this.areAnyVisible() && this.getVisibleSelectedTodos().filter(e => e.isSelected).length > 0
        },

        areAllSelected() {
            return this.areAnyVisible() &&  this.getVisibleSelectedTodos().length === this.getVisibleTodos().length
        }
    }
}

const listenForDoubleClick = (e) => {
    e.contentEditable = true
    setTimeout(() => {
        if (document.activeElement !== e) {
            e.contentEditable = false
        }
    }, 300)
}

//// MODEL
const saveTodos = (todos) => {
    var newAppState = getAppState()
    newAppState.todos = todos
    saveAppState(newAppState)
}

const editTodos = (todos) => {
    var newTodos = getAppState().todos.reduce((map, todo) => {
        map[todo.id] = todo
        return map
    }, {})

    todos.forEach(todo => newTodos[todo.id] = todo)
    
    var newAppState = getAppState()
    newAppState.todos = Object.values(newTodos)
    saveAppState(newAppState)
}   

const deleteTodos = (todoIds) => {
    var newTodos = getAppState().todos.reduce((list, todo) => {
        if(!todoIds.includes(todo.id)) {
            list.push(todo)
        }

        return list
    }, [])

    var newAppState = getAppState()
    newAppState.todos = newTodos
    saveAppState(newAppState)
}

const saveAppState = (appState) => {
    window.localStorage.setItem('appState', JSON.stringify(appState))

    console.log('SAVED STATE: \n' + JSON.stringify(appState))
    refreshAppState()
}

const saveTodoFilter = (filter) => {
    var appState = getAppState()
    appState.todosFilter = filter
    if(filter === FILTER_COMPLETED) {
        window.location.hash = '/' + FILTER_COMPLETED
    } else if(filter === FILTER_REMAINING) {
        window.location.hash = '/' + FILTER_REMAINING
    } else {
        window.location.hash = '/'
    }

    saveAppState(appState)
}

const addTodo = (todo) => {
    var appState = getAppState()
    appState.todos.push(todo)
    saveAppState(appState)
}

const editTodoText = (id, label) => {

    //Roll back if field is empty
    if (!label) {
        saveAppState(getAppState())
        return
    }

    var newAppState = getAppState()
    newAppState.todos = newAppState.todos.map((todo) => {
        if (todo.id === id) {
            todo.label = label
        }

        return todo
    })
    saveAppState(newAppState)
}

const getAppState = () => {
    var appState = JSON.parse(window.localStorage.getItem('appState'))

    if (appState === null) {
        appState = newAppState()
    } else {
        //creates functions on obj
        appState = newAppState(appState.todosFilter, appState.todos)
    }

    return appState
}

////VIEW
const refreshAppState = () => {
    var appState = getAppState()
    var filterSelect = document.getElementById('filterSelect')
    var todoList = document.getElementById('todoList')
    var remainingTodoCount = document.getElementById('remainingTodoCount')

    remainingTodoCount.innerText = 'Remaining todos: ' + getAppState().todos.filter(todo => !todo.isComplete).length

    //set filter drop down
    filterSelect.value = appState.todosFilter
    
    //disable btns
    var anySelected = appState.areAnySelected()
    var btns = [document.getElementById('removeBtn'), document.getElementById('markCompleteBtn'), document.getElementById('markIncompleteBtn')]
    if(anySelected) {
        btns.forEach(e => e.removeAttribute('disabled'))
    } else {
        btns.forEach(e => e.setAttribute('disabled', true))
    }

    var selectAllBtn = document.getElementById('selectAllBtn')
    if(appState.areAnyVisible()) {
        selectAllBtn.removeAttribute('disabled')
    } else {
        selectAllBtn.setAttribute('disabled', true)
    }
    selectAllBtn.value = appState.areAllSelected() ? 'Unselect All' : 'Select All'

    //set todo list
    while (todoList.hasChildNodes()) {
        todoList.removeChild(todoList.lastChild)
    }

    populateTodoList(appState.getVisibleTodos())
}

const populateTodoList = (todos) => {
    todos.forEach(todo => {
        var checkbox = document.createElement("input")
        checkbox.type = 'checkbox'
        checkbox.name = todo.id
        checkbox.checked = todo.isSelected
        checkbox.todoId = todo.id
        checkbox.addEventListener('click', function (e) {
            var newTodos = getAppState().todos.map(todo => {
                if (todo.id === e.target.todoId) {
                    todo.isSelected = !todo.isSelected
                }
                return todo
            })
            editTodos(newTodos)
        })

        var todoEl = todo.isComplete ? document.createElement("strike") : document.createElement("label")
        todoEl.innerHTML = todo.label
        todoEl.className = 'clickableTodo'
        todoEl.todoId = todo.id
        todoEl.classList.add("todo_label")
        todoEl.onclick = function onClick() { listenForDoubleClick(this) }
        todoEl.onkeypress = function onKeypress(e) {
            if(e.keyCode === 13 && newTodo) {
                this.contentEditable = false
                return false
            }

            return true
        }
        todoEl.onblur = function onBlure(e) {
            this.contentEditable = false
            editTodoText(todo.id, e.target.innerText)
        }

        var paddingLeft = document.createElement("div")
        var paddingRight = document.createElement("div")
        paddingLeft.classList.add("todo_row_padding")
        paddingRight.classList.add("todo_row_padding")

        var content = document.createElement("div")
        content.appendChild(checkbox)
        content.appendChild(todoEl)
        content.classList.add("todo_row_content")

        var row = document.createElement("div")
        row.classList.add("todo_list_row")
        row.appendChild(paddingLeft)
        row.appendChild(content)
        row.appendChild(paddingRight)
        document.getElementById("todoList").appendChild(row)
    })
}


/// CONTROLLER
const onSelectAll = () => {
    //if all selected, unselect them, else select remaining
    var newSelectVal = getAppState().areAllSelected() ? false : true
    var newTodos = getAppState().getVisibleTodos().map(el => {
        el.isSelected = newSelectVal
        return el
    })

    editTodos(newTodos)
}

const onRemoveSelected = () => {
    var todoIdsToRemove = getAppState().getVisibleTodos().filter(todo => todo.isSelected).map(todo => todo.id)
    deleteTodos(todoIdsToRemove)
}

const onMarkComplete = () => {
    var newTodos = getAppState().getVisibleTodos().map(todo => { 
        if(todo.isSelected) {
            todo.isComplete = true
        }
        return todo 
    })
    editTodos(newTodos)
}

const onMarkIncomplete = () => {
    var newTodos = getAppState().getVisibleTodos().map(todo => { 
        if(todo.isSelected) {
            todo.isComplete = false
        }
        return todo 
    })
    editTodos(newTodos)
}

const onAddTodo = (e) => {
    var newTodoName = document.getElementById('newTodoName').value
    if(e.keyCode === 13 && newTodo && newTodoName) {
        document.getElementById('newTodoName').value = ''
        addTodo(newTodo(createUid(), newTodoName, false, false))
    }
}

const onFilterTodos = () => {
    saveTodoFilter(document.getElementById('filterSelect').value)
}

window.onSelectAll = onSelectAll
window.onRemoveSelected = onRemoveSelected
window.onMarkComplete = onMarkComplete
window.onMarkIncomplete = onMarkIncomplete
window.onAddTodo = onAddTodo
window.onFilterTodos = onFilterTodos
window.getAppState = getAppState