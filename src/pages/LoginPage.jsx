import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import styles from './AuthPage.module.css';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      navigate('/projects', { replace: true });
    } catch (submitError) {
      setError('Не удалось выполнить вход. Проверьте email и пароль.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <Link to="/" className={styles.homeLink}>
          На главную
        </Link>
        <h1>Вход</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </label>

          <label>
            <span>Пароль</span>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </label>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Выполняется вход...' : 'Войти'}
          </button>
        </form>

        <p>
          Нет аккаунта? <Link to="/register" className={styles.textLink}>Создать аккаунт</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
