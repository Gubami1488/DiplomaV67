import styles from './TaskList.module.css';
import { formatDate } from '../utils/formatters';

const statuses = ['к выполнению', 'в процессе', 'выполнено'];

function TaskList({ tasks, canManage, currentUserId, onStatusChange }) {
  if (!tasks.length) {
    return <div className="emptyState">Задач пока нет.</div>;
  }

  return (
    <div className={styles.list}>
      {tasks.map((task) => {
        const isOwnTask = task.assigneeId === currentUserId;

        return (
          <article key={task.id} className={styles.card}>
            <div className={styles.topRow}>
              <h3>{task.title}</h3>
              <span className={styles.badge}>{task.status}</span>
            </div>

            <p>{task.description}</p>

            <div className={styles.meta}>
              <span>Дедлайн: {formatDate(task.deadline)}</span>
              <span>Исполнитель: {task.assigneeName || 'Не назначен'}</span>
            </div>

            {(canManage || isOwnTask) && (
              <label className={styles.selectRow}>
                <span>Изменить статус</span>
                <select value={task.status} onChange={(event) => onStatusChange(task.id, event.target.value)}>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </article>
        );
      })}
    </div>
  );
}

export default TaskList;
