const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const ROOT_DIR = path.resolve(__dirname, '..');
const USERS_FILE = path.join(ROOT_DIR, 'users.json');
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    throw new Error(`Не найден файл: ${USERS_FILE}`);
  }

  const raw = fs.readFileSync(USERS_FILE, 'utf-8');
  const users = JSON.parse(raw);

  if (!Array.isArray(users) || users.length === 0) {
    throw new Error('users.json должен содержать непустой массив пользователей');
  }

  return users;
}

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

async function getOrCreateAuthUser(user) {
  try {
    const existing = await admin.auth().getUserByEmail(user.email);
    return { authUser: existing, created: false };
  } catch (error) {
    if (error.code !== 'auth/user-not-found') {
      throw error;
    }

    const created = await admin.auth().createUser({
      email: user.email,
      password: user.password,
      displayName: user.name
    });

    return { authUser: created, created: true };
  }
}

async function upsertFirestoreProfile(authUser, user) {
  const profile = {
    uid: authUser.uid,
    name: user.name,
    email: user.email,
    role: user.role,
    school: user.school || '',
    classNumber: user.classNumber || '',
    parallel: user.parallel || '',
    photoDataUrl: user.photoDataUrl || '',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await admin.firestore().collection('users').doc(authUser.uid).set(profile, { merge: true });
}

async function run() {
  try {
    initFirebaseAdmin();
    const users = loadUsers();

    let createdCount = 0;
    let updatedCount = 0;

    for (const user of users) {
      if (!user.email || !user.password || !user.name || !user.role) {
        console.log(`SKIP: пропущен пользователь с неполными данными (${user.email || 'без email'})`);
        continue;
      }

      const { authUser, created } = await getOrCreateAuthUser(user);
      await upsertFirestoreProfile(authUser, user);

      if (created) {
        createdCount += 1;
        console.log(`CREATED: ${user.email}`);
      } else {
        updatedCount += 1;
        console.log(`UPDATED: ${user.email}`);
      }
    }

    console.log('---');
    console.log(`Готово. Создано: ${createdCount}, обновлено: ${updatedCount}`);
    process.exit(0);
  } catch (error) {
    console.error('Ошибка seed-скрипта:', error.message);
    process.exit(1);
  }
}

run();
