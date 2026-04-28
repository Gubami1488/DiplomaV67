import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

function NotFoundPage() {
  return (
    <section className={styles.card}>
      <h1>404</h1>
      <p>Страница не найдена. Возможно, адрес был введён неправильно.</p>
      <Link to="/" className={styles.link}>
        Вернуться на главную
      </Link>
    </section>
  );
}

export default NotFoundPage;
