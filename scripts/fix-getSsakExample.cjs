const fs = require('fs');

const path = 'functions/index.js';
let content = fs.readFileSync(path, 'utf8');

// 라인 단위로 분리
const lines = content.split('\n');

// 138라인(1-indexed)에서 시작, 174라인에서 끝
// 0-indexed: 137 ~ 173
const startLine = 137;
const endLine = 173;

console.log('Start line (138):', lines[startLine].substring(0, 60));
console.log('End line (174):', lines[endLine]);

// 새 함수 내용
const newFunctionLines = [
  "async function getSsakExample(gradeLevel, topic, level = 'high') {",
  "  const genre = getGenreFromTopic(topic, gradeLevel);",
  "",
  "  // 우수작 예시 파일은 루브릭과 다른 education_level 값 사용",
  '  // 루브릭: "초등학교", "중학교", "고등학교"',
  '  // 예시: "초등", "중", "고"',
  "  const exampleEducationLevelMap = {",
  "    'elementary_1_2': '초등',",
  "    'elementary_3_4': '초등',",
  "    'elementary_5_6': '초등',",
  "    'middle': '중',",
  "    'high': '고'",
  "  };",
  "  const exampleEducationLevel = exampleEducationLevelMap[gradeLevel] || '초등';",
  "",
  "  // level 매핑 (영어 → 한글) - 싹DB에 한글로 저장되어 있음",
  "  const levelMap = { 'high': '상', 'mid': '중', 'low': '하' };",
  "  const koreanLevel = levelMap[level] || level;",
  "",
  "  const cacheKey = \`example_\${exampleEducationLevel}_\${genre}_\${koreanLevel}\`;",
  "",
  "  // 캐시 확인",
  "  const cached = ssakDBCache.examples.get(cacheKey);",
  "  if (cached && (Date.now() - cached.timestamp) < SSAK_CACHE_TTL) {",
  "    return cached.data;",
  "  }",
  "",
  "  try {",
  "    // 1차: education_level, genre, level로 검색",
  "    let snapshot = await db.collection('examples')",
  "      .where('education_level', '==', exampleEducationLevel)",
  "      .where('genre', '==', genre)",
  "      .where('level', '==', koreanLevel)",
  "      .limit(1)",
  "      .get();",
  "",
  "    // 2차: genre만으로 검색 (예시가 없으면 같은 장르의 다른 학년 예시 사용)",
  "    if (snapshot.empty) {",
  "      console.log(\`[싹DB] 정확한 예시 없음, 장르로 재검색: \${genre} \${koreanLevel}\`);",
  "      snapshot = await db.collection('examples')",
  "        .where('genre', '==', genre)",
  "        .where('level', '==', koreanLevel)",
  "        .limit(1)",
  "        .get();",
  "    }",
  "",
  "    if (!snapshot.empty) {",
  "      const example = snapshot.docs[0].data();",
  "      ssakDBCache.examples.set(cacheKey, { data: example, timestamp: Date.now() });",
  "      console.log(\`[싹DB] 예시 로드: \${exampleEducationLevel} \${genre} (\${koreanLevel})\`);",
  "      return example;",
  "    }",
  "",
  "    console.log(\`[싹DB] 예시 없음: \${exampleEducationLevel} \${genre} \${koreanLevel}\`);",
  "    return null;",
  "  } catch (error) {",
  "    console.error('[싹DB] 예시 검색 오류:', error);",
  "    return null;",
  "  }",
  "}"
];

// 앞부분 (0 ~ 136) + 새 함수 + 뒷부분 (174 ~)
const newLines = [
  ...lines.slice(0, startLine),
  ...newFunctionLines,
  ...lines.slice(endLine + 1)
];

const newContent = newLines.join('\n');
fs.writeFileSync(path, newContent, 'utf8');
console.log('SUCCESS: Function updated');
console.log('Total lines - before:', lines.length, 'after:', newLines.length);
