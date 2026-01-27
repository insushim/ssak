/**
 * Firestore 싹DB 데이터 확인 스크립트 (Client SDK 버전)
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, getDoc, getDocs, query, where, limit } = require('firebase/firestore');

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

async function checkSsakDB() {
  console.log('🌱 싹DB Firestore 데이터 확인 (Client SDK)\n');
  console.log('=' .repeat(60));

  // 1. 메타 정보 확인
  console.log('\n📊 메타 정보 (ssakdb_meta/stats):');
  try {
    const statsDoc = await getDoc(doc(db, 'ssakdb_meta', 'stats'));
    if (statsDoc.exists()) {
      const stats = statsDoc.data();
      console.log(`  ✅ 총 문서: ${stats.totalDocuments}개`);
      console.log(`  버전: ${stats.version}`);
      console.log(`  최종 업데이트: ${stats.lastUpdated}`);
      console.log(`  컬렉션별:`, JSON.stringify(stats.collections, null, 2));
    } else {
      console.log('  ❌ 메타 정보 없음 - 싹DB가 업로드되지 않았습니다!');
    }
  } catch (e) {
    console.log('  ❌ 오류:', e.message);
  }

  // 2. rubrics 컬렉션 확인
  console.log('\n📚 rubrics 컬렉션:');
  try {
    const rubricsRef = collection(db, 'rubrics');
    const rubricsSnap = await getDocs(query(rubricsRef, limit(5)));
    console.log(`  샘플 문서 수: ${rubricsSnap.size}개`);

    if (!rubricsSnap.empty) {
      console.log('\n  샘플 문서:');
      rubricsSnap.docs.forEach((docSnap, i) => {
        const data = docSnap.data();
        console.log(`  [${i+1}] ID: ${docSnap.id}`);
        console.log(`      학령대: ${data.education_level || 'N/A'}`);
        console.log(`      학년: ${data.grade || 'N/A'}`);
        console.log(`      장르: ${data.genre || 'N/A'}`);
        console.log(`      영역: ${data.domain || 'N/A'}`);
        console.log(`      내용 길이: ${data.content?.length || 0}자`);
      });
    } else {
      console.log('  ❌ rubrics 컬렉션이 비어있습니다!');
    }
  } catch (e) {
    console.log('  ❌ 오류:', e.message);
  }

  // 3. examples 컬렉션 확인
  console.log('\n📝 examples 컬렉션:');
  try {
    const examplesRef = collection(db, 'examples');
    const examplesSnap = await getDocs(query(examplesRef, limit(5)));
    console.log(`  샘플 문서 수: ${examplesSnap.size}개`);

    if (!examplesSnap.empty) {
      console.log('\n  샘플 문서:');
      examplesSnap.docs.forEach((docSnap, i) => {
        const data = docSnap.data();
        console.log(`  [${i+1}] ID: ${docSnap.id}`);
        console.log(`      학령대: ${data.education_level || 'N/A'}`);
        console.log(`      장르: ${data.genre || 'N/A'}`);
        console.log(`      수준: ${data.level || 'N/A'}`);
        console.log(`      내용 길이: ${data.content?.length || 0}자`);
      });
    } else {
      console.log('  ❌ examples 컬렉션이 비어있습니다!');
    }
  } catch (e) {
    console.log('  ❌ 오류:', e.message);
  }

  // 4. Cloud Functions에서 사용하는 쿼리 테스트
  console.log('\n🔍 Cloud Functions 쿼리 테스트:');

  // 테스트 1: 초등학교 1-2학년 일기 종합 루브릭
  console.log('\n  [테스트 1] 초등학교 1-2학년 일기 종합 루브릭');
  try {
    const q1 = query(
      collection(db, 'rubrics'),
      where('education_level', '==', '초등학교'),
      where('grade', '==', '1-2학년'),
      where('genre', '==', '일기'),
      where('domain', '==', '종합'),
      limit(1)
    );
    const snapshot1 = await getDocs(q1);

    if (snapshot1.empty) {
      console.log('    ❌ 결과 없음');

      // 디버깅: 어떤 데이터가 있는지 확인
      console.log('    → 디버깅: rubrics에서 사용 가능한 education_level 값 확인...');
      const allRubricsSnap = await getDocs(query(collection(db, 'rubrics'), limit(10)));
      const eduLevels = new Set();
      allRubricsSnap.docs.forEach(d => {
        if (d.data().education_level) eduLevels.add(d.data().education_level);
      });
      console.log('    → 사용 가능한 education_level:', [...eduLevels]);
    } else {
      const data = snapshot1.docs[0].data();
      console.log('    ✅ 발견!');
      console.log(`    ID: ${snapshot1.docs[0].id}`);
      console.log(`    내용 미리보기: ${data.content?.substring(0, 200) || '없음'}...`);
    }
  } catch (e) {
    console.log('    ❌ 쿼리 오류:', e.message);
  }

  // 테스트 2: 초등학교 일기 high 예시
  console.log('\n  [테스트 2] 초등학교 일기 우수작 (high)');
  try {
    const q2 = query(
      collection(db, 'examples'),
      where('education_level', '==', '초등학교'),
      where('genre', '==', '일기'),
      where('level', '==', 'high'),
      limit(1)
    );
    const snapshot2 = await getDocs(q2);

    if (snapshot2.empty) {
      console.log('    ❌ 결과 없음');

      // 디버깅
      console.log('    → 디버깅: examples에서 사용 가능한 값 확인...');
      const allExamplesSnap = await getDocs(query(collection(db, 'examples'), limit(10)));
      const values = { eduLevels: new Set(), genres: new Set(), levels: new Set() };
      allExamplesSnap.docs.forEach(d => {
        const data = d.data();
        if (data.education_level) values.eduLevels.add(data.education_level);
        if (data.genre) values.genres.add(data.genre);
        if (data.level) values.levels.add(data.level);
      });
      console.log('    → education_level:', [...values.eduLevels]);
      console.log('    → genre:', [...values.genres]);
      console.log('    → level:', [...values.levels]);
    } else {
      const data = snapshot2.docs[0].data();
      console.log('    ✅ 발견!');
      console.log(`    ID: ${snapshot2.docs[0].id}`);
      console.log(`    내용 미리보기: ${data.content?.substring(0, 200) || '없음'}...`);
    }
  } catch (e) {
    console.log('    ❌ 쿼리 오류:', e.message);
  }

  console.log('\n' + '=' .repeat(60));
  console.log('✅ 확인 완료\n');

  process.exit(0);
}

checkSsakDB().catch(err => {
  console.error('❌ 오류:', err);
  process.exit(1);
});
