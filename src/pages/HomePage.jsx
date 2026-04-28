import { Link, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import styles from './HomePage.module.css';

function HomePage() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <h1>PAX помогает школам организовать проектную работу в одной удобной среде</h1>
        <p>
          Платформа объединяет проекты, участников, задачи и учебные профили. Учитель запускает проект,
          распределяет роли и следит за выполнением, а ученики видят понятный план работы и сроки.
        </p>

        <div className={styles.actions}>
          {user ? (
            <>
              <Link to="/projects" className={styles.primaryButton}>
                Открыть проекты
              </Link>
              <Link to="/my-projects" className={styles.secondaryButton}>
                Мои проекты
              </Link>
            </>
          ) : (
            <>
              <Link to="/register" className={styles.primaryButton}>
                Начать работу
              </Link>
              <Link to="/login" className={styles.secondaryButton}>
                Войти
              </Link>
            </>
          )}
        </div>

        <div className={styles.note}>Подходит для школьных исследований, командных проектов и итоговых работ.</div>
        <div className={styles.featureList}>
          <div className={styles.featureItem}>Проекты с темой, сроком и статусом</div>
          <div className={styles.featureItem}>Учебные профили с фото и данными ученика</div>
          <div className={styles.featureItem}>Назначение задач и контроль прогресса</div>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelCard}>
          <strong>Для учителя</strong>
          <p>Создание проектных карточек, распределение участников, постановка задач и просмотр общей динамики.</p>
        </div>
        <div className={styles.panelCard}>
          <strong>Для ученика</strong>
          <p>Личный список проектов, понятные дедлайны, свои задачи и прозрачный прогресс по работе команды.</p>
        </div>
        <div className={styles.panelCard}>
          <strong>Для школы</strong>
          <p>Единое пространство, где можно быстро показать структуру проекта на защите или во время урока.</p>
        </div>
      </div>
    </section>
  );
}

export default HomePage;
