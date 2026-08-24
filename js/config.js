// 1. 아이들 생년월일 기준 정보
const CHILDREN_INFO = {
  나은: {
    birthDate: "2017-10-22",
    themeColor: "#ff7675", // 키 꺾은선 색상 (코랄 핑크)
    barColor: "rgba(255, 118, 117, 0.4)" // 몸무게 막대 색상
  },
  도형: {
    birthDate: "2020-12-07",
    themeColor: "#0984e3", // 키 꺾은선 색상 (블루)
    barColor: "rgba(9, 132, 227, 0.4)" // 몸무게 막대 색상
  }
};

// 2. Firebase 프로젝트 설정 (Firebase 콘솔 웹 앱 등록 시 발급받은 키 값 입력)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebase 초기화
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();
