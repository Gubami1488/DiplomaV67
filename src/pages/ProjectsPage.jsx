import { useEffect, useMemo, useState } from 'react';
import ProjectCard from '../components/ProjectCard';
import useAuth from '../hooks/useAuth';
import { getProjects } from '../services/projectService';
import styles from './ProjectsPage.module.css';

function ProjectsPage() {
  const { profile, user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [parallelFilter, setParallelFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await getProjects();
        setProjects(data);
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = project.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesClass = classFilter === 'all' || project.targetClass === classFilter;
      const matchesParallel = parallelFilter === 'all' || project.targetParallel === parallelFilter;
      return matchesSearch && matchesStatus && matchesClass && matchesParallel;
    });
  }, [projects, search, statusFilter, classFilter, parallelFilter]);

  return (
    <>
      <section className={styles.filters}>
        <input
          type="text"
          placeholder="Поиск по названию"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">Все статусы</option>
          <option value="планируется">Планируется</option>
          <option value="активный">Активный</option>
          <option value="завершён">Завершён</option>
        </select>

        <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
          <option value="all">Все классы</option>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'].map((classOption) => (
            <option key={classOption} value={classOption}>
              {classOption}
            </option>
          ))}
        </select>

        <select value={parallelFilter} onChange={(event) => setParallelFilter(event.target.value)}>
          <option value="all">Все параллели</option>
          {['А', 'Б', 'В'].map((parallelOption) => (
            <option key={parallelOption} value={parallelOption}>
              {parallelOption}
            </option>
          ))}
        </select>
      </section>

      {loading ? (
        <div className="pageState">Загрузка проектов...</div>
      ) : filteredProjects.length ? (
        <section className={styles.grid}>
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isParticipant={project.participants?.includes(user?.uid)}
            />
          ))}
        </section>
      ) : (
        <div className="emptyState">Проекты не найдены.</div>
      )}
    </>
  );
}

export default ProjectsPage;
