import { httpsCallable } from 'firebase/functions';
import { functions, auth } from '../config/firebase';

/**
 * Batch create student accounts using Cloud Function
 *
 * This uses Firebase Cloud Functions with Admin SDK to create users
 * without triggering auth state changes on the client.
 */
export async function batchCreateStudents({ classCode, count, prefix, gradeLevel }) {
  try {
    // Check if user is authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');
    }

    console.log('Current user:', currentUser.uid, currentUser.email);

    // Get ID token to verify authentication
    try {
      const token = await currentUser.getIdToken();
      console.log('ID Token exists:', !!token);
    } catch (tokenError) {
      console.error('Token error:', tokenError);
      throw new Error('인증 토큰을 가져올 수 없습니다. 다시 로그인해주세요.');
    }

    const total = Number(count);

    if (!classCode) {
      throw new Error('classCode가 필요합니다.');
    }

    if (!total || total < 1 || total > 40) {
      throw new Error(`생성 인원은 1~40명이어야 합니다.`);
    }

    if (!gradeLevel) {
      throw new Error('gradeLevel이 필요합니다.');
    }

    // Call Cloud Function to create students
    const batchCreateFn = httpsCallable(functions, 'batchCreateStudents');

    const result = await batchCreateFn({
      classCode,
      count: total,
      prefix: prefix || classCode,
      gradeLevel
    });

    return {
      created: result.data.created,
      attempted: result.data.attempted,
      results: result.data.results,
      requiresRelogin: false
    };

  } catch (error) {
    console.error('Error in batchCreateStudents:', error);
    throw new Error(error.message || '일괄 생성에 실패했습니다.');
  }
}
