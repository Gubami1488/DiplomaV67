const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');

const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

function initFirebaseAdmin() {
  if (admin.apps.length) {
    return;
  }

  if (fs.existsSync(SERVICE_ACCOUNT_FILE)) {
    const serviceAccount = require(SERVICE_ACCOUNT_FILE);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    return;
  }

  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

function pickRandom(items, count) {
  const pool = [...items];
  const result = [];

  while (pool.length && result.length < count) {
    const index = Math.floor(Math.random() * pool.length);
    result.push(pool[index]);
    pool.splice(index, 1);
  }

  return result;
}

function plusDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return admin.firestore.Timestamp.fromDate(date);
}

async function loadUsersByRole(db, role) {
  const snapshot = await db.collection('users').where('role', '==', role).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

function getProjectTemplates() {
  return [
    {
      title: 'Экологический патруль школы',
      description: 'Исследование экологического состояния школьной территории и подготовка предложений по улучшению.',
      theme: 'Экология и проектная деятельность',
      targetClass: '8',
      targetParallel: 'А',
      status: 'активный',
      deadlineInDays: 30
    },
    {
      title: 'История родного края',
      description: 'Сбор материалов и создание интерактивной презентации о значимых местах района.',
      theme: 'История и краеведение',
      targetClass: '7',
      targetParallel: 'Б',
      status: 'планируется',
      deadlineInDays: 40
    },
    {
      title: 'Биология в объективе',
      description: 'Подготовка фото-атласа растений и насекомых на территории школы.',
      theme: 'Биология',
      targetClass: '6',
      targetParallel: 'В',
      status: 'активный',
      deadlineInDays: 25
    },
    {
      title: 'Математика вокруг нас',
      description: 'Практические задачи по математике на основе реальных школьных ситуаций.',
      theme: 'Математика',
      targetClass: '9',
      targetParallel: 'А',
      status: 'планируется',
      deadlineInDays: 35
    },
    {
      title: 'Школьный медиацентр',
      description: 'Создание серии коротких видео о школьных мероприятиях и интервью с участниками.',
      theme: 'Медиа и коммуникации',
      targetClass: '10',
      targetParallel: 'Б',
      status: 'активный',
      deadlineInDays: 28
    },
    {
      title: 'Английский для общения',
      description: 'Разработка разговорного мини-курса английского для школьного клуба.',
      theme: 'Иностранные языки',
      targetClass: '5',
      targetParallel: 'В',
      status: 'планируется',
      deadlineInDays: 32
    },
    {
      title: 'Физика простых экспериментов',
      description: 'Подготовка набора безопасных экспериментов и публичная демонстрация.',
      theme: 'Физика',
      targetClass: '11',
      targetParallel: 'А',
      status: 'активный',
      deadlineInDays: 45
    },
    {
      title: 'Цифровая безопасность школьника',
      description: 'Создание памятки и серии постеров о безопасном поведении в интернете.',
      theme: 'Информатика',
      targetClass: '4',
      targetParallel: 'А',
      status: 'планируется',
      deadlineInDays: 22
    }
  ];
}

function getTaskTemplates() {
  return [
    {
      title: 'Сбор исходных материалов',
      description: 'Собрать данные и материалы для стартового этапа проекта.',
      status: 'выполнено',
      deadlineInDays: 5
    },
    {
      title: 'Подготовка структуры результата',
      description: 'Согласовать структуру итогового продукта и распределить блоки.',
      status: 'в процессе',
      deadlineInDays: 10
    },
    {
      title: 'Основная реализация',
      description: 'Подготовить основной контент или исследование по теме проекта.',
      status: 'к выполнению',
      deadlineInDays: 16
    },
    {
      title: 'Финальная презентация',
      description: 'Оформить результаты и подготовить выступление команды.',
      status: 'к выполнению',
      deadlineInDays: 21
    }
  ];
}

async function run() {
  try {
    initFirebaseAdmin();
    const db = admin.firestore();

    const teachers = await loadUsersByRole(db, 'teacher');
    const students = await loadUsersByRole(db, 'student');

    if (!teachers.length) {
      throw new Error('Не найдены учителя в коллекции users. Сначала запустите seed-users.js');
    }

    if (!students.length) {
      throw new Error('Не найдены ученики в коллекции users. Сначала запустите seed-users.js');
    }

    const projectTemplates = getProjectTemplates();
    const taskTemplates = getTaskTemplates();
    let createdProjects = 0;
    let createdTasks = 0;

    for (let i = 0; i < projectTemplates.length; i += 1) {
      const template = projectTemplates[i];
      const teacher = teachers[i % teachers.length];

      const classStudents = students.filter(
        (student) => student.classNumber === template.targetClass && student.parallel === template.targetParallel
      );

      const selectedStudents = classStudents.length
        ? pickRandom(classStudents, Math.min(4, classStudents.length))
        : pickRandom(students, Math.min(4, students.length));

      const participants = selectedStudents.map((student) => student.uid);

      const projectRef = await db.collection('projects').add({
        title: template.title,
        description: template.description,
        theme: template.theme,
        deadline: plusDays(template.deadlineInDays),
        status: template.status,
        teacherId: teacher.uid,
        participants,
        targetClass: template.targetClass,
        targetParallel: template.targetParallel,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      createdProjects += 1;

      for (let t = 0; t < taskTemplates.length; t += 1) {
        const taskTemplate = taskTemplates[t];
        const assignee = selectedStudents[t % selectedStudents.length] || students[t % students.length];

        await db.collection('tasks').add({
          projectId: projectRef.id,
          title: taskTemplate.title,
          description: taskTemplate.description,
          deadline: plusDays(taskTemplate.deadlineInDays + i),
          status: taskTemplate.status,
          assigneeId: assignee.uid,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        createdTasks += 1;
      }

      console.log(`PROJECT CREATED: ${template.title} (участников: ${participants.length})`);
    }

    console.log('---');
    console.log(`Готово. Проектов создано: ${createdProjects}, задач создано: ${createdTasks}`);
    process.exit(0);
  } catch (error) {
    console.error('Ошибка seed-projects:', error.message);
    process.exit(1);
  }
}

run();
