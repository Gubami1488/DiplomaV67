import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHero from '../components/PageHero';
import ProgressBar from '../components/ProgressBar';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import useAuth from '../hooks/useAuth';
import {
  createTask,
  getProjectById,
  getTasksByProject,
  updateTaskStatus
} from '../services/projectService';
import { getAllUsers } from '../services/userService';
import { calculateProgress, formatDate } from '../utils/formatters';
import styles from './ProjectDetailsPage.module.css';

function ProjectDetailsPage() {
  const { projectId } = useParams();
  const { user, profile } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [savingTask, setSavingTask] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canManageProject = profile?.role === 'teacher' && project?.teacherId === user?.uid;
  const canViewProject = profile?.role === 'teacher' || project?.participants?.includes(user?.uid);

  const participantsData = useMemo(() => {
    if (!project?.participants?.length) {
      return [];
    }

    return allUsers.filter((item) => project.participants.includes(item.uid));
  }, [allUsers, project]);

  const availableAssignees = useMemo(() => {
    const students = allUsers.filter((item) => item.role === 'student');

    if (!project) {
      return students;
    }

    return students.filter((student) => {
      const classMatch = !project.targetClass || student.classNumber === project.targetClass;
      return classMatch;
    });
  }, [allUsers, project]);

  const progress = useMemo(() => calculateProgress(tasks), [tasks]);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [projectData, tasksData, usersData] = await Promise.all([
        getProjectById(projectId),
        getTasksByProject(projectId),
        getAllUsers()
      ]);

      const usersMap = new Map(usersData.map((item) => [item.uid, item.name]));
      const tasksWithNames = tasksData.map((task) => ({
        ...task,
        assigneeName: usersMap.get(task.assigneeId)
      }));

      setProject(projectData);
      setTasks(tasksWithNames);
      setAllUsers(usersData);
    } catch (loadError) {
      setError('Не удалось загрузить проект. Проверьте права доступа и данные Firestore.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const handleTaskCreate = async (taskData) => {
    setSavingTask(true);
    setError('');

    try {
      await createTask({ ...taskData, projectId });
      await loadData();
      setIsTaskModalOpen(false);
    } catch (saveError) {
      setError('Не удалось добавить задачу в проект.');
    } finally {
      setSavingTask(false);
    }
  };

  const handleTaskStatusChange = async (taskId, status) => {
    const targetTask = tasks.find((task) => task.id === taskId);
    const isAllowed = canManageProject || targetTask?.assigneeId === user?.uid;

    if (!isAllowed) {
      return;
    }

    try {
      setError('');
      await updateTaskStatus(taskId, status);
      setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status } : task)));
    } catch (saveError) {
      setError('Не удалось изменить статус задачи.');
    }
  };

  if (loading) {
    return <div className="pageState">Загрузка проекта...</div>;
  }

  if (!project) {
    return <div className="emptyState">{error || 'Проект не найден.'}</div>;
  }

  if (!canViewProject) {
    return <div className="emptyState">У вас нет доступа к этому проекту.</div>;
  }

  return (
    <div className={styles.layout}>
      <div className={styles.mainColumn}>
        <PageHero title={project.title} description={project.description} />

        <section className={styles.detailsCard}>
          <div className={styles.detailsGrid}>
            <div>
              <strong>Тема</strong>
              <p>{project.theme}</p>
            </div>
            <div>
              <strong>Срок выполнения</strong>
              <p>{formatDate(project.deadline)}</p>
            </div>
            <div>
              <strong>Статус</strong>
              <p>{project.status}</p>
            </div>
            <div>
              <strong>Класс проекта</strong>
              <p>{project.targetClass || 'Не указан'}</p>
            </div>
            <div>
              <strong>Параллель</strong>
              <p>{project.targetParallel || 'Не указана'}</p>
            </div>
            <div>
              <strong>Дата создания</strong>
              <p>{formatDate(project.createdAt)}</p>
            </div>
          </div>
        </section>

        <ProgressBar value={progress} />

        {error && <div className="emptyState">{error}</div>}

        {canManageProject && (
          <button type="button" className={styles.openTaskButton} onClick={() => setIsTaskModalOpen(true)}>
            Добавить задачу
          </button>
        )}

        <section>
          <h2>Задачи проекта</h2>
          <TaskList
            tasks={tasks}
            canManage={canManageProject}
            currentUserId={user?.uid}
            onStatusChange={handleTaskStatusChange}
          />
        </section>
      </div>

      <aside className={styles.sidebar}>
        <section className={styles.sideCard}>
          <h3>Участники</h3>
          {participantsData.length ? (
            <div className={styles.peopleList}>
              {participantsData.map((participant) => (
                <div key={participant.uid} className={styles.person}>
                  {participant.photoDataUrl ? (
                    <img src={participant.photoDataUrl} alt={participant.name} className={styles.personAvatar} />
                  ) : (
                    <span className={styles.personAvatarPlaceholder}>
                      {(participant.name || '?').trim().charAt(0).toUpperCase()}
                    </span>
                  )}

                  <div className={styles.personInfo}>
                    <strong>{participant.name}</strong>
                    <span>{participant.email}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Участники пока не назначены.</p>
          )}
        </section>
      </aside>

      {canManageProject && isTaskModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsTaskModalOpen(false)}>
          <div className={styles.modalCard} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Новая задача</h3>
              <button type="button" className={styles.modalClose} onClick={() => setIsTaskModalOpen(false)}>
                Закрыть
              </button>
            </div>

            {availableAssignees.length ? (
              <TaskForm participants={availableAssignees} onSubmit={handleTaskCreate} loading={savingTask} />
            ) : (
              <div className="emptyState">Для этого класса и параллели пока нет учеников для назначения задачи.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetailsPage;
