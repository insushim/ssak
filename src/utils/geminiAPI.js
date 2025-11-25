const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export async function analyzeWriting(text, gradeLevel, topic) {
  try {
    const prompt = `
당신은 학생 글쓰기를 평가하는 전문 교사입니다.
아래 학생의 글을 분석하고, 건설적인 피드백을 제공해주세요.

학년: ${gradeLevel}
주제: ${topic}
글 내용:
${text}

다음 항목을 평가해주세요:
1. 내용의 충실성 (30점)
2. 구성의 논리성 (25점)
3. 어휘 사용의 적절성 (20점)
4. 문법과 맞춤법 (15점)
5. 창의성과 독창성 (10점)

JSON 형식으로 답변해주세요:
{
  "score": 총점(100점 만점),
  "contentScore": 내용 점수,
  "structureScore": 구성 점수,
  "vocabularyScore": 어휘 점수,
  "grammarScore": 문법 점수,
  "creativityScore": 창의성 점수,
  "strengths": ["장점1", "장점2"],
  "improvements": ["개선사항1", "개선사항2"],
  "overallFeedback": "전체적인 피드백"
}
`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Gemini API 요청 실패');
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;

    // JSON 부분만 추출
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('분석 결과 파싱 실패');
  } catch (error) {
    console.error('Gemini API 에러:', error);
    throw error;
  }
}

export async function detectPlagiarism(text, previousSubmissions) {
  try {
    const prompt = `
당신은 표절 감지 전문가입니다.
아래 학생의 글과 이전 제출물들을 비교하여 유사도를 분석해주세요.

현재 글:
${text}

이전 제출물들:
${previousSubmissions.map((sub, idx) => `
[제출물 ${idx + 1}]
${sub.content}
`).join('\n')}

JSON 형식으로 답변해주세요:
{
  "similarityPercentage": 유사도 퍼센트(0-100),
  "isPlagiarized": 표절 여부(true/false, 50% 이상이면 true),
  "matchedSections": ["유사한 부분1", "유사한 부분2"],
  "analysis": "상세 분석"
}
`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Gemini API 요청 실패');
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;

    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('표절 검사 결과 파싱 실패');
  } catch (error) {
    console.error('표절 검사 에러:', error);
    throw error;
  }
}
