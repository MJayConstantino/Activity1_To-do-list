import { Task } from './task';
import { saveTasks, loadTasksFromLocalStorage } from './storage';
import { renderTasks } from './render';
import { filterTasks, sortTasksByDeadline } from './filter';

export class ToDoList {
  tasks: Task[] = [];
  taskInput: HTMLInputElement;
  taskList: HTMLUListElement;
  addButton: HTMLButtonElement;
  taskDeadline: HTMLInputElement;
  taskCategory: HTMLSelectElement;
  filtersContainer: HTMLDivElement;
  noTasksMessage: HTMLParagraphElement;
  noTasksImage: HTMLImageElement;
  sortSelect: HTMLSelectElement;
  currentFilter: string = 'all';

  constructor() {
    this.taskInput = document.getElementById('taskInput') as HTMLInputElement;
    this.taskList = document.getElementById('taskList') as HTMLUListElement;
    this.addButton = document.getElementById('addTask') as HTMLButtonElement;
    this.taskDeadline = document.getElementById('taskDeadline') as HTMLInputElement;
    this.taskCategory = document.getElementById('taskCategory') as HTMLSelectElement;
    this.filtersContainer = document.querySelector('.filters-container') as HTMLDivElement;
    this.noTasksMessage = document.getElementById('noTasksMessage') as HTMLParagraphElement;
    this.noTasksImage = document.getElementById('noTasksImage') as HTMLImageElement;
    this.sortSelect = document.getElementById('sortTasks') as HTMLSelectElement;

    this.sortSelect.addEventListener('change', () => this.renderTasks(this.currentFilter));
    this.addButton.addEventListener('click', () => this.addTask());
    this.filtersContainer.addEventListener('click', (e) => this.handleFilter(e));

    this.tasks = loadTasksFromLocalStorage();
    this.renderTasks();

    setInterval(() => {
      this.renderTasks(this.currentFilter);
    }, 1000);
  }

  addTask(): void {
    const taskName = this.taskInput.value.trim();
    if (taskName === "") {
      alert("Please enter a task name.");
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      name: taskName,
      completed: false,
      category: this.taskCategory.value || 'No category',
      deadline: this.taskDeadline.value || 'No deadline'
    };

    this.tasks.push(newTask);
    saveTasks(this.tasks);
    this.renderTasks();

    this.taskInput.value = '';
    this.taskDeadline.value = '';
    this.taskCategory.value = '';
  }

  deleteTask(taskId: string): void {
    this.tasks = this.tasks.filter(task => task.id !== taskId);
    saveTasks(this.tasks);
    this.renderTasks();
  }

  toggleTaskCompletion(taskId: string): void {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      saveTasks(this.tasks);
      this.renderTasks();
    }
  }

  renderTasks(filter: string = 'all'): void {
    this.currentFilter = filter;
    const filteredTasks = filterTasks(this.tasks, filter);
    const sortedTasks = sortTasksByDeadline(filteredTasks, this.sortSelect.value);

    renderTasks(
      sortedTasks,
      this.taskList,
      this.noTasksMessage,
      this.noTasksImage,
      this.toggleTaskCompletion.bind(this),
      this.deleteTask.bind(this)
    );
  }

  handleFilter(e: Event): void {
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON') {
      const filter = target.getAttribute('data-filter') || 'all';
      this.renderTasks(filter);
    }
  }
}