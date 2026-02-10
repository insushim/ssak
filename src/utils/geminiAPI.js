import { getFunctions, httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

export async function analyzeWriting(text, gradeLevel, topic, wordCount, idealWordCount, isRewrite = false, previousScore = null, previousText = null) {
  try {
    const analyzeWritingFn = httpsCallable(functions, 'analyzeWriting');
    const result = await analyzeWritingFn({
      text,
      gradeLevel,
      topic,
      wordCount,
      idealWordCount,
      isRewrite,
      previousScore,
      previousText
    });
    return result.data;
  } catch (error) {
    console.error('Gemini API 에러:', error);
    throw error;
  }
}

export async function getWritingHelp(text, topic, helpType = 'hint') {
  try {
    const getWritingHelpFn = httpsCallable(functions, 'getWritingHelp');
    const result = await getWritingHelpFn({
      text,
      topic,
      helpType
    });
    return result.data;
  } catch (error) {
    console.error('AI 도움 요청 에러:', error);
    throw error;
  }
}

export async function generateTopics(gradeLevel, count = 5, category = null) {
  try {
    const generateTopicsFn = httpsCallable(functions, 'generateTopics');
    const result = await generateTopicsFn({
      gradeLevel,
      count,
      category
    });
    return result.data;
  } catch (error) {
    console.error('AI 주제 생성 에러:', error);
    throw error;
  }
}

export async function getQuickAdvice(text, topic, gradeLevel, adviceType = 'encourage') {
  try {
    const getQuickAdviceFn = httpsCallable(functions, 'getQuickAdvice');
    const result = await getQuickAdviceFn({
      text,
      topic,
      gradeLevel,
      adviceType
    });
    return result.data;
  } catch (error) {
    console.error('실시간 조언 에러:', error);
    throw error;
  }
}

// 싹DB 상태 확인 (디버깅용)
export async function checkSsakDBStatus() {
  try {
    const checkSsakDBStatusFn = httpsCallable(functions, 'checkSsakDBStatus');
    const result = await checkSsakDBStatusFn();
    return result.data;
  } catch (error) {
    console.error('싹DB 상태 확인 에러:', error);
    throw error;
  }
}
