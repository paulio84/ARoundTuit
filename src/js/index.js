import './assets.js';

const messages = {
  NO_ITEMS_MESSAGE: { id: 'no-items-message', message: "" },
  GET_BUSY_MESSAGE: { id: 'get-busy-message', message: "Time to get busy!" }
};

// POSSIBLE NEW FEATURES:
// add permanent delete for all completed items
// add filters - text filter (debounce until 3 characters entered)
// animate (somehow?) delete todo item

// define our data structure
const todoData = {
  todos: [],
  nextId: 0,
  loadTodoData() {
    const todoData = JSON.parse(localStorage.getItem('todoData'));
    if (todoData) {
      const { nextId, todos } = todoData;
      this.nextId = nextId;
      this.todos = todos;
    }
    syncUI();
  },
  saveTodoData() {
    const { nextId, todos } = this;
    localStorage.setItem('todoData', JSON.stringify({ nextId, todos }));
    syncUI();
  },
  createNewTodo(text) {
    this.todos.push({ id: ++this.nextId, text, isCompleted: false });
    this.saveTodoData();
  },
  todoCompleted(todoId, isCompleted) {
    const index = this.todos.findIndex(todo => todo.id === todoId);
    this.todos[index].isCompleted = isCompleted;

    this.saveTodoData();
  },
  deleteCompletedTodos() {
    const todos = this.todos.filter(todo => !todo.isCompleted);
    this.todos = todos;
    this.saveTodoData();
  },
  deleteTodoById(todoId) {
    const todos = this.todos.filter(todo => todo.id !== todoId);
    this.todos = todos;
    this.saveTodoData();
  },
  numberOfActiveItems() {
    return this.numberOfItemsByCompleted(false);
  },
  numberOfCompletedItems() {
    return this.numberOfItemsByCompleted(true);
  },
  numberOfItemsByCompleted(isCompleted) {
    const items = this.todos.filter(todo => todo.isCompleted === isCompleted);
    return items.length;
  }
};

// ==================================
// UI controls
// ==================================
// input and save button
const $saveButton = document.querySelector('#save-button');
const $newTodoItemInput = document.querySelector('#new-todo-item');
$saveButton.addEventListener('click', function () {
  saveTodoItem($newTodoItemInput.value.trim());
});
$newTodoItemInput.addEventListener('keypress', function (event) {
  if (event.keyCode === 13) {
    saveTodoItem(this.value.trim());
  }
});

// todo tab and completed tabs
const $todoTabControl = document.querySelector('#todoTabControl');
const $completedTabControl = document.querySelector('#completedTabControl');
const $todoTab = document.querySelector('#todoTab');
const $completedTab = document.querySelector('#completedTab');
$todoTabControl.addEventListener('click', function (e) {
  changeActiveTab(this);
  $todoTab.classList.add('active');
  $completedTab.classList.remove('active');
});
$completedTabControl.addEventListener('click', function (e) {
  changeActiveTab(this);
  $completedTab.classList.add('active');
  $todoTab.classList.remove('active');
});

todoData.loadTodoData();

// ==================================
// Helper functions
// ==================================
function changeActiveTab(el) {
  const elSiblings = [...el.parentElement.children];
  for (let sibling of elSiblings)
    sibling.classList.remove('active');

  el.classList.add('active');
}

function syncUI() {
  clearElementChildren($todoTab);
  clearElementChildren($completedTab);
  messages.NO_ITEMS_MESSAGE.message = randomiseTodoMessage();

  // are there any items at all
  if (todoData.todos && todoData.todos.length === 0) {
    // display a message on both tabs
    buildUIMessage(messages.NO_ITEMS_MESSAGE, $todoTab);
    buildUIMessage(messages.GET_BUSY_MESSAGE, $completedTab);
  } else {
    let $todoList;
    let $completedTodoList;
    if (todoData.numberOfActiveItems() === 0) {
      buildUIMessage(messages.NO_ITEMS_MESSAGE, $todoTab);
    } else {
      $todoList = document.createElement('ul');
      $todoList.classList.add('todo-list');
      $todoTab.appendChild($todoList);
    }
    if (todoData.numberOfCompletedItems() === 0) {
      buildUIMessage(messages.GET_BUSY_MESSAGE, $completedTab);
    } else {
      $completedTodoList = document.createElement('ul');
      $completedTodoList.classList.add('todo-list');
      $completedTab.appendChild($completedTodoList);
    }

    // build li elements for each todo item in the array
    for (let todo of todoData.todos) {
      const $todoItem = buildUITodoItem(todo);
      todo.isCompleted ? $completedTodoList.appendChild($todoItem) : $todoList.appendChild($todoItem);
    }
  }
}

function buildUIMessage({ id, message }, el) {
  const $span = document.createElement('span');

  const $icon = document.createElement('i');
  $icon.classList.add('fas', 'fa-thumbs-up');
  $span.appendChild($icon);

  const $p = document.createElement('p');
  $p.id = id;
  $p.appendChild(document.createTextNode(message));
  $p.appendChild($span);

  el.appendChild($p);
}

function buildUITodoItem(todo) {
  const $todoItem = document.createElement('li');
  $todoItem.classList.add('todo-list-item');

  const $todoItemText = document.createElement('span');
  $todoItemText.classList.add('flex-grow-helper');
  $todoItemText.textContent = todo.text;
  $todoItem.appendChild($todoItemText);

  const $todoItemIcon = (todo.isCompleted) ? buildUITodoIcon('fa-undo') : buildUITodoIcon('fa-check');
  $todoItemIcon.addEventListener('click', () => todoCompleted(todo));
  $todoItem.appendChild($todoItemIcon);

  // also create a trash icon for isCompleted todo items
  if (todo.isCompleted) {
    const $todoItemTrashIcon = buildUITodoIcon('fa-trash');
    $todoItemTrashIcon.addEventListener('click', () => todoDeleteById(todo.id));
    $todoItem.appendChild($todoItemTrashIcon);
  }

  return $todoItem;
}

function buildUITodoIcon(symbol) {
  const $icon = document.createElement('i');
  $icon.classList.add('fas', symbol);

  const $iconWrapper = document.createElement('span');
  $iconWrapper.classList.add('todo-list-item-icon');
  $iconWrapper.appendChild($icon);

  return $iconWrapper;
}

function clearElementChildren(el) {
  for (let child of el.children) {
    el.removeChild(child);
  }
}

function saveTodoItem(text) {
  if (text) todoData.createNewTodo(text);

  $newTodoItemInput.value = "";
}

function todoCompleted(todo) {
  todoData.todoCompleted(todo.id, !todo.isCompleted);
}

function todoDeleteById(todoId) {
  todoData.deleteTodoById(todoId);
}

function randomiseTodoMessage() {
  const messages = ['Freeeedom!!!', "There's nothing to-do", 'Quick! Look busy!', 'Find something to-do'];
  return messages[Math.floor(Math.random() * messages.length)];
}