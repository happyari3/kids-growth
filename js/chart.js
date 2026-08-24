/**
 * chart.js: Apache ECharts Mixed Line and Bar (이중 Y축 복합 차트)
 * X축: 월령(총 개월수 기준 오버랩)
 * 주 Y축(좌): 키(cm) -> 선 그래프
 * 보조 Y축(우): 몸무게(kg) -> 막대 그래프
 */

let myChart = null;

// 차트 초기화 함수
function initChart() {
  const chartDom = document.getElementById("growth-chart");
  if (!chartDom) return;
  
  myChart = echarts.init(chartDom);
  window.addEventListener("resize", () => myChart && myChart.resize());
}

// 데이터 업데이트 및 그래프 다시 그리기
function updateGrowthChart(recordsList) {
  if (!myChart) initChart();

  // 1. 존재하는 모든 '월령(개월수)' 수집 및 중복 제거 후 오름차순 정렬
  const monthsSet = new Set();
  recordsList.forEach((r) => monthsSet.add(r.totalMonths));
  const sortedMonths = Array.from(monthsSet).sort((a, b) => a - b);

  // X축 라벨 생성 (예: "14m (1년 2m)")
  const xAxisLabels = sortedMonths.map((m) => `${m}m\n(${formatAgeString(m)})`);

  // 2. 월령별 나은/도형 데이터 맵 구성
  const naeunMap = {};
  const dohyeongMap = {};

  recordsList.forEach((r) => {
    const targetMap = r.name === "나은" ? naeunMap : dohyeongMap;
    targetMap[r.totalMonths] = {
      height: r.height !== null && r.height !== undefined ? r.height : null,
      weight: r.weight !== null && r.weight !== undefined ? r.weight : null
    };
  });

  // 3. ECharts 시리즈별 데이터 배열 매핑
  const naeunHeightData = sortedMonths.map((m) => (naeunMap[m] ? naeunMap[m].height : null));
  const naeunWeightData = sortedMonths.map((m) => (naeunMap[m] ? naeunMap[m].weight : null));
  const dohyeongHeightData = sortedMonths.map((m) => (dohyeongMap[m] ? dohyeongMap[m].height : null));
  const dohyeongWeightData = sortedMonths.map((m) => (dohyeongMap[m] ? dohyeongMap[m].weight : null));

  // 4. ECharts 옵션 설정
  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      formatter: function (params) {
        if (!params || params.length === 0) return "";
        const monthIndex = params[0].dataIndex;
        const totalM = sortedMonths[monthIndex];
        let tipHtml = `<strong>월령: ${totalM}개월 (${formatAgeString(totalM)})</strong><br/>`;
        
        params.forEach((item) => {
          if (item.value !== null && item.value !== undefined) {
            const unit = item.seriesName.includes("키") ? "cm" : "kg";
            tipHtml += `${item.marker} ${item.seriesName}: <b>${item.value} ${unit}</b><br/>`;
          }
        });
        return tipHtml;
      }
    },
    legend: {
      data: ["나은 키(선)", "도형 키(선)", "나은 몸무게(막대)", "도형 몸무게(막대)"],
      top: 0,
      textStyle: { fontSize: 11 }
    },
    grid: {
      top: 50,
      left: "4%",
      right: "4%",
      bottom: 60,
      containLabel: true
    },
    xAxis: {
      type: "category",
      data: xAxisLabels,
      axisLabel: {
        fontSize: 10,
        interval: 0,
        rotate: 0
      },
      axisTick: { alignWithLabel: true }
    },
    yAxis: [
      {
        type: "value",
        name: "키 (cm)",
        min: function (value) {
          return Math.max(0, Math.floor(value.min - 5));
        },
        max: function (value) {
          return Math.ceil(value.max + 5);
        },
        axisLabel: { formatter: "{value} cm" }
      },
      {
        type: "value",
        name: "몸무게 (kg)",
        min: function (value) {
          return Math.max(0, Math.floor(value.min - 2));
        },
        max: function (value) {
          return Math.ceil(value.max + 3);
        },
        position: "right",
        splitLine: { show: false },
        axisLabel: { formatter: "{value} kg" }
      }
    ],
    // 모바일 터치 스와이프 & 하단 슬라이더 줌 설정
    dataZoom: [
      {
        type: "inside", // 모바일 스와이프 및 핀치 줌 지원
        start: Math.max(0, 100 - (15 / sortedMonths.length) * 100), // 최근 15개 구간을 기본 확대
        end: 100
      },
      {
        type: "slider", // 하단 드래그 슬라이더 바
        bottom: 5,
        height: 20,
        start: Math.max(0, 100 - (15 / sortedMonths.length) * 100),
        end: 100
      }
    ],
    series: [
      // 1. 나은 키 (주축 Line)
      {
        name: "나은 키(선)",
        type: "line",
        yAxisIndex: 0,
        data: naeunHeightData,
        connectNulls: true, // 중간 빈 데이터 연결
        smooth: true,
        itemStyle: { color: "#ff7675" },
        lineStyle: { width: 3 }
      },
      // 2. 도형 키 (주축 Line)
      {
        name: "도형 키(선)",
        type: "line",
        yAxisIndex: 0,
        data: dohyeongHeightData,
        connectNulls: true,
        smooth: true,
        itemStyle: { color: "#0984e3" },
        lineStyle: { width: 3 }
      },
      // 3. 나은 몸무게 (보조축 Bar)
      {
        name: "나은 몸무게(막대)",
        type: "bar",
        yAxisIndex: 1,
        data: naeunWeightData,
        itemStyle: { color: "rgba(255, 118, 117, 0.45)" },
        barMaxWidth: 18
      },
      // 4. 도형 몸무게 (보조축 Bar)
      {
        name: "도형 몸무게(막대)",
        type: "bar",
        yAxisIndex: 1,
        data: dohyeongWeightData,
        itemStyle: { color: "rgba(9, 132, 227, 0.45)" },
        barMaxWidth: 18
      }
    ]
  };

  myChart.setOption(option, true);
}
