/**
 * utils.js: 생년월일과 측정일자를 기반으로 월령(총 개월수 및 년/개월 포맷)을 계산합니다.
 */

// 1. 총 개월 수 계산 함수 (차트 X축 및 정렬 기준)
function calculateTotalMonths(birthDateStr, targetDateStr) {
  if (!birthDateStr || !targetDateStr) return 0;

  const birth = new Date(birthDateStr);
  const target = new Date(targetDateStr);

  let years = target.getFullYear() - birth.getFullYear();
  let months = target.getMonth() - birth.getMonth();
  let days = target.getDate() - birth.getDate();

  let totalMonths = years * 12 + months;

  // 측정일의 일이 출생일의 일보다 이전이면 1개월 미만으로 간주하여 -1
  if (days < 0) {
    totalMonths -= 1;
  }

  return Math.max(0, totalMonths);
}

// 2. "n년 n개월" (또는 "n개월") 형태의 읽기 편한 텍스트 변환 함수
function formatAgeString(totalMonths) {
  if (totalMonths < 0) return "-";
  
  const years = Math.floor(totalMonths / 12);
  const remainingMonths = totalMonths % 12;

  if (years === 0) {
    return `${remainingMonths}개월`;
  } else if (remainingMonths === 0) {
    return `${years}년`;
  } else {
    return `${years}년 ${remainingMonths}개월`;
  }
}

// 3. 아이 이름과 측정일자로 월령 정보 통합 반환 함수
function getChildAgeInfo(childName, targetDateStr) {
  const child = CHILDREN_INFO[childName];
  if (!child || !targetDateStr) {
    return { totalMonths: 0, ageText: "-" };
  }

  const totalMonths = calculateTotalMonths(child.birthDate, targetDateStr);
  const ageText = formatAgeString(totalMonths);

  return { totalMonths, ageText };
}
