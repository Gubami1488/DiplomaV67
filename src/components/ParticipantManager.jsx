import { useMemo } from 'react';
import styles from './ParticipantManager.module.css';

function ParticipantManager({ students, selectedIds, onChange }) {
  const selectedStudents = useMemo(
    () => students.filter((student) => selectedIds.includes(student.uid)),
    [students, selectedIds]
  );

  const toggleSelection = (userId) => {
    if (selectedIds.includes(userId)) {
      onChange(selectedIds.filter((id) => id !== userId));
      return;
    }

    onChange([...selectedIds, userId]);
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3>Участники проекта</h3>
        <span>Выбрано: {selectedStudents.length}</span>
      </div>

      {!students.length && <div className="emptyState">Для выбранного класса и параллели ученики не найдены.</div>}

      <div className={styles.grid}>
        {students.map((student) => {
          const checked = selectedIds.includes(student.uid);
          const initial = (student.name || '?').trim().charAt(0).toUpperCase();

          return (
            <label key={student.uid} className={checked ? styles.cardChecked : styles.card}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={checked}
                onChange={() => toggleSelection(student.uid)}
              />

              {student.photoDataUrl ? (
                <img src={student.photoDataUrl} alt={student.name} className={styles.avatarImage} />
              ) : (
                <span className={styles.avatar}>{initial}</span>
              )}

              <div className={styles.info}>
                <strong>{student.name}</strong>
                <p>{student.email}</p>
              </div>

              {checked && <span className={styles.tag}>Добавлен</span>}
            </label>
          );
        })}
      </div>
    </section>
  );
}

export default ParticipantManager;
