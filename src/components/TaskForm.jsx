import { useState } from 'react';
import styles from './TaskForm.module.css';

const taskStatuses = ['к выполнению', 'в процессе', 'выполнено'];

function TaskForm({ participants, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    status: taskStatuses[0],
    assigneeId: ''
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData);
    setFormData({
      title: '',
      description: '',
      deadline: '',
      status: taskStatuses[0],
      assigneeId: ''
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3>Добавить задачу</h3>

      <label>
        <span>Название задачи</span>
        <input name="title" value={formData.title} onChange={handleChange} required />
      </label>

      <label>
        <span>Описание</span>
        <textarea name="description" value={formData.description} onChange={handleChange} rows="3" required />
      </label>

      <div className={styles.row}>
        <label>
          <span>Дедлайн</span>
          <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} required />
        </label>

        <label>
          <span>Статус</span>
          <select name="status" value={formData.status} onChange={handleChange}>
            {taskStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label>
        <span>Исполнитель</span>
        <select name="assigneeId" value={formData.assigneeId} onChange={handleChange} required>
          <option value="">Выберите ученика</option>
          {participants.map((participant) => (
            <option key={participant.uid} value={participant.uid}>
              {participant.name} ({participant.email})
            </option>
          ))}
        </select>
      </label>

      <button type="submit" disabled={loading}>
        {loading ? 'Сохранение...' : 'Добавить задачу'}
      </button>
    </form>
  );
}

export default TaskForm;
