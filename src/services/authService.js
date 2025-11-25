import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { SUPER_ADMIN_UID, ROLES } from '../config/auth';

async function ensureSuperAdminProfile(user, existingDoc) {
  const superRef = doc(db, 'users', user.uid);
  const now = new Date().toISOString();
  const baseProfile = {
    uid: user.uid,
    email: user.email || existingDoc?.email || '',
    role: ROLES.SUPER_ADMIN,
    approved: true,
    name: existingDoc?.name || '슈퍼 관리자',
    createdAt: existingDoc?.createdAt || now
  };

  if (!existingDoc) {
    await setDoc(superRef, baseProfile);
    return baseProfile;
  }

  if (existingDoc.role !== ROLES.SUPER_ADMIN || existingDoc.approved !== true) {
    await updateDoc(superRef, {
      role: ROLES.SUPER_ADMIN,
      approved: true
    });
  }

  return { ...existingDoc, role: ROLES.SUPER_ADMIN, approved: true };
}

export async function ensureSuperAdminAccess(user) {
  if (!user) return null;

  const userRef = doc(db, 'users', user.uid);
  const now = new Date().toISOString();

  const profile = {
    uid: user.uid,
    email: user.email || '',
    role: ROLES.SUPER_ADMIN,
    approved: true,
    name: '슈퍼 관리자',
    createdAt: now
  };

  await setDoc(userRef, profile, { merge: true });
  return profile;
}

export async function registerUser(email, password, role, additionalData = {}) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Firestore에 사용자 정보 저장
    const userData = {
      uid: user.uid,
      email: user.email,
      role: role,
      approved: role === ROLES.STUDENT ? true : false, // 학생은 자동 승인, 선생님은 승인 대기
      createdAt: new Date().toISOString(),
      ...additionalData
    };

    await setDoc(doc(db, 'users', user.uid), userData);

    return { user, userData };
  } catch (error) {
    console.error('회원가입 에러:', error);
    throw error;
  }
}

export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Firestore에서 사용자 정보 가져오기
    const userDoc = await getDoc(doc(db, 'users', user.uid));

    if (!userDoc.exists()) {
      if (user.uid === SUPER_ADMIN_UID) {
        const superProfile = await ensureSuperAdminProfile(user, null);
        return { user, userData: superProfile };
      }
      throw new Error('사용자 정보를 찾을 수 없습니다.');
    }

    const userData = userDoc.data();

    // 슈퍼 관리자 확인
    if (user.uid === SUPER_ADMIN_UID) {
      const ensuredProfile = await ensureSuperAdminProfile(user, userData);
      return { user, userData: ensuredProfile };
    }

    // 승인되지 않은 선생님인 경우
    if (userData.role === ROLES.TEACHER && !userData.approved) {
      throw new Error('아직 승인되지 않은 계정입니다. 관리자의 승인을 기다려주세요.');
    }

    return { user, userData };
  } catch (error) {
    console.error('로그인 에러:', error);
    throw error;
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('로그아웃 에러:', error);
    throw error;
  }
}

export async function getUserData(uid) {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (uid === SUPER_ADMIN_UID) {
      const ensuredProfile = await ensureSuperAdminProfile(
        auth.currentUser || { uid, email: userDoc.data()?.email },
        userDoc.exists() ? userDoc.data() : null
      );
      return ensuredProfile;
    }

    if (userDoc.exists()) {
      return userDoc.data();
    }

    return null;
  } catch (error) {
    console.error('사용자 정보 조회 에러:', error);
    throw error;
  }
}

export async function updateUserData(uid, data) {
  try {
    await updateDoc(doc(db, 'users', uid), data);
  } catch (error) {
    console.error('사용자 정보 업데이트 에러:', error);
    throw error;
  }
}
