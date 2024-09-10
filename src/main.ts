import './style.css';

interface Task {
  id: string;
  name: string;
  completed: boolean;
  category: string;
  deadline: string;
}

class ToDoList {
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

    this.loadTasksFromLocalStorage();
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
    this.saveTasks();
    this.renderTasks();

    this.taskInput.value = '';
    this.taskDeadline.value = '';
    this.taskCategory.value = '';
  }

  deleteTask(taskId: string): void {
    this.tasks = this.tasks.filter(task => task.id !== taskId);
    this.saveTasks();
    this.renderTasks();
  }

  toggleTaskCompletion(taskId: string): void {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
      this.renderTasks();
    }
  }

  saveTasks(): void {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  loadTasksFromLocalStorage(): void {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      this.tasks = JSON.parse(savedTasks);
    }
  }

  renderTasks(filter: string = 'all'): void {
    this.currentFilter = filter;
    this.taskList.innerHTML = '';

    const filteredTasks = this.filterTasks(filter);
    const sortedTasks = this.sortTasksByDeadline(filteredTasks);

    console.log(sortedTasks.length);

    if (sortedTasks.length === 0) {
      this.noTasksMessage.style.display = 'block';
      this.noTasksImage.style.opacity = "1";
    } else {
      this.noTasksMessage.style.display = 'none';
      this.noTasksImage.style.opacity = "0";
    }

    sortedTasks.forEach(task => {
      const li = document.createElement('li');
      const categoryClass = `header-${task.category.replace(/\s+/g, '-').toLowerCase()}` || 'header-none';

      li.innerHTML = `
        <header class="${categoryClass}">
          <span class="category">${task.category || 'None'}</span>
          <span class="deadline">${this.formatDeadline(task.deadline)}</span>
        </header>
        <div class="task-content">
          <input type="checkbox" ${task.completed ? 'checked' : ''}>
          <span class="${task.completed ? 'completed' : ''}">${task.name}</span>
        </div>
        <button class="deleteTask">Delete</button>
      `;

      if (this.isTaskExpired(task)) {
        li.classList.add('expired');
      }

      if (task.completed) {
        li.classList.add('completed');
      }

      const checkbox = li.querySelector('input') as HTMLInputElement;
      checkbox.addEventListener('change', () => this.toggleTaskCompletion(task.id));

      const deleteButton = li.querySelector('.deleteTask') as HTMLButtonElement;
      deleteButton.addEventListener('click', () => this.deleteTask(task.id));

      this.taskList.appendChild(li);
    });
  }

  filterTasks(filter: string): Task[] {
    switch (filter.toLowerCase()) {
      case 'pending':
        return this.tasks.filter(task => !task.completed && !this.isTaskExpired(task));
      case 'completed':
        return this.tasks.filter(task => task.completed);
      case 'expired':
        return this.tasks.filter(task => this.isTaskExpired(task));
      case 'personal':
      case 'work':
      case 'school':
      case 'home':
      case 'none':
        return this.tasks.filter(task => task.category.toLowerCase() === filter.toLowerCase());
      default:
        return this.tasks;
    }
  }

  sortTasksByDeadline(tasks: Task[]): Task[] {
    const sortValue = this.sortSelect.value;
  
    return tasks.sort((a, b) => {
      if (sortValue === 'nearest' || sortValue === 'farthest') {
        const deadlineComparison = this.compareDates(a.deadline, b.deadline, sortValue === 'nearest' ? 'ascending' : 'descending');
        if (deadlineComparison !== 0) return deadlineComparison;
      }

      const idA = parseInt(a.id);
      const idB = parseInt(b.id);
      return sortValue === 'oldest' ? idA - idB : idB - idA;
    });
  }

  compareDates(a: string, b: string, order: 'ascending' | 'descending'): number {
    if (a === 'No deadline' && b === 'No deadline') return 0;
    if (a === 'No deadline') return 1;
    if (b === 'No deadline') return -1;

    const dateA = new Date(a).getTime();
    const dateB = new Date(b).getTime();

    if (order === 'ascending') {
      return dateA - dateB;
    } else {
      return dateB - dateA;
    }
  }

  isTaskExpired(task: Task): boolean {
    if (task.deadline === 'No deadline') return false;
    return new Date(task.deadline) < new Date();
  }

  formatDeadline(deadline: string): string {
    if (deadline === 'No deadline') return deadline;
    const date = new Date(deadline);
    return date.toLocaleString();
  }

  handleFilter(e: Event): void {
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON') {
      const filter = target.getAttribute('data-filter') || 'all';
      this.renderTasks(filter);
    }
  }
}

new ToDoList();

