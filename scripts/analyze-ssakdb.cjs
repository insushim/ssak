/**
 * 싹DB 학년별 데이터 현황 분석 스크립트
 */

const fs = require('fs');
const path = require('path');

const SSAK_DB_PATH = 'c:/isw싹DB/ssak-writing-vault';

// 학년 그룹 정의
const GRADE_GROUPS = [
  { name: '초등 1-2학년', patterns: ['초등학교/1-2학년', '초1', '초2', '초등_1학년', '초등_2학년', '1-2학년'] },
  { name: '초등 3-4학년', patterns: ['초등학교/3-4학년', '초3', '초4', '초등_3학년', '초등_4학년', '3-4학년'] },
  { name: '초등 5-6학년', patterns: ['초등학교/5-6학년', '초5', '초6', '초등_5학년', '초등_6학년', '5-6학년'] },
  { name: '중학교 1학년', patterns: ['중학교/1학년', '중1', '중등_1학년'] },
  { name: '중학교 2학년', patterns: ['중학교/2학년', '중2', '중등_2학년'] },
  { name: '중학교 3학년', patterns: ['중학교/3학년', '중3', '중등_3학년'] },
  { name: '고등학교 1학년', patterns: ['고등학교/1학년', '고1', '고등_1학년'] },
  { name: '고등학교 2학년', patterns: ['고등학교/2학년', '고2', '고등_2학년'] },
  { name: '고등학교 3학년', patterns: ['고등학교/3학년', '고3', '고등_3학년'] },
];

// 글쓰기 장르 정의
const GENRES = ['일기', '편지', '생활문', '설명문', '논설문', '보고서', '독후감', '독서감상문', '수필', '기행문'];

// 평가 영역 정의
const DOMAINS = ['종합', '내용', '조직', '표현', '표기'];

// 예시 수준 정의
const LEVELS = ['상', '중', '하', 'high', 'mid', 'low'];

// 모든 마크다운 파일 찾기
function findAllMarkdownFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findAllMarkdownFiles(fullPath, files);
    } else if (item.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

// YAML 프론트매터 파싱
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { metadata: {}, body: content };

  const metadata = {};
  match[1].split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      let value = line.slice(colonIdx + 1).trim().replace(/"/g, '');
      metadata[key] = value;
    }
  });
  return { metadata, body: match[2] };
}

// 메인 분석
async function analyze() {
  console.log('🌱 싹DB 학년별 데이터 현황 분석\n');
  console.log('='.repeat(70));

  // 1. 루브릭 분석
  console.log('\n📚 [1] 평가 루브릭 분석');
  const rubricsPath = path.join(SSAK_DB_PATH, '01_평가루브릭');
  const rubricFiles = findAllMarkdownFiles(rubricsPath);
  console.log(`   총 루브릭 파일: ${rubricFiles.length}개\n`);

  // 학년별 루브릭 현황
  const rubricsByGrade = {};
  GRADE_GROUPS.forEach(g => { rubricsByGrade[g.name] = { total: 0, genres: {}, domains: {} }; });
  rubricsByGrade['기타'] = { total: 0, genres: {}, domains: {} };

  for (const file of rubricFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const { metadata } = parseFrontmatter(content);
    const filePath = file.replace(/\\/g, '/');

    // 학년 그룹 매칭
    let matched = false;
    for (const grade of GRADE_GROUPS) {
      if (grade.patterns.some(p => filePath.includes(p) || metadata.grade?.includes(p.split('/').pop()))) {
        rubricsByGrade[grade.name].total++;
        const genre = metadata.genre || '미분류';
        const domain = metadata.domain || '종합';
        rubricsByGrade[grade.name].genres[genre] = (rubricsByGrade[grade.name].genres[genre] || 0) + 1;
        rubricsByGrade[grade.name].domains[domain] = (rubricsByGrade[grade.name].domains[domain] || 0) + 1;
        matched = true;
        break;
      }
    }
    if (!matched) {
      rubricsByGrade['기타'].total++;
    }
  }

  console.log('   학년별 루브릭 현황:');
  for (const [grade, data] of Object.entries(rubricsByGrade)) {
    if (data.total > 0) {
      const genreList = Object.keys(data.genres).slice(0, 3).join(', ');
      console.log(`   - ${grade.padEnd(15)}: ${String(data.total).padStart(3)}개 (장르: ${genreList})`);
    }
  }

  // 학년별 루브릭 부족 여부 체크
  console.log('\n   ⚠️  루브릭 부족 학년:');
  const missingRubricGrades = [];
  for (const grade of GRADE_GROUPS) {
    const data = rubricsByGrade[grade.name];
    if (data.total < 5) {
      missingRubricGrades.push(grade.name);
      console.log(`      ❌ ${grade.name}: ${data.total}개 (최소 5개 필요)`);
    }
  }
  if (missingRubricGrades.length === 0) {
    console.log('      ✅ 모든 학년에 충분한 루브릭 존재');
  }

  // 2. 우수작 예시 분석
  console.log('\n📝 [2] 우수작 예시 분석');
  const examplesPath = path.join(SSAK_DB_PATH, '02_우수작예시');
  const exampleFiles = findAllMarkdownFiles(examplesPath);
  console.log(`   총 우수작 예시 파일: ${exampleFiles.length}개\n`);

  // 학년별 예시 현황
  const examplesByGrade = {};
  GRADE_GROUPS.forEach(g => { examplesByGrade[g.name] = { total: 0, genres: {}, levels: {} }; });
  examplesByGrade['기타'] = { total: 0, genres: {}, levels: {} };

  for (const file of exampleFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const { metadata } = parseFrontmatter(content);
    const filePath = file.replace(/\\/g, '/');

    let matched = false;
    for (const grade of GRADE_GROUPS) {
      // 초등/중/고 패턴도 매칭
      const eduLevel = metadata.education_level || '';
      const gradeMatch = eduLevel.includes('초등') || eduLevel.includes('초') ?
        (filePath.includes('초등') || filePath.includes('elementary')) :
        eduLevel.includes('중') ? (filePath.includes('중학') || filePath.includes('middle')) :
        eduLevel.includes('고') ? (filePath.includes('고등') || filePath.includes('high')) : false;

      if (grade.patterns.some(p => filePath.includes(p)) ||
          (gradeMatch && grade.patterns.some(p => p.includes(eduLevel)))) {
        examplesByGrade[grade.name].total++;
        const genre = metadata.genre || '미분류';
        const level = metadata.level || '미분류';
        examplesByGrade[grade.name].genres[genre] = (examplesByGrade[grade.name].genres[genre] || 0) + 1;
        examplesByGrade[grade.name].levels[level] = (examplesByGrade[grade.name].levels[level] || 0) + 1;
        matched = true;
        break;
      }
    }
    if (!matched) {
      examplesByGrade['기타'].total++;
      // 디버깅: 매칭 안된 파일의 메타데이터 확인
      // console.log(`      [DEBUG] 미매칭: ${metadata.education_level} | ${path.basename(file)}`);
    }
  }

  console.log('   학년별 우수작 예시 현황:');
  for (const [grade, data] of Object.entries(examplesByGrade)) {
    if (data.total > 0 || !grade.includes('기타')) {
      const genreList = Object.keys(data.genres).slice(0, 3).join(', ');
      const levelList = Object.entries(data.levels).map(([k,v]) => `${k}:${v}`).join(', ');
      console.log(`   - ${grade.padEnd(15)}: ${String(data.total).padStart(3)}개 (${levelList || '수준 정보 없음'})`);
    }
  }

  // 기타 (학년 미분류) 상세 분석
  if (examplesByGrade['기타'].total > 0) {
    console.log(`\n   📋 '기타'로 분류된 예시 (${examplesByGrade['기타'].total}개):`);
    console.log('      → education_level이 "초등", "중", "고" 등으로 되어있어 학년 구분 불가');
    console.log('      → 이들은 해당 학령대 전체에서 공용으로 사용됨');
  }

  // 학년별 예시 부족 여부 체크
  console.log('\n   ⚠️  예시 부족 학년:');
  const missingExampleGrades = [];
  for (const grade of GRADE_GROUPS) {
    const data = examplesByGrade[grade.name];
    if (data.total < 3) {
      missingExampleGrades.push(grade.name);
      console.log(`      ❌ ${grade.name}: ${data.total}개 (최소 3개 필요)`);
    }
  }
  if (missingExampleGrades.length === 0) {
    console.log('      ✅ 모든 학년에 우수작 예시 존재 (일부는 학령대 공용 사용)');
  }

  // 3. 장르별 커버리지
  console.log('\n📊 [3] 장르별 커버리지');
  console.log('   필수 장르: 일기, 편지, 생활문, 설명문, 논설문, 보고서, 독후감, 수필');

  // 모든 파일에서 장르 추출
  const allGenres = new Set();
  [...rubricFiles, ...exampleFiles].forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const { metadata } = parseFrontmatter(content);
    if (metadata.genre) allGenres.add(metadata.genre);
  });
  console.log(`\n   발견된 장르 (${allGenres.size}개): ${[...allGenres].sort().join(', ')}`);

  // 4. 첨삭 패턴 분석
  console.log('\n📝 [4] 첨삭 패턴 분석');
  const patternsPath = path.join(SSAK_DB_PATH, '03_첨삭패턴');
  const patternFiles = findAllMarkdownFiles(patternsPath);
  console.log(`   총 첨삭 패턴 파일: ${patternFiles.length}개`);

  // 영역별 분류
  const patternsByDomain = {};
  for (const file of patternFiles) {
    const filePath = file.replace(/\\/g, '/');
    for (const domain of ['내용', '조직', '표현', '표기']) {
      if (filePath.includes(domain)) {
        patternsByDomain[domain] = (patternsByDomain[domain] || 0) + 1;
        break;
      }
    }
  }
  for (const [domain, count] of Object.entries(patternsByDomain)) {
    console.log(`   - ${domain}: ${count}개`);
  }

  // 5. 요약
  console.log('\n' + '='.repeat(70));
  console.log('📋 [요약]');
  console.log(`   - 평가 루브릭: ${rubricFiles.length}개`);
  console.log(`   - 우수작 예시: ${exampleFiles.length}개`);
  console.log(`   - 첨삭 패턴: ${patternFiles.length}개`);
  console.log(`   - 루브릭 부족 학년: ${missingRubricGrades.length > 0 ? missingRubricGrades.join(', ') : '없음'}`);
  console.log(`   - 예시 부족 학년: ${missingExampleGrades.length > 0 ? missingExampleGrades.join(', ') : '없음 (학령대 공용 활용)'}`);

  console.log('\n✅ 분석 완료');
}

analyze().catch(err => {
  console.error('❌ 오류:', err);
  process.exit(1);
});
