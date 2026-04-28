import { Outlet } from 'react-router-dom';
import Header from './Header';
import InstallPrompt from './InstallPrompt';
import styles from './MainLayout.module.css';

function MainLayout() {
  return (
    <div className={styles.appShell}>
      <Header />
      <InstallPrompt />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
