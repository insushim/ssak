/**
 * 싹DB Firestore 업로드 스크립트 (Firebase REST API)
 * Firebase Web SDK를 사용하여 업로드
 */

const fs = require('fs');
const path = require('path');

// Firebase config (프로젝트의 firebaseConfig 사용)
const firebaseConfig = {
  apiKey: "AIzaSyAHJyMFKMAPQvObVTYwHZ8bh5_w3c0c3TU",
  authDomain: "isw-writing.firebaseapp.com",
  projectId: "isw-writing",
  storageBucket: "isw-writing.firebasestorage.app",
  messagingSenderId: "427033729236",
  appId: "1:427033729236:web:b85a9eb4e0c9e77bfe439d"
};

// 싹DB 경로
const SSAK_DB_PATH = 'c:/isw싹DB/ssak-writing-vault';

// YAML 프론트매터 파싱
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { metadata: {}, body: content };

  const yamlStr = match[1];
  const body = match[2];
  const metadata = {};

  yamlStr.split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      let value = line.slice(colonIdx + 1).trim();
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(v => v.trim().replace(/"/g, ''));
      } else {
        value = value.replace(/"/g, '');
      }
      metadata[key] = value;
    }
  });

  return { metadata, body };
}

// 컬렉션 이름 매핑
function getCollectionName(filePath) {
  if (filePath.includes('01_평가루브릭')) return 'rubrics';
  if (filePath.includes('02_우수작예시')) return 'examples';
  if (filePath.includes('03_첨삭패턴')) return 'feedbackPatterns';
  if (filePath.includes('04_글쓰기이론')) return 'writingTheory';
  if (filePath.includes('05_AI판별')) return 'aiDetection';
  if (filePath.includes('06_주제뱅크')) return 'topics';
  if (filePath.includes('07_학습경로')) return 'learningPaths';
  if (filePath.includes('08_평가도구')) return 'evaluationTools';
  if (filePath.includes('00_시스템')) return 'system';
  if (filePath.includes('99_메타데이터')) return 'metadata';
  return 'misc';
}

// 문서 ID 생성
function generateDocId(filePath, metadata) {
  const fileName = path.basename(filePath, '.md');
  const parts = [];

  if (metadata.education_level) {
    const levelMap = {
      '초등학교': 'elem', '중학교': 'middle', '고등학교': 'high',
      '초등': 'elem', '중': 'middle', '고': 'high'
    };
    parts.push(levelMap[metadata.education_level] || metadata.education_level);
  }

  if (metadata.grade) {
    parts.push(metadata.grade.replace(/학년/g, '').replace(/-/g, '_'));
  }

  if (metadata.genre) {
    parts.push(metadata.genre);
  }

  if (metadata.domain) {
    parts.push(metadata.domain);
  }

  if (metadata.level) {
    parts.push(metadata.level);
  }

  if (parts.length > 0) {
    return parts.join('_');
  }

  return fileName.replace(/[^a-zA-Z0-9가-힣_-]/g, '_');
}

// 마크다운 파일 찾기
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

// Firestore REST API로 문서 생성/업데이트
async function uploadToFirestore(collection, docId, data) {
  const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${collection}/${docId}`;

  // Firestore REST API 형식으로 변환
  const fields = {};
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      fields[key] = {
        arrayValue: {
          values: value.map(v => ({ stringValue: String(v) }))
        }
      };
    } else if (typeof value === 'number') {
      fields[key] = { integerValue: String(value) };
    } else if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value };
    } else {
      fields[key] = { stringValue: String(value || '') };
    }
  }

  // 타임스탬프 추가
  const now = new Date().toISOString();
  fields.createdAt = { timestampValue: now };
  fields.updatedAt = { timestampValue: now };

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Firestore 오류: ${response.status} - ${error}`);
  }

  return response.json();
}

// JSON 파일로 내보내기 (Firestore import 용)
function exportToJson(documents) {
  const output = {};

  for (const doc of documents) {
    if (!output[doc.collection]) {
      output[doc.collection] = {};
    }
    output[doc.collection][doc.id] = doc.data;
  }

  return output;
}

// 메인
async function main() {
  console.log('🌱 싹DB 데이터 준비 시작...\n');

  console.log('📂 마크다운 파일 검색 중...');
  const files = findAllMarkdownFiles(SSAK_DB_PATH);
  console.log(`  발견된 파일: ${files.length}개\n`);

  console.log('📄 파일 파싱 중...');
  const documents = [];
  const collectionCounts = {};

  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const { metadata, body } = parseFrontmatter(content);

      const collectionName = getCollectionName(filePath);
      const docId = generateDocId(filePath, metadata);

      // 중복 ID 방지
      let finalId = docId;
      let counter = 1;
      while (documents.some(d => d.collection === collectionName && d.id === finalId)) {
        finalId = `${docId}_${counter}`;
        counter++;
      }

      documents.push({
        collection: collectionName,
        id: finalId,
        data: {
          ...metadata,
          content: body,
          filePath: filePath.replace(SSAK_DB_PATH, '').replace(/\\/g, '/')
        }
      });

      collectionCounts[collectionName] = (collectionCounts[collectionName] || 0) + 1;
    } catch (error) {
      console.error(`  오류: ${filePath} - ${error.message}`);
    }
  }

  console.log('  파싱 완료!\n');
  console.log('📊 컬렉션별 문서 수:');
  Object.entries(collectionCounts).sort((a, b) => b[1] - a[1]).forEach(([col, count]) => {
    console.log(`  - ${col}: ${count}개`);
  });
  console.log();

  // JSON 파일로 내보내기
  console.log('📝 JSON 파일로 내보내기...');
  const jsonData = exportToJson(documents);

  const outputPath = path.join(__dirname, 'ssakdb-export.json');
  fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2), 'utf8');
  console.log(`  저장됨: ${outputPath}`);

  // 컬렉션별 파일도 생성
  const collectionsDir = path.join(__dirname, 'ssakdb-collections');
  if (!fs.existsSync(collectionsDir)) {
    fs.mkdirSync(collectionsDir, { recursive: true });
  }

  for (const [collection, docs] of Object.entries(jsonData)) {
    const collectionPath = path.join(collectionsDir, `${collection}.json`);
    fs.writeFileSync(collectionPath, JSON.stringify(docs, null, 2), 'utf8');
    console.log(`  - ${collection}.json (${Object.keys(docs).length}개 문서)`);
  }

  // 메타 정보 생성
  const metaPath = path.join(collectionsDir, '_meta.json');
  fs.writeFileSync(metaPath, JSON.stringify({
    totalDocuments: documents.length,
    collections: collectionCounts,
    exportedAt: new Date().toISOString(),
    version: '2.0.0'
  }, null, 2), 'utf8');
  console.log(`  - _meta.json`);

  console.log(`\n✅ 총 ${documents.length}개 문서 내보내기 완료!`);
  console.log('\n📌 다음 단계:');
  console.log('   1. 슈퍼 관리자 대시보드에서 "싹DB 업로드" 버튼 클릭');
  console.log('   2. 또는 Firebase 콘솔에서 직접 가져오기');
  console.log('\n🎉 작업 완료!');
}

main().catch(error => {
  console.error('❌ 오류 발생:', error);
  process.exit(1);
});
