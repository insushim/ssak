/**
 * Firestore 싹DB 데이터 확인 스크립트 (Client SDK)
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, query, where, limit } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyA6qDbJR5taBJvrpFNFE8_eIL1v9e9joGM',
  authDomain: 'isw-writing.firebaseapp.com',
  projectId: 'isw-writing',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkDB() {
  console.log('=== Firestore 싹DB 데이터 확인 ===\n');

  // 1. ssakdb_meta/stats 확인
  console.log('1. ssakdb_meta/stats 확인:');
  try {
    const statsDoc = await getDoc(doc(db, 'ssakdb_meta', 'stats'));
    if (statsDoc.exists()) {
      const data = statsDoc.data();
      console.log('   ✅ 존재함');
      console.log('   총 문서:', data.totalDocuments);
      console.log('   컬렉션:', JSON.stringify(data.collections, null, 2));
    } else {
      console.log('   ❌ 없음 - 업로드 필요');
    }
  } catch (e) {
    console.log('   ❌ 오류:', e.message);
  }

  // 2. rubrics 컬렉션 확인
  console.log('\n2. rubrics 컬렉션 확인:');
  try {
    const rubricsSnap = await getDocs(query(collection(db, 'rubrics'), limit(3)));
    console.log('   문서 수 (샘플):', rubricsSnap.size);
    if (rubricsSnap.size > 0) {
      rubricsSnap.docs.forEach((d, i) => {
        const data = d.data();
        console.log(`   [${i+1}] ID: ${d.id} | education_level: ${data.education_level} | grade: ${data.grade} | genre: ${data.genre}`);
      });
    }
  } catch (e) {
    console.log('   ❌ 오류:', e.message);
  }

  // 3. examples 컬렉션 확인
  console.log('\n3. examples 컬렉션 확인:');
  try {
    const examplesSnap = await getDocs(query(collection(db, 'examples'), limit(3)));
    console.log('   문서 수 (샘플):', examplesSnap.size);
    if (examplesSnap.size > 0) {
      examplesSnap.docs.forEach((d, i) => {
        const data = d.data();
        console.log(`   [${i+1}] ID: ${d.id} | education_level: ${data.education_level} | genre: ${data.genre} | level: ${data.level}`);
      });
    }
  } catch (e) {
    console.log('   ❌ 오류:', e.message);
  }

  // 4. Cloud Functions에서 사용하는 쿼리 테스트
  console.log('\n4. Cloud Functions 쿼리 테스트:');

  // 초등학교 1-2학년 일기 루브릭
  console.log('   [테스트 A] rubrics: education_level="초등학교", grade="1-2학년", genre="일기", domain="종합"');
  try {
    const q1 = query(
      collection(db, 'rubrics'),
      where('education_level', '==', '초등학교'),
      where('grade', '==', '1-2학년'),
      where('genre', '==', '일기'),
      where('domain', '==', '종합'),
      limit(1)
    );
    const snap1 = await getDocs(q1);
    if (snap1.empty) {
      console.log('   결과: ❌ 없음');
    } else {
      console.log('   결과: ✅ 있음 (ID: ' + snap1.docs[0].id + ')');
    }
  } catch (e) {
    console.log('   ❌ 오류:', e.message);
  }

  // 초등학교 일기 high 예시 (한글 level)
  console.log('   [테스트 B] examples: education_level="초등학교", genre="일기", level="상"');
  try {
    const q2 = query(
      collection(db, 'examples'),
      where('education_level', '==', '초등학교'),
      where('genre', '==', '일기'),
      where('level', '==', '상'),
      limit(1)
    );
    const snap2 = await getDocs(q2);
    if (snap2.empty) {
      console.log('   결과: ❌ 없음');
    } else {
      console.log('   결과: ✅ 있음 (ID: ' + snap2.docs[0].id + ')');
    }
  } catch (e) {
    console.log('   ❌ 오류:', e.message);
  }

  // 초등 일기 high 예시 (파일 실제 값)
  console.log('   [테스트 C] examples: education_level="초등", genre="일기", level="상"');
  try {
    const q3 = query(
      collection(db, 'examples'),
      where('education_level', '==', '초등'),
      where('genre', '==', '일기'),
      where('level', '==', '상'),
      limit(1)
    );
    const snap3 = await getDocs(q3);
    if (snap3.empty) {
      console.log('   결과: ❌ 없음');
    } else {
      console.log('   결과: ✅ 있음 (ID: ' + snap3.docs[0].id + ')');
      const data = snap3.docs[0].data();
      console.log('   내용 길이:', data.content ? data.content.length : 0, '자');
    }
  } catch (e) {
    console.log('   ❌ 오류:', e.message);
  }

  console.log('\n=== 확인 완료 ===');
  process.exit(0);
}

checkDB().catch(e => { console.error('오류:', e); process.exit(1); });
