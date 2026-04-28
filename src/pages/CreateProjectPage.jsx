import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHero from '../components/PageHero';
import ProjectForm from '../components/ProjectForm';
import useAuth from '../hooks/useAuth';
import { createProject } from '../services/projectService';

function CreateProjectPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);

    try {
      const docRef = await createProject({
        ...formData,
        teacherId: user.uid,
        participants: []
      });

      navigate(`/projects/${docRef.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHero
        title="Создание проекта"
        description="Учитель может создать новый проект и позже назначить участников и задачи."
      />
      <ProjectForm onSubmit={handleSubmit} loading={loading} />
    </>
  );
}

export default CreateProjectPage;
