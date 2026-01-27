/**
 * Firestore 싹DB 데이터 확인 스크립트
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Firebase Admin 초기화
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('🔑 서비스 계정 키로 인증됨\n');
} else {
  admin.initializeApp({
    projectId: 'isw-writing'
  });
  console.log('🔑 Application Default Credentials 사용\n');
}

const db = admin.firestore();

async function checkSsakDB() {
  console.log('🌱 싹DB Firestore 데이터 확인\n');
  console.log('=' .repeat(50));

  // 1. 메타 정보 확인
  console.log('\n📊 메타 정보 (ssakdb_meta/stats):');
  try {
    const statsDoc = await db.collection('ssakdb_meta').doc('stats').get();
    if (statsDoc.exists) {
      const stats = statsDoc.data();
      console.log(`  총 문서: ${stats.totalDocuments}개`);
      console.log(`  버전: ${stats.version}`);
      console.log(`  컬렉션별:`, stats.collections);
    } else {
      console.log('  ❌ 메타 정보 없음');
    }
  } catch (e) {
    console.log('  ❌ 오류:', e.message);
  }

  // 2. rubrics 컬렉션 확인
  console.log('\n📚 rubrics 컬렉션:');
  try {
    const rubricsSnap = await db.collection('rubrics').limit(5).get();
    console.log(`  문서 수 (샘플): ${rubricsSnap.size}개`);

    if (!rubricsSnap.empty) {
      console.log('\n  샘플 문서:');
      rubricsSnap.docs.forEach((doc, i) => {
        const data = doc.data();
        console.log(`  [${i+1}] ID: ${doc.id}`);
        console.log(`      학령대: ${data.education_level || 'N/A'}`);
        console.log(`      학년: ${data.grade || 'N/A'}`);
        console.log(`      장르: ${data.genre || 'N/A'}`);
        console.log(`      영역: ${data.domain || 'N/A'}`);
        console.log(`      내용 길이: ${data.content?.length || 0}자`);
      });
    }

    // 총 개수 확인
    const allRubrics = await db.collection('rubrics').get();
    console.log(`\n  총 rubrics 문서: ${allRubrics.size}개`);
  } catch (e) {
    console.log('  ❌ 오류:', e.message);
  }

  // 3. examples 컬렉션 확인
  console.log('\n📝 examples 컬렉션:');
  try {
    const examplesSnap = await db.collection('examples').limit(5).get();
    console.log(`  문서 수 (샘플): ${examplesSnap.size}개`);

    if (!examplesSnap.empty) {
      console.log('\n  샘플 문서:');
      examplesSnap.docs.forEach((doc, i) => {
        const data = doc.data();
        console.log(`  [${i+1}] ID: ${doc.id}`);
        console.log(`      학령대: ${data.education_level || 'N/A'}`);
        console.log(`      장르: ${data.genre || 'N/A'}`);
        console.log(`      수준: ${data.level || 'N/A'}`);
        console.log(`      내용 길이: ${data.content?.length || 0}자`);
      });
    }

    // 총 개수 확인
    const allExamples = await db.collection('examples').get();
    console.log(`\n  총 examples 문서: ${allExamples.size}개`);
  } catch (e) {
    console.log('  ❌ 오류:', e.message);
  }

  // 4. 특정 쿼리 테스트 (Cloud Functions에서 사용하는 쿼리)
  console.log('\n🔍 Cloud Functions 쿼리 테스트:');

  // 초등 1-2학년 일기 루브릭 검색
  console.log('\n  [테스트 1] 초등학교 1-2학년 일기 종합 루브릭');
  try {
    const q1 = await db.collection('rubrics')
      .where('education_level', '==', '초등학교')
      .where('grade', '==', '1-2학년')
      .where('genre', '==', '일기')
      .where('domain', '==', '종합')
      .limit(1)
      .get();

    if (q1.empty) {
      console.log('    ❌ 결과 없음');
    } else {
      const data = q1.docs[0].data();
      console.log('    ✅ 발견!');
      console.log(`    ID: ${q1.docs[0].id}`);
      console.log(`    내용 길이: ${data.content?.length || 0}자`);
    }
  } catch (e) {
    console.log('    ❌ 쿼리 오류:', e.message);
  }

  // 초등학교 일기 high 예시 검색
  console.log('\n  [테스트 2] 초등학교 일기 우수작 (high)');
  try {
    const q2 = await db.collection('examples')
      .where('education_level', '==', '초등학교')
      .where('genre', '==', '일기')
      .where('level', '==', 'high')
      .limit(1)
      .get();

    if (q2.empty) {
      console.log('    ❌ 결과 없음');
    } else {
      const data = q2.docs[0].data();
      console.log('    ✅ 발견!');
      console.log(`    ID: ${q2.docs[0].id}`);
      console.log(`    내용 길이: ${data.content?.length || 0}자`);
    }
  } catch (e) {
    console.log('    ❌ 쿼리 오류:', e.message);
  }

  console.log('\n' + '=' .repeat(50));
  console.log('✅ 확인 완료');

  process.exit(0);
}

checkSsakDB().catch(err => {
  console.error('❌ 오류:', err);
  process.exit(1);
});
