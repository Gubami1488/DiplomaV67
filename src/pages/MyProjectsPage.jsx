import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';
import useAuth from '../hooks/useAuth';
import { getProjectsByParticipant, getProjectsByTeacher } from '../services/projectService';
import styles from './MyProjectsPage.module.css';

function MyProjectsPage() {
  const { user, profile } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      if (!user || !profile) {
        return;
      }

      try {
        const data =
          profile.role === 'teacher' ? await getProjectsByTeacher(user.uid) : await getProjectsByParticipant(user.uid);
        setProjects(data);
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, [user, profile]);

  return (
    <>
      {profile?.role === 'teacher' && (
        <div className={styles.actions}>
          <Link to="/projects/create" className="primaryAction">
            Создать проект
          </Link>
        </div>
      )}

      {loading ? (
        <div className="pageState">Загрузка...</div>
      ) : projects.length ? (
        <section className={styles.grid}>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} isParticipant={project.participants?.includes(user.uid)} />
          ))}
        </section>
      ) : (
        <div className="emptyState">У пользователя пока нет связанных проектов.</div>
      )}
    </>
  );
}

export default MyProjectsPage;
