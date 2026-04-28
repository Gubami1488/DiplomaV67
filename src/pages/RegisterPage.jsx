import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import styles from './AuthPage.module.css';

const schools = ['МБОУ Жирновская СОШ'];
const parallels = ['А', 'Б', 'В'];

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.readAsDataURL(file);
  });
}

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    school: schools[0],
    classNumber: '',
    parallel: '',
    photoDataUrl: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => {
      if (name === 'role' && value === 'teacher') {
        return { ...prev, role: value, classNumber: '', parallel: '' };
      }

      if (name === 'role' && value === 'student') {
        return {
          ...prev,
          role: value,
          classNumber: prev.classNumber || '',
          parallel: prev.parallel || ''
        };
      }

      return { ...prev, [name]: value };
    });
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setFormData((prev) => ({ ...prev, photoDataUrl: '' }));
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Можно загрузить только изображение.');
      return;
    }

    if (file.size > 1024 * 1024) {
      setError('Фотография должна быть меньше 1 МБ.');
      return;
    }

    try {
      setError('');
      const photoDataUrl = await readFileAsDataUrl(file);
      setFormData((prev) => ({ ...prev, photoDataUrl }));
    } catch (fileError) {
      setError('Не удалось загрузить фотографию.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/projects');
    } catch (submitError) {
      setError('Не удалось зарегистрироваться. Проверьте введённые данные.');
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
        <h1>Регистрация</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            <span>Имя</span>
            <input name="name" value={formData.name} onChange={handleChange} required />
          </label>

          <label>
            <span>Email</span>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </label>

          <label>
            <span>Пароль</span>
            <input type="password" name="password" value={formData.password} onChange={handleChange} minLength="6" required />
          </label>

          <label>
            <span>Роль</span>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="student">Ученик</option>
              <option value="teacher">Учитель</option>
            </select>
          </label>

          <label>
            <span>Школа</span>
            <select name="school" value={formData.school} onChange={handleChange}>
              {schools.map((school) => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
            </select>
          </label>

          {formData.role === 'student' && (
            <div className={styles.row}>
              <label>
                <span>Класс</span>
                <select name="classNumber" value={formData.classNumber} onChange={handleChange}>
                  <option value="">Выберите класс</option>
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Параллель</span>
                <select name="parallel" value={formData.parallel} onChange={handleChange}>
                  <option value="">Выберите параллель</option>
                  {parallels.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <div>
            <span>Фотография профиля</span>
            <label className={styles.photoPicker}>
              <input type="file" accept="image/*" onChange={handlePhotoChange} className={styles.hiddenInput} />
              {formData.photoDataUrl ? (
                <img src={formData.photoDataUrl} alt="Предпросмотр" className={styles.previewInline} />
              ) : (
                <span className={styles.photoButton}>Выбрать фотографию</span>
              )}
              <span className={styles.photoHint}>PNG или JPG до 1 МБ</span>
            </label>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <p>
          Уже есть аккаунт? <Link to="/login" className={styles.textLink}>Войти</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
