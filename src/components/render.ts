import { Task } from './task';
import { isTaskExpired, formatDeadline } from './filter';

export function renderTasks(
  tasks: Task[],
  taskList: HTMLUListElement,
  noTasksMessage: HTMLParagraphElement,
  noTasksImage: HTMLImageElement,
  toggleTaskCompletion: (taskId: string) => void,
  deleteTask: (taskId: string) => void
): void {
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    noTasksMessage.style.display = 'block';
    noTasksImage.style.opacity = "1";
  } else {
    noTasksMessage.style.display = 'none';
    noTasksImage.style.opacity = "0";
  }

  tasks.forEach(task => {
    const li = document.createElement('li');
    const categoryClass = `header-${task.category.replace(/\s+/g, '-').toLowerCase()}` || 'header-none';

    li.innerHTML = `
      <header class="${categoryClass}">
        <span class="category">${task.category || 'None'}</span>
        <span class="deadline">${formatDeadline(task.deadline)}</span>
      </header>
      <div class="task-content">
        <input type="checkbox" ${task.completed ? 'checked' : ''}>
        <span class="${task.completed ? 'completed' : ''}">${task.name}</span>
      </div>
      <button class="deleteTask">Delete</button>
    `;

    if (isTaskExpired(task)) {
      li.classList.add('expired');
    }

    if (task.completed) {
      li.classList.add('completed');
    }

    const checkbox = li.querySelector('input') as HTMLInputElement;
    checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));

    const deleteButton = li.querySelector('.deleteTask') as HTMLButtonElement;
    deleteButton.addEventListener('click', () => deleteTask(task.id));

    taskList.appendChild(li);
  });
}