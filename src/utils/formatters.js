export function formatDate(value) {
  if (!value) {
    return 'Не указано';
  }

  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

export function calculateProgress(tasks) {
  if (!tasks.length) {
    return 0;
  }

  const completed = tasks.filter((task) => task.status === 'выполнено').length;
  return Math.round((completed / tasks.length) * 100);
}
