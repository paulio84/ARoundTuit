import './assets.js';

// TODO:
// add filters - text filter (debounce until 3 characters entered), show completed items
// allow completed items to be uncompleted
// add permanent delete to completed items
// add random messages when there's nowt todo
// add a background image with quote "I'll do these things when I get a round to it."
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
    this.todos.forEach((todo) => {
      if (todo.id === todoId)
        todo.isCompleted = isCompleted;
    });
    this.saveTodoData();
  }
};

const $saveButton = document.querySelector('#save-button');
const $newTodoItemInput = document.querySelector('#new-todo-item');
$saveButton.addEventListener('click', function () {
  saveTodoItem($newTodoItemInput.value);
});
$newTodoItemInput.addEventListener('keypress', function (event) {
  if (event.keyCode === 13) {
    saveTodoItem(this.value);
  }
});

todoData.loadTodoData();

// ==================================
// Helper functions
// ==================================
function syncUI() {
  const $mainContainer = document.querySelector('main.container');
  clearElementChildren($mainContainer);

  if (allItemsCompleted()) {
    // display no items message
    const $p = buildUINoItemsMessage();
    $mainContainer.appendChild($p);
  } else {
    // create a UL element to hold the todo items
    const $todoList = document.createElement('ul');
    $todoList.id = 'todo-list';

    // build li elements for each todo item in the array
    todoData.todos.forEach((todo) => {
      if (!todo.isCompleted) {
        const $todoItem = buildUITodoItem(todo);
        $todoList.appendChild($todoItem);
      }
    });
    $mainContainer.appendChild($todoList);
  }
}

function buildUINoItemsMessage() {
  const $span = document.createElement('span');

  const $icon = document.createElement('i');
  $icon.classList.add('fas');
  $icon.classList.add('fa-thumbs-up');
  $span.appendChild($icon);

  const $p = document.createElement('p');
  $p.id = "no-items-message";
  $p.appendChild(document.createTextNode("There's nothing to-do"));
  $p.appendChild($span);

  return $p;
}

function buildUITodoItem(todo) {
  const $todoIcon = document.createElement('i');
  $todoIcon.classList.add('fas');
  $todoIcon.classList.add('fa-check');

  const $todoCheck = document.createElement('span');
  $todoCheck.classList.add('todo-list-item-tick');
  $todoCheck.appendChild($todoIcon);

  const $todoText = document.createElement('span');
  $todoText.textContent = todo.text;

  const $todoItem = document.createElement('li');
  $todoItem.classList.add('todo-list-item');
  $todoItem.appendChild($todoText);
  $todoItem.appendChild($todoCheck);
  $todoItem.addEventListener('click', () => todoCompleted(todo));

  return $todoItem;
}

function allItemsCompleted() {
  const isEmpty = (todoData.todos.length === 0);
  const allItemsCompleted = todoData.todos.every(todo => todo.isCompleted);

  return todoData.todos && (isEmpty || allItemsCompleted);
}

function clearElementChildren(el) {
  for (let child of el.children) {
    el.removeChild(child);
  }
}

function saveTodoItem(text) {
  if (!text) return;

  todoData.createNewTodo(text);
  $newTodoItemInput.value = "";
}

function todoCompleted(todo) {
  todoData.todoCompleted(todo.id, true);
}