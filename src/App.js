import React, { useState } from "react";
import { Home, FileText, Target, Calendar, Search, X } from "lucide-react";
import "./App.css";

const App = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // App 컴포넌트 상단에 추가
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [userName, setUserName] = useState("");
  const [loginForm, setLoginForm] = useState({ id: "", password: "" });
  const [previousRecords] = useState([
    {
      id: 1,
      date: "2025-01-15",
      results: [
        { title: "청년 월세 지원", amount: "월 20만원", status: "신청 가능" },
        {
          title: "청년 창업 지원금",
          amount: "최대 500만원",
          status: "신청 완료",
        },
      ],
    },
    {
      id: 2,
      date: "2024-12-20",
      results: [
        {
          title: "국가장학금 Ⅰ유형",
          amount: "등록금 지원",
          status: "신청 가능",
        },
      ],
    },
  ]);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: "bot",
      message:
        "안녕하세요! 복지콕 AI 상담봇입니다. 궁금한 복지 혜택에 대해 질문해주세요! 😊",
    },
  ]);
  const [formData, setFormData] = useState({
    age: "",
    income: "",
    job: "",
  });

  // App 컴포넌트 내부, handleTabChange 함수 근처에 추가
  const handleLogin = () => {
    // 간단한 더미 로그인 (실제로는 서버 인증 필요)
    if (loginForm.id && loginForm.password) {
      setIsLoggedIn(true);
      setUserName(loginForm.id);
      setShowLoginModal(false);
      setActiveTab("history"); // 로그인 후 기록 페이지로 이동
      setLoginForm({ id: "", password: "" });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName("");
    setActiveTab("home");
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const newUserMessage = { id: Date.now(), type: "user", message: chatInput };
    setChatMessages((prev) => [...prev, newUserMessage]);
    const currentInput = chatInput;
    setChatInput("");

    try {
      const API_URL = process.env.REACT_APP_API_URL || "";
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput }),
      });
      const data = await res.json();

      // 1. 챗봇 답변 (말풍선)
      if (data.reply) {
        setChatMessages((prev) => [
          ...prev,
          { id: Date.now(), type: "bot", message: data.reply }
        ]);
      }

      // 2. 정책 카드
      if (data.policies) {
        setChatMessages((prev) => [
          // ✅ 기존 policy 메시지 제거
          ...prev.filter((msg) => msg.type !== "policy"),
          // ✅ 최신 정책만 추가
          { id: Date.now() + 1, type: "policy", policies: data.policies }
        ]);
      }

    } catch (error) {
      console.error("❌ Chat API error:", error);
    }
  };

  const getDefaultResponse = (userMessage) => {
    const message = userMessage.toLowerCase();

    if (message.includes("청년") && message.includes("지원")) {
      return "청년을 위한 다양한 지원 제도가 있어요! 주요 혜택으로는:\n\n1. 청년 월세 한시 특별지원 (월 20만원)\n2. 청년 구직활동 지원금\n3. 청년 내일채움공제\n4. 청년 전세자금 대출\n\n더 자세한 정보가 필요하시면 개인정보를 입력해서 맞춤 추천을 받아보세요! 😊";
    }

    if (
      message.includes("주거") ||
      message.includes("월세") ||
      message.includes("전세")
    ) {
      return "주거 관련 복지 혜택을 찾고 계시는군요! 🏠\n\n주요 주거 지원 제도:\n1. 청년 월세 한시 특별지원\n2. 신혼부부 전세자금 대출\n3. 주거급여 (임차급여)\n4. 기존주택 전세임대\n\n나이, 소득, 가족 상황에 따라 지원 조건이 다르니 개인정보를 입력하시면 더 정확한 추천을 받을 수 있어요!";
    }

    return "죄송합니다. 해당 질문에 대한 정확한 답변을 드리기 어려워요. 😅\n\n다음과 같은 키워드로 질문해보세요:\n• 청년 지원\n• 주거 지원\n• 교육비 지원\n• 취업 지원\n\n더 구체적인 상황을 알려주시면 맞춤형 안내를 해드릴 수 있어요!";
  };

  // 메뉴 아이템
  const menuItems = [
    { id: "home", label: "홈", icon: "🏠" },
    { id: "check", label: "진단", icon: "📝" },
    { id: "result", label: "마이페이지", icon: "👤" },
  ];

  // 메인 페이지 (복지 진단 소개)
  const renderHome = () => (
    <div className="home-content">
      <div className="welfare-intro">
        <div className="intro-icon">
          <div className="target-container">
            <img
              src="/target-icon.png"
              alt="타겟 아이콘"
              className="target-icon-image"
            />
          </div>
        </div>

        <h1 className="intro-title">
          나에게 맞는
          <br />
          복지 혜택을 찾아보세요
        </h1>

        <div className="intro-subtitle">
          <p>간단한 정보만 입력하면</p>
          <p>맞춤형 복지 정책을 추천해드립니다</p>
        </div>

        <button
          onClick={() => handleTabChange("check")}
          className="start-button"
        >
          <span>🚀</span>
          복지 진단 시작하기
        </button>

        {/* 로그인 섹션 추가 */}
        <div className="login-section">
          {isLoggedIn ? (
            <div className="user-info-section">
              <div className="user-welcome">
                <span>👋 {userName}님 환영합니다!</span>
                <button onClick={handleLogout} className="logout-btn">
                  로그아웃
                </button>
              </div>
              <button
                onClick={() => handleTabChange("history")}
                className="history-button"
              >
                📋 이전 진단 기록 보기
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="login-button"
            >
              <span>🔑</span>
              로그인해서 이전 기록 보기
            </button>
          )}
        </div>

        <div className="benefits-section">
          <div className="benefits-header">
            <span>📊</span>
            <h3>이런 혜택을 받을 수 있어요</h3>
          </div>

          <div className="benefits-list">
            <div className="benefit-item">
              <span>🏠</span>
              <span>주거 지원 (월세, 전세자금)</span>
            </div>
            <div className="benefit-item">
              <span>💰</span>
              <span>생활비 지원 (청년수당, 구직급여)</span>
            </div>
            <div className="benefit-item">
              <span>🎓</span>
              <span>교육 지원 (학자금, 직업훈련)</span>
            </div>
            <div className="benefit-item">
              <span>🩺</span>
              <span>의료 지원 (건강보험, 의료비)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 조건 입력 페이지
  const renderCheck = () => (
    <div className="check-content">
      <div className="form-container">
        <div className="form-wrapper">
          <div className="form-group">
            <div className="form-label">
              <span>👤</span>
              <label>나이</label>
            </div>
            <input
              type="text"
              placeholder="나이를 입력하세요"
              value={formData.age}
              onChange={(e) => handleInputChange("age", e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <div className="form-label">
              <span>💰</span>
              <label>월 소득 (만원)</label>
            </div>
            <input
              type="text"
              placeholder="월 소득을 입력하세요"
              value={formData.income}
              onChange={(e) => handleInputChange("income", e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <div className="form-label">
              <span>💼</span>
              <label>직업</label>
            </div>
            <select
              value={formData.job}
              onChange={(e) => handleInputChange("job", e.target.value)}
              className="form-select"
            >
              <option value="">직업을 선택하세요</option>
              <option value="student">학생</option>
              <option value="jobseeker">구직자</option>
              <option value="employee">직장인</option>
              <option value="freelancer">프리랜서</option>
              <option value="entrepreneur">창업자</option>
            </select>
          </div>

          <button
            onClick={() => handleTabChange("result")}
            className="diagnosis-button"
          >
            <Search size={20} />
            진단 시작하기
          </button>
        </div>
      </div>
    </div>
  );

 
  // 마이페이지 (AI 상담)
  const renderResult = () => (
    <div className="result-content">
      <div className="chat-section">
        <h3>🤖 AI 복지 상담</h3>
        {/* 1. 채팅 대화 영역 */}
        <div className="chat-container">
          {chatMessages
            .filter((msg) => msg.type === "bot" || msg.type === "user")
            .map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.type}`}>
                {msg.message.split("\n").map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </div>
            ))}
        </div>

        {/* 2. 정책 카드 영역 - 대화와 분리 */}
        <div className="policy-card-container">
          {chatMessages
            .filter((msg) => msg.type === "policy")
            .flatMap((msg) => msg.policies)
            .map((p, i) => (
              <div key={i} className="policy-card">
                <h4>{p.title}</h4>
                <p>{p.description}</p>
                {p.deadline && (
                  <p className="deadline">📅 마감일: {p.deadline}</p>
                )}
                <button
                  className="apply-btn"
                  onClick={() => {
                    setSelectedPolicy(p.title);
                    setShowApplyModal(true);
                  }}
                >
                  신청하기
                </button>
              </div>
            ))}
        </div>

        <div className="chat-input-container">
          <input
            type="text"
            placeholder="복지 혜택에 대해 질문해보세요..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="chat-input"
          />
          <button onClick={handleSendMessage} className="send-button">
            📤
          </button>
        </div>
      </div>
    </div>
  );


  // 이전 기록 페이지
  const renderHistory = () => (
    <div className="result-content">
      <div className="history-header">
        <h3>📋 이전 진단 기록</h3>
        <p>이전에 진단받은 복지 혜택을 확인하세요</p>
      </div>

      <div className="history-list">
        {previousRecords.map((record) => (
          <div key={record.id} className="history-item">
            <div className="history-header-info">
              <h4>{record.title}</h4>
              <span className="history-date">{record.date}</span>
            </div>
            <div className="history-conditions">
              <span>👤 {record.conditions?.age}세</span>
              <span>💰 {record.conditions?.income}만원</span>
              <span>💼 {record.conditions?.job}</span>
            </div>
            <div className="history-results">
              {record.results.map((result, index) => (
                <div key={index} className="result-item">
                  <h5>{result.title}</h5>
                  <p>{result.amount}</p>
                  <span className={`status ${result.status}`}>
                    {result.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => handleTabChange("check")}
        className="new-diagnosis-btn"
      >
        🆕 새로운 진단 받기
      </button>
    </div>
  );
  // 신청 모달
  const ApplyModal = () =>
    showApplyModal && (
      <>
        <div
          className="modal-overlay"
          onClick={() => setShowApplyModal(false)}
        />
        <div className="login-modal">
          <div className="login-modal-content">
            <div className="modal-header">
              <h3>신청 안내</h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="close-btn"
              >
                ✕
              </button>
            </div>
            <p>
              <strong>{selectedPolicy}</strong> 신청 기능은 현재 데모 버전에서는 준비
              중입니다 🙏
            </p>
            <button
              onClick={() => setShowApplyModal(false)}
              className="login-btn"
            >
              확인
            </button>
          </div>
        </div>
      </>
    );

  // 로그인 모달
  const LoginModal = () =>
    showLoginModal && (
      <>
        <div
          className="modal-overlay"
          onClick={() => setShowLoginModal(false)}
        />
        <div className="login-modal">
          <div className="login-modal-content">
            <div className="modal-header">
              <h3>로그인</h3>
              <button
                onClick={() => setShowLoginModal(false)}
                className="close-btn"
              >
                ✕
              </button>
            </div>

            <p>로그인하시면 이전 진단 기록을 확인할 수 있습니다.</p>

            <div className="login-form">
              <div className="form-group">
                <label>아이디</label>
                <input
                  type="text"
                  value={loginForm.id}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, id: e.target.value })
                  }
                  placeholder="아이디를 입력하세요"
                />
              </div>

              <div className="form-group">
                <label>비밀번호</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  placeholder="비밀번호를 입력하세요"
                />
              </div>
            </div>

            <div className="modal-buttons">
              <button
                onClick={() => setShowLoginModal(false)}
                className="cancel-btn"
              >
                취소
              </button>
              <button onClick={handleLogin} className="login-btn">
                로그인
              </button>
            </div>
          </div>
        </div>
      </>
    );

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return renderHome();
      case "check":
        return renderCheck();
      case "history":
        return renderHistory();
      case "result":
        return renderResult();
      default:
        return renderHome();
    }
  };

  return (
    <div className="app">
      <LoginModal />
      <ApplyModal />
      {/* 메인 콘텐츠 영역 */}
      <div className="main-content">
        {/* 페이지 헤더 */}
        <div className="page-header">
          <div className="header-content">
            {activeTab === "home" && (
              <>
                <span className="header-icon">🏛️</span>
                <h1>대한민국 복지 진단</h1>
              </>
            )}
            {activeTab === "check" && (
              <>
                <span className="header-icon">📋</span>
                <h1>조건 입력</h1>
              </>
            )}
            {activeTab === "result" && (
              <>
                <span className="header-icon">👤</span>
                <h1>마이페이지</h1>
              </>
            )}
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <main className="content">{renderContent()}</main>

        {/* 하단 네비게이션 */}
        <div className="bottom-nav">
          {menuItems.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleTabChange(id)}
              className={`nav-item ${activeTab === id ? "active" : ""}`}
            >
              <div className="active-box">
                <span className="icon" aria-hidden>
                  {icon}
                </span>
                <span className="label">{label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
