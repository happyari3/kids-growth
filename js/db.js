/**
 * db.js: Firebase Realtime Database CRUD(생성, 조회, 삭제) 모듈
 */

const recordsRef = database.ref("records");

// 1. 새 성장 기록 추가 함수
function addGrowthRecord(data) {
  return recordsRef.push({
    name: data.name,
    date: data.date,
    height: data.height !== null ? Number(data.height) : null,
    weight: data.weight !== null ? Number(data.weight) : null,
    memo: data.memo || "",
    createdAt: firebase.database.ServerValue.TIMESTAMP
  });
}

// 2. 특정 기록 삭제 함수
function deleteGrowthRecord(key) {
  if (confirm("이 기록을 정말 삭제하시겠습니까?")) {
    return recordsRef.child(key).remove();
  }
}

// 3. 실시간 데이터 변경 감지 및 콜백 실행
function listenToGrowthRecords(onDataChange) {
  recordsRef.on("value", (snapshot) => {
    const rawData = snapshot.val() || {};
    const recordsList = [];

    // Firebase 객체 데이터를 배열로 변환
    Object.keys(rawData).forEach((key) => {
      const item = rawData[key];
      const ageInfo = getChildAgeInfo(item.name, item.date);

      recordsList.push({
        id: key,
        name: item.name,
        date: item.date,
        height: item.height,
        weight: item.weight,
        memo: item.memo,
        totalMonths: ageInfo.totalMonths,
        ageText: ageInfo.ageText
      });
    });

    // 날짜순(오래된 순) 기본 정렬
    recordsList.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 차트 및 표 렌더링 콜백 함수 호출
    onDataChange(recordsList);
  });
}
