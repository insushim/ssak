/**
 * 싹DB 마크다운 → Firestore 업로드 스크립트 (Client SDK 버전)
 *
 * 실행: node scripts/upload-ssakdb-client.cjs
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, writeBatch, serverTimestamp } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyA6qDbJR5taBJvrpFNFE8_eIL1v9e9joGM",
  authDomain: "isw-writing.firebaseapp.com",
  projectId: "isw-writing",
  storageBucket: "isw-writing.firebasestorage.app",
  messagingSenderId: "121740708708",
  appId: "1:121740708708:web:5d2477030a946bdbac0871"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 싹DB 경로
const SSAK_DB_PATH = 'c:/isw싹DB/ssak-writing-vault';

// YAML 프론트매터 파싱
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { metadata: {}, body: content };
  }

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

// 카테고리별 컬렉션 이름 매핑
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
      '초등학교': 'elem',
      '중학교': 'middle',
      '고등학교': 'high',
      '대학교': 'univ',
      '성인': 'adult'
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

  if (parts.length > 0) {
    return parts.join('_');
  }

  return fileName.replace(/[^a-zA-Z0-9가-힣_-]/g, '_');
}

// 마크다운 파일 찾기
function findAllMarkdownFiles(dir, files = []) {
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

// 배치 업로드 (500개씩)
async function batchUpload(documents) {
  const BATCH_SIZE = 450; // Firestore 배치 한도는 500
  let uploadedCount = 0;

  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = documents.slice(i, i + BATCH_SIZE);

    for (const docData of chunk) {
      const ref = doc(db, docData.collection, docData.id);
      batch.set(ref, docData.data);
    }

    await batch.commit();
    uploadedCount += chunk.length;
    console.log(`  업로드: ${uploadedCount}/${documents.length}`);

    // Rate limit 방지
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return uploadedCount;
}

// 메인
async function main() {
  console.log('🌱 싹DB → Firestore 업로드 시작...\n');

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
          filePath: filePath.replace(SSAK_DB_PATH, '').replace(/\\/g, '/'),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
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

  console.log('🚀 Firestore 업로드 시작...');
  const uploaded = await batchUpload(documents);

  console.log(`\n✅ 업로드 완료!`);
  console.log(`📊 총 ${uploaded}개 문서 업로드됨`);

  // 메타 문서 생성
  console.log('\n📑 인덱스 문서 생성 중...');
  await setDoc(doc(db, 'ssakdb_meta', 'stats'), {
    totalDocuments: uploaded,
    collections: collectionCounts,
    lastUpdated: new Date().toISOString(),
    version: '1.0.0'
  });
  console.log('  인덱스 생성 완료!');

  console.log('\n🎉 모든 작업 완료!');
  process.exit(0);
}

main().catch(error => {
  console.error('❌ 오류 발생:', error);
  process.exit(1);
});
