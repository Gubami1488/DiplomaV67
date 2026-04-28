import { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import { getProjectsByParticipant, getProjectsByTeacher } from '../services/projectService';
import { updateUserProfile } from '../services/userService';
import styles from './ProfilePage.module.css';

const schools = ['МБОУ Жирновская СОШ'];
const classNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
const parallels = ['А', 'Б', 'В'];

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.readAsDataURL(file);
  });
}

function ProfilePage() {
  const { user, profile, updateProfileState } = useAuth();
  const [projectsCount, setProjectsCount] = useState(0);
  const [formData, setFormData] = useState({ school: '', classNumber: '', parallel: '', photoDataUrl: '' });
  const [saveMessage, setSaveMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setFormData({
      school: profile.school || '',
      classNumber: profile.classNumber || '',
      parallel: profile.parallel || '',
      photoDataUrl: profile.photoDataUrl || ''
    });
  }, [profile]);

  useEffect(() => {
    async function loadCount() {
      if (!user || !profile) {
        return;
      }

      const projects =
        profile.role === 'teacher' ? await getProjectsByTeacher(user.uid) : await getProjectsByParticipant(user.uid);

      setProjectsCount(projects.length);
    }

    loadCount();
  }, [user, profile]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
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
    } catch (loadError) {
      setError('Не удалось загрузить фотографию.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSaveMessage('');

    try {
      await updateUserProfile(user.uid, formData);
      updateProfileState(formData);
      setSaveMessage('Профиль успешно обновлён.');
    } catch (saveError) {
      setError('Не удалось сохранить профиль.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <section className={styles.grid}>
        <article className={styles.card}>
          <div className={styles.profileHeader}>
            <label className={styles.avatarUpload}>
              {formData.photoDataUrl ? (
                <img src={formData.photoDataUrl} alt={profile.name} className={styles.avatar} />
              ) : (
                <div className={styles.avatarPlaceholder}>{profile?.name?.slice(0, 1)?.toUpperCase() || '?'}</div>
              )}
              <input type="file" accept="image/*" onChange={handlePhotoChange} className={styles.hiddenInput} />
            </label>

            <div className={styles.infoBlock}>
              <p>
                <strong>Имя:</strong> {profile?.name}
              </p>
              <p>
                <strong>Email:</strong> {profile?.email}
              </p>
              <p>
                <strong>Роль:</strong> {profile?.role === 'teacher' ? 'учитель' : 'ученик'}
              </p>
            </div>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
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

            {profile?.role === 'student' && (
              <div className={styles.formRow}>
                <label>
                  <span>Класс</span>
                  <select name="classNumber" value={formData.classNumber} onChange={handleChange}>
                    <option value="">Не указан</option>
                    {classNumbers.map((classNumber) => (
                      <option key={classNumber} value={classNumber}>
                        {classNumber}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Параллель</span>
                  <select name="parallel" value={formData.parallel} onChange={handleChange}>
                    <option value="">Не указана</option>
                    {parallels.map((parallel) => (
                      <option key={parallel} value={parallel}>
                        {parallel}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            {error && <div className={styles.error}>{error}</div>}
            {saveMessage && <div className={styles.success}>{saveMessage}</div>}

            <button type="submit" disabled={saving}>
              {saving ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </form>
        </article>
      </section>
    </>
  );
}

export default ProfilePage;
