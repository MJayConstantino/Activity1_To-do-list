import './style.css'

class ToDoList {
  task: HTMLLIElement;

  constructor(taskName: string) {
    this.task = document.createElement('li');
    this.task.innerHTML = `
      <input type="checkbox">
      <span>${taskName}</span>
      <button class="deleteTask">Delete</button>
    `;

    const checkbox = this.task.querySelector('input') as HTMLInputElement;
    checkbox.addEventListener('change', () => this.toggle());
  }

  toggle() {
    this.task.classList.toggle('completed');
    const span = this.task.querySelector('span') as HTMLSpanElement;
    if (this.task.classList.contains('completed')) {
      span.style.color = '#888';
    } else {
      span.style.color = '';
    }
  }
}

const taskInput = document.getElementById('taskInput') as HTMLInputElement;
const taskList = document.getElementById('taskList') as HTMLUListElement;
const addButton = document.getElementById('addTask') as HTMLButtonElement;

function addTask() {
  const taskName = taskInput.value.trim();
  if (taskName === "") return
  const todolist = new ToDoList(taskName);
  const deleteButton = todolist.task.querySelector('.deleteTask') as HTMLButtonElement;
  deleteButton.addEventListener('click', () => deleteTask(todolist.task));
  taskList.appendChild(todolist.task);
  taskInput.value = '';
}

function deleteTask(li: HTMLLIElement) {
  taskList.removeChild(li);
}

addButton.addEventListener('click', addTask);