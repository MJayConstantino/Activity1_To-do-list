import { Task } from './task';

export function filterTasks(tasks: Task[], filter: string): Task[] {
  switch (filter.toLowerCase()) {
    case 'pending':
      return tasks.filter(task => !task.completed && !isTaskExpired(task));
    case 'completed':
      return tasks.filter(task => task.completed);
    case 'expired':
      return tasks.filter(task => isTaskExpired(task));
    case 'personal':
    case 'work':
    case 'school':
    case 'home':
    case 'none':
      return tasks.filter(task => task.category.toLowerCase() === filter.toLowerCase());
    default:
      return tasks;
  }
}

export function sortTasksByDeadline(tasks: Task[], sortValue: string): Task[] {
  return tasks.sort((a, b) => {
    if (sortValue === 'nearest' || sortValue === 'farthest') {
      const deadlineComparison = compareDates(a.deadline, b.deadline, sortValue === 'nearest' ? 'ascending' : 'descending');
      if (deadlineComparison !== 0) return deadlineComparison;
    }

    const idA = parseInt(a.id);
    const idB = parseInt(b.id);
    return sortValue === 'oldest' ? idA - idB : idB - idA;
  });
}

export function isTaskExpired(task: Task): boolean {
  if (task.deadline === 'No deadline') return false;
  return new Date(task.deadline) < new Date();
}

export function formatDeadline(deadline: string): string {
  if (deadline === 'No deadline') return deadline;
  const date = new Date(deadline);
  return date.toLocaleString();
}

function compareDates(a: string, b: string, order: 'ascending' | 'descending'): number {
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