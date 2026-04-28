import { useState } from 'react';
import styles from './ProjectForm.module.css';

const projectStatuses = ['планируется', 'активный', 'завершён'];
const classOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
const parallelOptions = ['А', 'Б', 'В'];

function ProjectForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    theme: '',
    deadline: '',
    status: projectStatuses[0],
    targetClass: classOptions[0],
    targetParallel: parallelOptions[0]
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label>
        <span>Название проекта</span>
        <input name="title" value={formData.title} onChange={handleChange} required />
      </label>

      <label>
        <span>Краткое описание</span>
        <textarea name="description" value={formData.description} onChange={handleChange} rows="4" required />
      </label>

      <label>
        <span>Тема</span>
        <input name="theme" value={formData.theme} onChange={handleChange} required />
      </label>

      <div className={styles.row}>
        <label>
          <span>Класс</span>
          <select name="targetClass" value={formData.targetClass} onChange={handleChange}>
            {classOptions.map((classOption) => (
              <option key={classOption} value={classOption}>
                {classOption}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Параллель</span>
          <select name="targetParallel" value={formData.targetParallel} onChange={handleChange}>
            {parallelOptions.map((parallelOption) => (
              <option key={parallelOption} value={parallelOption}>
                {parallelOption}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.row}>
        <label>
          <span>Срок выполнения</span>
          <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} required />
        </label>

        <label>
          <span>Статус</span>
          <select name="status" value={formData.status} onChange={handleChange}>
            {projectStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Сохранение...' : 'Создать проект'}
      </button>
    </form>
  );
}

export default ProjectForm;
