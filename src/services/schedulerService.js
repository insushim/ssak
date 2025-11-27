import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { generateTopics } from '../utils/geminiAPI';
import { createAssignment, getAssignmentsByClass } from './assignmentService';

// 스케줄러 설정 저장
export async function saveSchedulerSettings(classCode, settings) {
  try {
    const schedulerRef = doc(db, 'schedulers', classCode);
    await setDoc(schedulerRef, {
      classCode,
      ...settings,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('스케줄러 설정 저장 에러:', error);
    throw error;
  }
}

// 스케줄러 설정 불러오기
export async function getSchedulerSettings(classCode) {
  try {
    const schedulerDoc = await getDoc(doc(db, 'schedulers', classCode));
    if (schedulerDoc.exists()) {
      return schedulerDoc.data();
    }
    return null;
  } catch (error) {
    console.error('스케줄러 설정 로드 에러:', error);
    throw error;
  }
}

// 스케줄러 비활성화
export async function disableScheduler(classCode) {
  try {
    const schedulerRef = doc(db, 'schedulers', classCode);
    await updateDoc(schedulerRef, {
      enabled: false,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('스케줄러 비활성화 에러:', error);
    throw error;
  }
}

// 이전에 출제된 과제 제목들 가져오기
export async function getPreviousAssignmentTitles(classCode) {
  try {
    const assignments = await getAssignmentsByClass(classCode);
    return assignments.map(a => a.title);
  } catch (error) {
    console.error('이전 과제 조회 에러:', error);
    return [];
  }
}

// 자동 과제 생성 (Cloud Functions에서 호출되거나 클라이언트에서 수동 실행)
export async function generateAutoAssignment(classCode, gradeLevel, teacherId, settings) {
  try {
    // 이전 과제 제목들 가져오기
    const previousTitles = await getPreviousAssignmentTitles(classCode);

    // 글쓰기 유형 목록
    const writingTypes = ['주장하는 글', '설명하는 글', '묘사하는 글', '서사/이야기', '편지', '일기', '감상문', '상상글'];

    // 분야 목록
    const categories = ['가족', '학교', '친구', '환경', '동물', '꿈/미래', '여행', '취미', '계절/날씨', '음식', '과학', '스포츠', '문화', '사회'];

    // 랜덤 선택
    const randomType = writingTypes[Math.floor(Math.random() * writingTypes.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const combinedCategory = `${randomType} - ${randomCategory}`;

    // AI로 주제 생성
    const result = await generateTopics(gradeLevel, 5, combinedCategory);
    const topics = result.topics || [];

    if (topics.length === 0) {
      throw new Error('주제 생성 실패');
    }

    // 이전에 출제되지 않은 주제 찾기
    let selectedTopic = null;
    for (const topic of topics) {
      const isSimilar = previousTitles.some(title =>
        title.toLowerCase().includes(topic.title.toLowerCase()) ||
        topic.title.toLowerCase().includes(title.toLowerCase()) ||
        calculateSimilarity(title, topic.title) > 0.6
      );

      if (!isSimilar) {
        selectedTopic = topic;
        break;
      }
    }

    // 모든 주제가 비슷하면 첫 번째 사용
    if (!selectedTopic) {
      selectedTopic = topics[0];
    }

    // 과제 생성
    const assignment = await createAssignment(
      teacherId,
      classCode,
      selectedTopic.title,
      `[자동 출제] ${selectedTopic.description || ''}\n유형: ${randomType} | 분야: ${randomCategory}`,
      null, // 마감일 없음
      settings.minScore || 70,
      settings.maxAiProbability || 50
    );

    // 자동 출제 로그 저장
    await addDoc(collection(db, 'autoAssignmentLogs'), {
      classCode,
      assignmentId: assignment.id,
      title: selectedTopic.title,
      writingType: randomType,
      category: randomCategory,
      createdAt: new Date().toISOString()
    });

    return assignment;
  } catch (error) {
    console.error('자동 과제 생성 에러:', error);
    throw error;
  }
}

// 문자열 유사도 계산 (간단한 버전)
function calculateSimilarity(str1, str2) {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  let matches = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) matches++;
  }

  return matches / longer.length;
}

// 오늘 자동 과제가 이미 출제되었는지 확인
export async function hasAutoAssignmentToday(classCode) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const q = query(
      collection(db, 'autoAssignmentLogs'),
      where('classCode', '==', classCode)
    );
    const snapshot = await getDocs(q);

    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.createdAt && data.createdAt.startsWith(today)) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('오늘 자동 과제 확인 에러:', error);
    return false;
  }
}

// 스케줄 실행 (클라이언트에서 호출 - 페이지 로드시 체크)
export async function checkAndRunScheduler(classCode, gradeLevel, teacherId) {
  try {
    const settings = await getSchedulerSettings(classCode);

    if (!settings || !settings.enabled) {
      return { executed: false, reason: '스케줄러 비활성화' };
    }

    const now = new Date();
    const currentDay = now.getDay(); // 0 = 일요일
    const currentHour = now.getHours();

    // 요일 확인 (selectedDays: [1, 2, 3, 4, 5] = 월~금)
    if (!settings.selectedDays.includes(currentDay)) {
      return { executed: false, reason: '오늘은 출제 요일이 아님' };
    }

    // 시간 확인 (설정된 시간 이후면 실행)
    const scheduledHour = parseInt(settings.scheduledTime?.split(':')[0] || '9');
    if (currentHour < scheduledHour) {
      return { executed: false, reason: `출제 시간(${scheduledHour}시) 이전입니다. 현재: ${currentHour}시` };
    }

    // 이미 오늘 출제되었는지 확인
    const alreadyAssigned = await hasAutoAssignmentToday(classCode);
    if (alreadyAssigned) {
      return { executed: false, reason: '오늘 이미 자동 출제됨' };
    }

    // 과제 생성
    const assignment = await generateAutoAssignment(classCode, gradeLevel, teacherId, settings);

    return {
      executed: true,
      assignment,
      message: `"${assignment.title}" 과제가 자동 출제되었습니다!`
    };
  } catch (error) {
    console.error('스케줄러 실행 에러:', error);
    return { executed: false, reason: error.message };
  }
}
