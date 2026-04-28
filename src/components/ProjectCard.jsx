import { Link } from 'react-router-dom';
import { formatDate } from '../utils/formatters';
import styles from './ProjectCard.module.css';

function ProjectCard({ project, isParticipant }) {
  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <span className={styles.status}>{project.status}</span>
        {isParticipant && <span className={styles.participant}>Вы участник</span>}
      </div>

      <h3>{project.title}</h3>
      <p>{project.description}</p>

      <div className={styles.meta}>
        <span>Тема: {project.theme}</span>
        <span>Класс: {project.targetClass || 'Не указан'}</span>
        <span>Параллель: {project.targetParallel || 'Не указана'}</span>
        <span>Срок: {formatDate(project.deadline)}</span>
      </div>

      <Link to={`/projects/${project.id}`} className={styles.link}>
        Открыть проект
      </Link>
    </article>
  );
}

export default ProjectCard;
