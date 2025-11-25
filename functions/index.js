const {onCall, HttpsError} = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();
const MAX_STUDENTS_PER_CLASS = 40;

exports.batchCreateStudents = onCall(async (request) => {
  // In v2, auth is in request.auth
  if (!request.auth) {
    throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const data = request.data;

  const { classCode, count, prefix, gradeLevel } = data || {};
  const total = Number(count);

  if (!classCode) {
    throw new HttpsError('invalid-argument', 'classCode가 필요합니다.');
  }

  if (!total || total < 1 || total > MAX_STUDENTS_PER_CLASS) {
    throw new HttpsError('invalid-argument', `생성 인원은 1~${MAX_STUDENTS_PER_CLASS}명이어야 합니다.`);
  }

  if (!gradeLevel) {
    throw new HttpsError('invalid-argument', 'gradeLevel이 필요합니다.');
  }

  const teacherUid = request.auth.uid;
  const teacherRef = db.doc(`users/${teacherUid}`);
  const teacherSnap = await teacherRef.get();

  if (!teacherSnap.exists) {
    throw new HttpsError('permission-denied', '교사 프로필을 찾을 수 없습니다.');
  }

  const teacherData = teacherSnap.data();
  const isAdmin = teacherData.role === 'super_admin';

  if (!isAdmin && teacherData.role !== 'teacher') {
    throw new HttpsError('permission-denied', '교사만 학생 계정을 생성할 수 있습니다.');
  }

  const classRef = db.doc(`classes/${classCode}`);
  const classSnap = await classRef.get();

  if (!classSnap.exists) {
    throw new HttpsError('not-found', '클래스를 찾을 수 없습니다.');
  }

  const classData = classSnap.data();

  if (!isAdmin && classData.teacherId !== teacherUid) {
    throw new HttpsError('permission-denied', '해당 클래스의 담당 교사만 생성할 수 있습니다.');
  }

  const currentStudents = Array.isArray(classData.students) ? classData.students.length : 0;
  if (currentStudents + total > MAX_STUDENTS_PER_CLASS) {
    throw new HttpsError(
      'failed-precondition',
      `클래스 정원을 초과합니다. 현재 ${currentStudents}명, 최대 ${MAX_STUDENTS_PER_CLASS}명입니다.`
    );
  }

  const cleanedPrefix = (prefix || classCode || 'student')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') || 'student';
  const domain = (teacherData.email || '').split('@')[1] || 'example.com';
  const now = new Date().toISOString();

  const results = [];
  const newStudents = [];

  for (let i = 1; i <= total; i++) {
    const seq = String(currentStudents + i).padStart(3, '0');
    const email = `${cleanedPrefix}${seq}@${domain}`;
    // Firebase requires minimum 6 characters for password
    // Always use format: prefix + seq + "123" to ensure 6+ characters
    const basePassword = `${cleanedPrefix}${seq}`;
    const password = basePassword.length >= 6 ? basePassword : `${basePassword}123`;
    const displayName = `학생${seq}`;

    try {
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName
      });

      await db.doc(`users/${userRecord.uid}`).set({
        uid: userRecord.uid,
        email,
        name: displayName,
        role: 'student',
        approved: true,
        gradeLevel,
        classCode,
        createdAt: now,
        createdBy: teacherUid
      });

      newStudents.push({
        studentId: userRecord.uid,
        studentName: displayName,
        joinedAt: now
      });

      results.push({ email, password, status: 'created' });
    } catch (error) {
      results.push({
        email,
        password: null,
        status: 'skipped',
        message: error.message
      });
    }
  }

  if (newStudents.length > 0) {
    await classRef.update({
      students: admin.firestore.FieldValue.arrayUnion(...newStudents)
    });
  }

  return {
    created: results.filter((r) => r.status === 'created').length,
    attempted: total,
    results
  };
});

// Delete user (both Auth and Firestore)
exports.deleteUser = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const data = request.data;
  const {userId} = data;

  if (!userId) {
    throw new HttpsError('invalid-argument', 'userId가 필요합니다.');
  }

  // Check if requester is super admin
  const requesterRef = db.doc(`users/${request.auth.uid}`);
  const requesterSnap = await requesterRef.get();

  if (!requesterSnap.exists || requesterSnap.data().role !== 'super_admin') {
    throw new HttpsError('permission-denied', '슈퍼 관리자만 사용자를 삭제할 수 있습니다.');
  }

  try {
    // Delete from Firebase Auth
    await auth.deleteUser(userId);

    // Delete from Firestore
    await db.doc(`users/${userId}`).delete();

    return {success: true, message: '사용자가 삭제되었습니다.'};
  } catch (error) {
    throw new HttpsError('internal', `삭제 실패: ${error.message}`);
  }
});

// Batch delete users
exports.batchDeleteUsers = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const data = request.data;
  const {userIds} = data;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    throw new HttpsError('invalid-argument', 'userIds 배열이 필요합니다.');
  }

  // Check if requester is super admin
  const requesterRef = db.doc(`users/${request.auth.uid}`);
  const requesterSnap = await requesterRef.get();

  if (!requesterSnap.exists || requesterSnap.data().role !== 'super_admin') {
    throw new HttpsError('permission-denied', '슈퍼 관리자만 사용자를 삭제할 수 있습니다.');
  }

  const results = [];

  for (const userId of userIds) {
    try {
      // Delete from Firebase Auth
      await auth.deleteUser(userId);

      // Delete from Firestore
      await db.doc(`users/${userId}`).delete();

      results.push({userId, status: 'deleted'});
    } catch (error) {
      results.push({userId, status: 'failed', error: error.message});
    }
  }

  const deleted = results.filter((r) => r.status === 'deleted').length;
  return {
    deleted,
    attempted: userIds.length,
    results
  };
});
