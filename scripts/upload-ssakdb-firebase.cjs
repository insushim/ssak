/**
 * 싹DB Firestore 업로드 스크립트 (Firebase Admin SDK - ADC 인증)
 *
 * 실행 전:
 * 1. Firebase 콘솔 > 프로젝트 설정 > 서비스 계정 > 새 비공개 키 생성
 * 2. 다운로드한 파일을 scripts/serviceAccountKey.json으로 저장
 *
 * 또는 gcloud auth application-default login 실행 후 사용
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Firebase Admin 초기화
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'isw-writing'
  });
  console.log('🔑 서비스 계정 키로 인증됨\n');
} else {
  // Firebase CLI 인증 토큰 사용 시도
  admin.initializeApp({
    projectId: 'isw-writing'
  });
  console.log('🔑 기본 인증 (firebase login 기반)\n');
}

const db = admin.firestore();

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

// 배치 업로드
async function batchUpload(documents) {
  const BATCH_SIZE = 450;
  let uploadedCount = 0;

  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = documents.slice(i, i + BATCH_SIZE);

    for (const docData of chunk) {
      const ref = db.collection(docData.collection).doc(docData.id);
      batch.set(ref, docData.data);
    }

    await batch.commit();
    uploadedCount += chunk.length;
    console.log(`  업로드: ${uploadedCount}/${documents.length}`);
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
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
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

  console.log(`\n✅ 업로드 완료! 총 ${uploaded}개 문서`);

  // 메타 문서 생성
  console.log('\n📑 인덱스 문서 생성 중...');
  await db.collection('ssakdb_meta').doc('stats').set({
    totalDocuments: uploaded,
    collections: collectionCounts,
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    version: '2.0.0'
  });
  console.log('  인덱스 생성 완료!');

  console.log('\n🎉 모든 작업 완료!');
  process.exit(0);
}

main().catch(error => {
  console.error('❌ 오류 발생:', error);
  process.exit(1);
});
