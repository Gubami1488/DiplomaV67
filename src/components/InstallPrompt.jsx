import { useEffect, useState } from 'react';
import styles from './InstallPrompt.module.css';

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (!deferredPrompt) {
    return null;
  }

  return (
    <div className={styles.banner}>
      <div>
        <strong>Установите приложение</strong>
        <p>Открывайте платформу с главного экрана телефона или рабочего стола компьютера.</p>
      </div>
      <button type="button" onClick={handleInstall} className={styles.button}>
        Установить
      </button>
    </div>
  );
}

export default InstallPrompt;
