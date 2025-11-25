import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { generateClassCode } from '../utils/classCodeGenerator';
import { MAX_STUDENTS_PER_CLASS } from '../config/auth';

export async function createClass(teacherId, className, gradeLevel, description = '') {
  try {
    let classCode = generateClassCode();

    // 중복 코드 확인 및 재생성
    let isUnique = false;
    while (!isUnique) {
      const classDoc = await getDoc(doc(db, 'classes', classCode));
      if (!classDoc.exists()) {
        isUnique = true;
      } else {
        classCode = generateClassCode();
      }
    }

    const classData = {
      classCode,
      className,
      gradeLevel,
      description,
      teacherId,
      students: [],
      createdAt: new Date().toISOString(),
      maxStudents: MAX_STUDENTS_PER_CLASS
    };

    await setDoc(doc(db, 'classes', classCode), classData);
    return classData;
  } catch (error) {
    console.error('학급 생성 에러:', error);
    throw error;
  }
}

export async function getClassByCode(classCode) {
  try {
    const classDoc = await getDoc(doc(db, 'classes', classCode));
    if (classDoc.exists()) {
      return { ...classDoc.data(), classCode };
    }
    return null;
  } catch (error) {
    console.error('학급 조회 에러:', error);
    throw error;
  }
}

export async function getTeacherClasses(teacherId) {
  try {
    const q = query(collection(db, 'classes'), where('teacherId', '==', teacherId));
    const querySnapshot = await getDocs(q);
    const classes = [];
    querySnapshot.forEach((doc) => {
      classes.push({ ...doc.data(), classCode: doc.id });
    });
    return classes;
  } catch (error) {
    console.error('선생님 학급 조회 에러:', error);
    throw error;
  }
}

export async function joinClass(classCode, studentId, studentName) {
  try {
    const classRef = doc(db, 'classes', classCode);
    const classDoc = await getDoc(classRef);

    if (!classDoc.exists()) {
      throw new Error('존재하지 않는 학급 코드입니다.');
    }

    const classData = classDoc.data();

    // 학생 수 제한 확인
    if (classData.students.length >= MAX_STUDENTS_PER_CLASS) {
      throw new Error(`학급 정원이 초과되었습니다. (최대 ${MAX_STUDENTS_PER_CLASS}명)`);
    }

    // 이미 가입된 학생인지 확인
    if (classData.students.some(s => s.studentId === studentId)) {
      throw new Error('이미 가입된 학급입니다.');
    }

    // 학생 추가
    await updateDoc(classRef, {
      students: arrayUnion({
        studentId,
        studentName,
        joinedAt: new Date().toISOString()
      })
    });

    // 학생의 classCode 업데이트
    await updateDoc(doc(db, 'users', studentId), {
      classCode
    });

    return classData;
  } catch (error) {
    console.error('학급 가입 에러:', error);
    throw error;
  }
}

export async function removeStudentFromClass(classCode, studentId) {
  try {
    const classRef = doc(db, 'classes', classCode);
    const classDoc = await getDoc(classRef);

    if (!classDoc.exists()) {
      throw new Error('존재하지 않는 학급입니다.');
    }

    const classData = classDoc.data();
    const student = classData.students.find(s => s.studentId === studentId);

    if (!student) {
      throw new Error('해당 학생을 찾을 수 없습니다.');
    }

    await updateDoc(classRef, {
      students: arrayRemove(student)
    });

    // 학생의 classCode 제거
    await updateDoc(doc(db, 'users', studentId), {
      classCode: null
    });

    return true;
  } catch (error) {
    console.error('학생 제거 에러:', error);
    throw error;
  }
}

export async function deleteClass(classCode) {
  try {
    const classRef = doc(db, 'classes', classCode);
    const classDoc = await getDoc(classRef);

    if (!classDoc.exists()) {
      throw new Error('존재하지 않는 학급입니다.');
    }

    const classData = classDoc.data();

    // 모든 학생의 classCode 제거
    for (const student of classData.students) {
      await updateDoc(doc(db, 'users', student.studentId), {
        classCode: null
      });
    }

    // 학급 삭제
    await deleteDoc(classRef);
    return true;
  } catch (error) {
    console.error('학급 삭제 에러:', error);
    throw error;
  }
}
