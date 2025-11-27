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
import { analyzeWriting, detectPlagiarism, detectAIUsage } from '../utils/geminiAPI';
import { PASSING_SCORE, PLAGIARISM_THRESHOLD, WORD_COUNT_STANDARDS } from '../config/auth';

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

// 주제별 임시 저장 (덮어쓰기 방식)
export async function saveDraftByTopic(studentId, topic, writingData) {
  try {
    const draftId = `draft_${studentId}_${encodeURIComponent(topic)}`;
    const data = {
      ...writingData,
      studentId,
      topic,
      draftId,
      isDraft: true,
      lastSavedAt: new Date().toISOString(),
      createdAt: writingData.createdAt || new Date().toISOString()
    };

    await setDoc(doc(db, 'drafts', draftId), data);
    return data;
  } catch (error) {
    console.error('임시 저장 에러:', error);
    throw error;
  }
}

// 주제별 임시 저장 불러오기
export async function getDraftByTopic(studentId, topic) {
  try {
    const draftId = `draft_${studentId}_${encodeURIComponent(topic)}`;
    const draftDoc = await getDoc(doc(db, 'drafts', draftId));
    if (draftDoc.exists()) {
      return draftDoc.data();
    }
    return null;
  } catch (error) {
    console.error('임시 저장 불러오기 에러:', error);
    return null;
  }
}

// 임시 저장 삭제 (제출 후)
export async function deleteDraft(studentId, topic) {
  try {
    const draftId = `draft_${studentId}_${encodeURIComponent(topic)}`;
    await deleteDoc(doc(db, 'drafts', draftId));
    return true;
  } catch (error) {
    console.error('임시 저장 삭제 에러:', error);
    return false;
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

// isRewrite: 고쳐쓰기 모드 여부 (포인트 지급 조건에 영향)
export async function submitWriting(studentId, writingData, isRewrite = false) {
  try {
    // 글자 수 기준 가져오기
    const standard = WORD_COUNT_STANDARDS[writingData.gradeLevel];
    const wordCount = writingData.wordCount;

    // 1. 이전 제출물 가져오기 (표절 검사용)
    const previousSubmissions = await getStudentWritings(studentId);
    const previousContents = previousSubmissions
      .filter(w => !w.isDraft && w.writingId !== writingData.writingId)
      .map(w => ({ content: w.content }));

    // 2. 표절 검사 (자기 글은 제외 - 같은 주제의 이전 버전은 제외)
    let plagiarismResult = null;
    // 같은 주제의 글은 고쳐쓰기이므로 표절 검사에서 제외
    const otherTopicContents = previousContents.filter(w => {
      // 같은 주제의 글은 제외 (고쳐쓰기)
      const prevWriting = previousSubmissions.find(ps => ps.content === w.content);
      return prevWriting && prevWriting.topic !== writingData.topic;
    });

    if (otherTopicContents.length > 0) {
      plagiarismResult = await detectPlagiarism(writingData.content, otherTopicContents);
      // 표절 검사 결과는 기록만 하고 제출은 차단하지 않음
      if (plagiarismResult.isPlagiarized) {
        console.log(`표절 의심: ${plagiarismResult.similarityPercentage}% (참고사항으로만 기록)`);
      }
    }

    // 3. AI 사용 감지 (참고사항으로만 - 제출 차단하지 않음)
    const aiUsageResult = await detectAIUsage(writingData.content, writingData.topic);

    // AI 사용 의심도는 참고사항으로만 기록 (차단하지 않음)
    console.log(`AI 사용 의심도: ${aiUsageResult.aiProbability}% (참고사항)`);
    if (aiUsageResult.aiProbability > 50) {
      console.log('AI 사용 의심 높음, 하지만 제출은 허용됨 (참고사항으로만 기록)');
    }

    // 4. AI 분석 (글자 수 포함)
    const analysisResult = await analyzeWriting(
      writingData.content,
      writingData.gradeLevel,
      writingData.topic,
      wordCount,
      standard.ideal
    );

    // 5. 제출 (기준 점수 체크 제거 - 모든 점수 허용)
    const now = new Date().toISOString();
    const writingId = writingData.writingId || `${studentId}_${Date.now()}`;
    const submissionData = {
      ...writingData,
      writingId,
      studentId,
      isDraft: false,
      isRewrite, // 고쳐쓰기 여부 저장
      createdAt: writingData.createdAt || now,
      submittedAt: now,
      analysis: analysisResult,
      plagiarismCheck: plagiarismResult,
      aiUsageCheck: aiUsageResult,
      score: analysisResult.score
    };

    console.log('저장할 데이터:', submissionData);
    await setDoc(doc(db, 'writings', writingId), submissionData);
    console.log('Firestore 저장 완료:', writingId);

    // 6. 학생 통계 업데이트
    await updateStudentStats(studentId, analysisResult.score);

    // 7. 포인트 지급 (고쳐쓰기 여부 전달)
    const earnedPoints = await awardPoints(studentId, analysisResult.score, isRewrite);
    submissionData.earnedPoints = earnedPoints; // 지급된 포인트 정보 추가

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
      console.error('학급을 찾을 수 없음:', classCode);
      throw new Error('존재하지 않는 학급입니다.');
    }

    const classData = classDoc.data();
    const students = classData.students || [];

    if (students.length === 0) {
      return [];
    }

    const studentIds = students.map(s => s.studentId);

    // 🚀 병렬로 모든 학생의 데이터 가져오기 (속도 최적화)
    const studentPromises = studentIds.map(async (studentId) => {
      try {
        // 학생 정보와 글을 동시에 가져오기
        const [studentDoc, writings] = await Promise.all([
          getDoc(doc(db, 'users', studentId)),
          getStudentWritings(studentId)
        ]);

        const studentData = studentDoc.exists() ? studentDoc.data() : {};
        const nickname = studentData.nickname || studentData.name || '익명';

        return writings
          .filter(w => !w.isDraft)
          .map(w => ({
            ...w,
            nickname,
            displayName: nickname
          }));
      } catch (error) {
        console.error(`학생 ${studentId} 글 조회 에러:`, error);
        return [];
      }
    });

    // 모든 학생 데이터를 병렬로 기다림
    const results = await Promise.all(studentPromises);
    const allWritings = results.flat();

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

// 친구 글 읽기 - 같은 주제로 제출한 친구들의 글 조회
export async function getFriendWritings(classCode, topic, excludeStudentId) {
  try {
    const classDoc = await getDoc(doc(db, 'classes', classCode));
    if (!classDoc.exists()) {
      return [];
    }

    const classData = classDoc.data();
    const students = classData.students || [];
    const studentIds = students.map(s => s.studentId).filter(id => id !== excludeStudentId);

    if (studentIds.length === 0) return [];

    const friendWritings = [];

    for (const studentId of studentIds) {
      const writings = await getStudentWritings(studentId);
      const matchingWritings = writings.filter(w =>
        !w.isDraft &&
        w.topic === topic &&
        w.score >= 80 // 80점 이상 통과한 글만 공개
      );

      if (matchingWritings.length > 0) {
        // 학생 정보 가져오기
        const studentDoc = await getDoc(doc(db, 'users', studentId));
        const studentData = studentDoc.exists() ? studentDoc.data() : {};
        const nickname = studentData.nickname || studentData.name || '익명';

        matchingWritings.forEach(w => {
          friendWritings.push({
            ...w,
            nickname,
            displayName: nickname
          });
        });
      }
    }

    return friendWritings.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('친구 글 조회 에러:', error);
    throw error;
  }
}

// 포인트 지급 함수
// isRewrite: 고쳐쓰기 모드인지 여부
export async function awardPoints(studentId, score, isRewrite = false) {
  try {
    // 50점 이하: 포인트 미지급 (의미없는 문장 방지)
    if (score <= 50) {
      console.log(`포인트 미지급: ${score}점 (50점 이하)`);
      return 0;
    }

    // 고쳐쓰기 모드에서 80점 미달: 포인트 미지급
    if (isRewrite && score < 80) {
      console.log(`포인트 미지급: 고쳐쓰기 ${score}점 (80점 미달)`);
      return 0;
    }

    const userRef = doc(db, 'users', studentId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) return 0;

    const userData = userDoc.data();
    const currentPoints = userData.points || 0;

    // 기본 포인트: 10P (50점 초과 시)
    let earnedPoints = 10;

    // 80점 이상: +20P 보너스
    if (score >= 80) {
      earnedPoints += 20;
    }

    // 90점 이상: +50P 추가 보너스 (총 80P)
    if (score >= 90) {
      earnedPoints += 30; // 이미 +20 받았으므로 +30 추가
    }

    // 연속 제출 보너스 체크
    const lastSubmitDate = userData.lastSubmitDate;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let streakDays = userData.streakDays || 0;
    if (lastSubmitDate === yesterday) {
      streakDays += 1;
      earnedPoints += 5; // 연속 제출 보너스
    } else if (lastSubmitDate !== today) {
      streakDays = 1;
    }

    const newPoints = currentPoints + earnedPoints;

    await updateDoc(userRef, {
      points: newPoints,
      lastSubmitDate: today,
      streakDays: streakDays
    });

    console.log(`포인트 지급: ${earnedPoints}P (총 ${newPoints}P)`);
    return earnedPoints;
  } catch (error) {
    console.error('포인트 지급 에러:', error);
    // 포인트 지급 실패해도 글 제출은 성공으로 처리
    return 0;
  }
}

// 학급 랭킹 조회 (주간/월간)
export async function getClassRanking(classCode, period = 'weekly') {
  try {
    const classDoc = await getDoc(doc(db, 'classes', classCode));
    if (!classDoc.exists()) {
      throw new Error('학급을 찾을 수 없습니다.');
    }

    const classData = classDoc.data();
    const students = classData.students || [];

    if (students.length === 0) {
      return [];
    }

    // 기간 계산
    const now = new Date();
    let startDate;
    if (period === 'weekly') {
      // 이번 주 월요일
      const dayOfWeek = now.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startDate = new Date(now);
      startDate.setDate(now.getDate() - diff);
      startDate.setHours(0, 0, 0, 0);
    } else {
      // 이번 달 1일
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const studentIds = students.map(s => s.studentId);

    // 🚀 병렬로 모든 학생 데이터 가져오기
    const rankingPromises = studentIds.map(async (studentId) => {
      try {
        const [userDoc, writings] = await Promise.all([
          getDoc(doc(db, 'users', studentId)),
          getStudentWritings(studentId)
        ]);

        const userData = userDoc.exists() ? userDoc.data() : {};
        const nickname = userData.nickname || userData.name || '익명';

        // 기간 내 제출된 글만 필터링
        const periodWritings = writings.filter(w => {
          if (w.isDraft) return false;
          const submittedAt = new Date(w.submittedAt);
          return submittedAt >= startDate;
        });

        // 통계 계산
        const submissionCount = periodWritings.length;
        const totalScore = periodWritings.reduce((sum, w) => sum + (w.score || 0), 0);
        const averageScore = submissionCount > 0 ? Math.round(totalScore / submissionCount) : 0;
        const passCount = periodWritings.filter(w => w.score >= 80).length;
        const highScore = Math.max(...periodWritings.map(w => w.score || 0), 0);

        // 랭킹 점수 계산 (제출 수 * 10 + 평균 점수 + 통과 수 * 5)
        const rankingScore = submissionCount * 10 + averageScore + passCount * 5;

        return {
          studentId,
          nickname,
          points: userData.points || 0,
          submissionCount,
          averageScore,
          passCount,
          highScore,
          rankingScore,
          streakDays: userData.streakDays || 0
        };
      } catch (error) {
        console.error(`학생 ${studentId} 랭킹 데이터 조회 에러:`, error);
        return null;
      }
    });

    const results = await Promise.all(rankingPromises);
    const validResults = results.filter(r => r !== null);

    // 랭킹 점수로 정렬
    validResults.sort((a, b) => b.rankingScore - a.rankingScore);

    // 순위 부여
    return validResults.map((student, index) => ({
      ...student,
      rank: index + 1
    }));
  } catch (error) {
    console.error('학급 랭킹 조회 에러:', error);
    throw error;
  }
}

// 학생 성장 데이터 조회 (그래프용)
export async function getStudentGrowthData(studentId) {
  try {
    const writings = await getStudentWritings(studentId);
    const submittedWritings = writings
      .filter(w => !w.isDraft && w.submittedAt)
      .sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));

    // 일별 데이터 그룹화
    const dailyData = {};
    submittedWritings.forEach(w => {
      const date = w.submittedAt.split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          submissions: 0,
          totalScore: 0,
          scores: []
        };
      }
      dailyData[date].submissions += 1;
      dailyData[date].totalScore += w.score || 0;
      dailyData[date].scores.push(w.score || 0);
    });

    // 배열로 변환하고 평균 점수 계산
    const growthData = Object.values(dailyData).map(day => ({
      date: day.date,
      displayDate: new Date(day.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
      submissions: day.submissions,
      averageScore: Math.round(day.totalScore / day.submissions),
      highScore: Math.max(...day.scores)
    }));

    // 최근 30일 데이터만 반환
    return growthData.slice(-30);
  } catch (error) {
    console.error('학생 성장 데이터 조회 에러:', error);
    throw error;
  }
}
