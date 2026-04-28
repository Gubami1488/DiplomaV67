import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../firebase/config';

const projectsCollection = collection(db, 'projects');
const tasksCollection = collection(db, 'tasks');

function mapSnapshot(snapshot) {
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function createProject(projectData) {
  return addDoc(projectsCollection, {
    ...projectData,
    createdAt: serverTimestamp()
  });
}

export async function getProjects() {
  const projectsQuery = query(projectsCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(projectsQuery);
  return mapSnapshot(snapshot);
}

export async function getProjectById(projectId) {
  const snapshot = await getDoc(doc(db, 'projects', projectId));
  if (!snapshot.exists()) {
    return null;
  }

  return { id: snapshot.id, ...snapshot.data() };
}

export async function getProjectsByTeacher(teacherId) {
  const projectsQuery = query(projectsCollection, where('teacherId', '==', teacherId));
  const snapshot = await getDocs(projectsQuery);
  return mapSnapshot(snapshot);
}

export async function getProjectsByParticipant(userId) {
  const projectsQuery = query(projectsCollection, where('participants', 'array-contains', userId));
  const snapshot = await getDocs(projectsQuery);
  return mapSnapshot(snapshot);
}

export async function updateProjectParticipants(projectId, participants) {
  await updateDoc(doc(db, 'projects', projectId), { participants });
}

export async function createTask(taskData) {
  return addDoc(tasksCollection, {
    ...taskData,
    createdAt: serverTimestamp()
  });
}

export async function getTasksByProject(projectId) {
  const tasksQuery = query(tasksCollection, where('projectId', '==', projectId));
  const snapshot = await getDocs(tasksQuery);
  return mapSnapshot(snapshot);
}

export async function updateTaskStatus(taskId, status) {
  await updateDoc(doc(db, 'tasks', taskId), { status });
}

export async function getUsersByRole(role) {
  const usersQuery = query(collection(db, 'users'), where('role', '==', role));
  const snapshot = await getDocs(usersQuery);
  return mapSnapshot(snapshot);
}
