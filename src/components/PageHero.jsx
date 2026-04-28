import styles from './PageHero.module.css';

function PageHero({ title, action }) {
  return (
    <section className={styles.hero}>
      <div>
        <h1>{title}</h1>
      </div>
      {action && <div>{action}</div>}
    </section>
  );
}

export default PageHero;
