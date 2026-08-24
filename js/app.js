/**
 * app.js: 입력 폼 처리, 표 렌더링 및 필터링, 전체 앱 라이프사이클 관리
 */

let allRecords = [];
let currentFilter = "all";

// DOM 요소
const growthForm = document.getElementById("growth-form");
const recordDateInput = document.getElementById("record-date");
const recordHeightInput = document.getElementById("record-height");
const recordWeightInput = document.getElementById("record-weight");
const recordMemoInput = document.getElementById("record-memo");
const calculatedAgeDiv = document.getElementById("calculated-age");
const tableBody = document.getElementById("record-table-body");
const filterBtns = document.querySelectorAll(".filter-btn");

// 1. 초기 날짜 오늘 날짜로 세팅
function initDate() {
  const today = new Date().toISOString().split("T")[0];
  recordDateInput.value = today;
  updateAgePreview();
}

// 2. 입력 중인 날짜에 따른 월령 실시간 미리보기 업데이트
function updateAgePreview() {
  const selectedChild = document.querySelector('input[name="child-name"]:checked').value;
  const dateVal = recordDateInput.value;
  if (!dateVal) {
    calculatedAgeDiv.textContent = "월령: -";
    return;
  }
  const ageInfo = getChildAgeInfo(selectedChild, dateVal);
  calculatedAgeDiv.textContent = `월령: ${ageInfo.ageText} (${ageInfo.totalMonths}개월)`;
}

// 3. 기록 표 렌더링 함수
function renderTable() {
  // 필터 적용
  const filtered = allRecords.filter((r) => {
    if (currentFilter === "all") return true;
    return r.name === currentFilter;
  });

  // 표는 최신 날짜가 위로 오도록 내림차순 정렬
  const displayList = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (displayList.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" class="loading-text">기록된 데이터가 없습니다.</td></tr>`;
    return;
  }

  let html = "";
  displayList.forEach((item) => {
    const nameClass = item.name === "나은" ? "tag-naeun" : "tag-dohyeong";
    const heightDisplay = item.height !== null && item.height !== undefined ? `${item.height} cm` : "-";
    const weightDisplay = item.weight !== null && item.weight !== undefined ? `${item.weight} kg` : "-";

    html += `
      <tr>
        <td class="${nameClass}"><strong>${item.name}</strong></td>
        <td>${item.date}</td>
        <td>${item.ageText}</td>
        <td>${heightDisplay}</td>
        <td>${weightDisplay}</td>
        <td>${item.memo || "-"}</td>
        <td>
          <button class="delete-btn" onclick="deleteGrowthRecord('${item.id}')">삭제</button>
        </td>
      </tr>
    `;
  });

  tableBody.innerHTML = html;
}

// 4. 새 기록 등록 제출 이벤트
growthForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const selectedChild = document.querySelector('input[name="child-name"]:checked').value;
  const dateVal = recordDateInput.value;
  const heightVal = recordHeightInput.value ? parseFloat(recordHeightInput.value) : null;
  const weightVal = recordWeightInput.value ? parseFloat(recordWeightInput.value) : null;
  const memoVal = recordMemoInput.value.trim();

  if (!heightVal && !weightVal) {
    alert("키 또는 몸무게 중 하나 이상을 입력해 주세요.");
    return;
  }

  try {
    await addGrowthRecord({
      name: selectedChild,
      date: dateVal,
      height: heightVal,
      weight: weightVal,
      memo: memoVal
    });

    // 입력 폼 초기화
    recordHeightInput.value = "";
    recordWeightInput.value = "";
    recordMemoInput.value = "";
    alert("성장 기록이 성공적으로 등록되었습니다!");
  } catch (error) {
    console.error(error);
    alert("기록 저장 중 오류가 발생했습니다: " + error.message);
  }
});

// 5. 아이 선택 변경 및 날짜 변경 시 월령 미리보기 갱신
document.querySelectorAll('input[name="child-name"]').forEach((radio) => {
  radio.addEventListener("change", updateAgePreview);
});
recordDateInput.addEventListener("change", updateAgePreview);

// 6. 표 필터 버튼 클릭 이벤트
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.getAttribute("data-filter");
    renderTable();
  });
});

// 7. 앱 시작 (Firebase 실시간 리스너 구독)
window.addEventListener("DOMContentLoaded", () => {
  initDate();
  initChart();

  listenToGrowthRecords((records) => {
    allRecords = records;
    updateGrowthChart(allRecords);
    renderTable();
  });
});
