import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { analyzeWriting, detectPlagiarism } from '../utils/geminiAPI';
import { PASSING_SCORE, PLAGIARISM_THRESHOLD } from '../config/auth';

export async function saveWriting(studentId, writingData, isDraft = true) {
  try {
    const writingId = `${studentId}_${Date.now()}`;
    const data = {
      ...writingData,
      studentId,
      writingId,
      isDraft,
      lastSavedAt: new Date().toISOString(),
      createdAt: writingData.createdAt || new Date().toISOString()
    };

    await setDoc(doc(db, 'writings', writingId), data);
    return data;
  } catch (error) {
    console.error('글 저장 에러:', error);
    throw error;
  }
}

export async function getStudentWritings(studentId) {
  try {
    const q = query(
      collection(db, 'writings'),
      where('studentId', '==', studentId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const writings = [];
    querySnapshot.forEach((doc) => {
      writings.push(doc.data());
    });
    return writings;
  } catch (error) {
    console.error('학생 글 조회 에러:', error);
    throw error;
  }
}

export async function getWritingById(writingId) {
  try {
    const writingDoc = await getDoc(doc(db, 'writings', writingId));
    if (writingDoc.exists()) {
      return writingDoc.data();
    }
    return null;
  } catch (error) {
    console.error('글 조회 에러:', error);
    throw error;
  }
}

export async function submitWriting(studentId, writingData) {
  try {
    // 1. 이전 제출물 가져오기 (표절 검사용)
    const previousSubmissions = await getStudentWritings(studentId);
    const previousContents = previousSubmissions
      .filter(w => !w.isDraft && w.writingId !== writingData.writingId)
      .map(w => ({ content: w.content }));

    // 2. 표절 검사
    let plagiarismResult = null;
    if (previousContents.length > 0) {
      plagiarismResult = await detectPlagiarism(writingData.content, previousContents);

      if (plagiarismResult.isPlagiarized) {
        throw new Error(
          `표절이 감지되었습니다. 유사도: ${plagiarismResult.similarityPercentage}%\n` +
          `자신의 생각과 표현으로 글을 작성해주세요.`
        );
      }
    }

    // 3. AI 분석
    const analysisResult = await analyzeWriting(
      writingData.content,
      writingData.gradeLevel,
      writingData.topic
    );

    // 4. 기준 점수 확인
    if (analysisResult.score < PASSING_SCORE) {
      throw new Error(
        `기준 점수(${PASSING_SCORE}점)에 미달했습니다. 현재 점수: ${analysisResult.score}점\n` +
        `피드백을 참고하여 글을 수정해주세요.`
      );
    }

    // 5. 제출
    const writingId = writingData.writingId || `${studentId}_${Date.now()}`;
    const submissionData = {
      ...writingData,
      writingId,
      studentId,
      isDraft: false,
      submittedAt: new Date().toISOString(),
      analysis: analysisResult,
      plagiarismCheck: plagiarismResult,
      score: analysisResult.score
    };

    await setDoc(doc(db, 'writings', writingId), submissionData);

    // 6. 학생 통계 업데이트
    await updateStudentStats(studentId, analysisResult.score);

    return submissionData;
  } catch (error) {
    console.error('글 제출 에러:', error);
    throw error;
  }
}

export async function updateStudentStats(studentId, score) {
  try {
    const statsRef = doc(db, 'studentStats', studentId);
    const statsDoc = await getDoc(statsRef);

    if (statsDoc.exists()) {
      const currentStats = statsDoc.data();
      const newTotalSubmissions = currentStats.totalSubmissions + 1;
      const newTotalScore = currentStats.totalScore + score;
      const newAverageScore = newTotalScore / newTotalSubmissions;

      await updateDoc(statsRef, {
        totalSubmissions: newTotalSubmissions,
        totalScore: newTotalScore,
        averageScore: Math.round(newAverageScore * 10) / 10,
        lastSubmittedAt: new Date().toISOString(),
        scores: [...currentStats.scores, score]
      });
    } else {
      await setDoc(statsRef, {
        studentId,
        totalSubmissions: 1,
        totalScore: score,
        averageScore: score,
        lastSubmittedAt: new Date().toISOString(),
        scores: [score]
      });
    }
  } catch (error) {
    console.error('학생 통계 업데이트 에러:', error);
    throw error;
  }
}

export async function getStudentStats(studentId) {
  try {
    const statsDoc = await getDoc(doc(db, 'studentStats', studentId));
    if (statsDoc.exists()) {
      return statsDoc.data();
    }
    return {
      totalSubmissions: 0,
      averageScore: 0,
      scores: []
    };
  } catch (error) {
    console.error('학생 통계 조회 에러:', error);
    throw error;
  }
}

export async function getClassWritings(classCode) {
  try {
    // 학급의 학생 목록 가져오기
    const classDoc = await getDoc(doc(db, 'classes', classCode));
    if (!classDoc.exists()) {
      throw new Error('존재하지 않는 학급입니다.');
    }

    const classData = classDoc.data();
    const studentIds = classData.students.map(s => s.studentId);

    // 각 학생의 제출물 가져오기
    const allWritings = [];
    for (const studentId of studentIds) {
      const writings = await getStudentWritings(studentId);
      const submittedWritings = writings.filter(w => !w.isDraft);
      allWritings.push(...submittedWritings);
    }

    return allWritings.sort((a, b) =>
      new Date(b.submittedAt) - new Date(a.submittedAt)
    );
  } catch (error) {
    console.error('학급 글 조회 에러:', error);
    throw error;
  }
}

export async function deleteWriting(writingId) {
  try {
    await deleteDoc(doc(db, 'writings', writingId));
    return true;
  } catch (error) {
    console.error('글 삭제 에러:', error);
    throw error;
  }
}
