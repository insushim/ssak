import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export async function createAssignment(teacherId, classCode, title, description, dueDate, minScore = 70, maxAiProbability = 50) {
  try {
    const assignment = {
      teacherId,
      classCode,
      title,
      description,
      dueDate,
      minScore,
      maxAiProbability,
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'assignments'), assignment);
    return { id: docRef.id, ...assignment };
  } catch (error) {
    console.error('과제 생성 에러:', error);
    throw error;
  }
}

export async function getAssignmentsByClass(classCode) {
  try {
    const q = query(
      collection(db, 'assignments'),
      where('classCode', '==', classCode)
    );
    const snapshot = await getDocs(q);
    const assignments = [];
    snapshot.forEach((doc) => {
      assignments.push({ id: doc.id, ...doc.data() });
    });
    return assignments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('과제 목록 로드 에러:', error);
    throw error;
  }
}

export async function deleteAssignment(assignmentId) {
  try {
    await deleteDoc(doc(db, 'assignments', assignmentId));
  } catch (error) {
    console.error('과제 삭제 에러:', error);
    throw error;
  }
}

export async function submitAssignment(studentId, studentName, assignmentId, content) {
  try {
    const submission = {
      studentId,
      studentName,
      assignmentId,
      content,
      submittedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'submissions'), submission);
    return { id: docRef.id, ...submission };
  } catch (error) {
    console.error('과제 제출 에러:', error);
    throw error;
  }
}

export async function getSubmissionsByAssignment(assignmentId) {
  try {
    const q = query(
      collection(db, 'submissions'),
      where('assignmentId', '==', assignmentId)
    );
    const snapshot = await getDocs(q);
    const submissions = [];
    snapshot.forEach((doc) => {
      submissions.push({ id: doc.id, ...doc.data() });
    });
    return submissions;
  } catch (error) {
    console.error('제출 목록 로드 에러:', error);
    throw error;
  }
}

export async function getSubmissionsByStudent(studentId) {
  try {
    const q = query(
      collection(db, 'submissions'),
      where('studentId', '==', studentId)
    );
    const snapshot = await getDocs(q);
    const submissions = [];
    snapshot.forEach((doc) => {
      submissions.push({ id: doc.id, ...doc.data() });
    });
    return submissions;
  } catch (error) {
    console.error('내 제출 목록 로드 에러:', error);
    throw error;
  }
}
