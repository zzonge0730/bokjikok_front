import React, { useState } from "react";
import { Search } from "lucide-react";
import "./App.css";

const App = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
        { title: "청년 창업 지원금", amount: "최대 500만원", status: "신청 완료" },
      ],
    },
    {
      id: 2,
      date: "2024-12-20",
      results: [
        { title: "국가장학금 Ⅰ유형", amount: "등록금 지원", status: "신청 가능" },
      ],
    },
  ]);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: "bot",
      message: "안녕하세요! 복지콕 AI 상담봇입니다. 궁금한 복지 혜택에 대해 질문해주세요! 😊",
    },
  ]);
  const [formData, setFormData] = useState({ age: "", income: "", job: "" });

  // 로그인 핸들러
  const handleLogin = () => {
    if (loginForm.id && loginForm.password) {
      setIsLoggedIn(true);
      setUserName(loginForm.id);
      setShowLoginModal(false);
      setActiveTab("history");
      setLoginForm({ id: "", password: "" });
    } else {
      alert("아이디와 비밀번호를 입력해주세요!");
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
        body: JSON.stringify({ message: currentInput }),
      });
      const data = await res.json();

      // 🗨️ GPT 답변 (텍스트)
      if (data.reply) {
        setChatMessages((prev) => [
          ...prev,
          { id: Date.now(), type: "bot", message: data.reply },
        ]);
      }

      // 🃏 정책 카드 (항상 최신으로 교체)
      if (data.policies) {
        setChatMessages((prev) => [
          ...prev.filter((msg) => msg.type !== "policy"),
          { id: Date.now() + 1, type: "policy", policies: data.policies },
        ]);
      }
    } catch (error) {
      console.error("❌ Chat API error:", error);
    }
  };

  // 홈 화면
  const renderHome = () => (
    <div className="home-content">
      <h1>나에게 맞는 복지 혜택을 찾아보세요</h1>
      <button onClick={() => handleTabChange("check")} className="start-button">
        🚀 복지 진단 시작하기
      </button>

      <div className="login-section">
        {isLoggedIn ? (
          <div>
            <span>👋 {userName}님 환영합니다!</span>
            <button onClick={handleLogout}>로그아웃</button>
            <button onClick={() => handleTabChange("history")}>📋 이전 기록 보기</button>
          </div>
        ) : (
          <button onClick={() => setShowLoginModal(true)}>🔑 로그인</button>
        )}
      </div>
    </div>
  );

  // 조건 입력 화면
  const renderCheck = () => (
    <div className="check-content">
      <div className="form-group">
        <label>나이</label>
        <input
          type="text"
          value={formData.age}
          onChange={(e) => handleInputChange("age", e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>월 소득 (만원)</label>
        <input
          type="text"
          value={formData.income}
          onChange={(e) => handleInputChange("income", e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>직업</label>
        <select
          value={formData.job}
          onChange={(e) => handleInputChange("job", e.target.value)}
        >
          <option value="">선택하세요</option>
          <option value="student">학생</option>
          <option value="jobseeker">구직자</option>
          <option value="employee">직장인</option>
          <option value="freelancer">프리랜서</option>
          <option value="entrepreneur">창업자</option>
        </select>
      </div>
      <button
        onClick={() => {
          if (!formData.age || !formData.income || !formData.job) {
            alert("나이, 소득, 직업을 모두 입력해주세요!");
            return;
          }
          handleTabChange("result");
        }}
        disabled={!formData.age || !formData.income || !formData.job} // ✅ disabled 처리
      >
        <Search size={20} /> 진단 시작하기
      </button>
    </div>
  );

  // 상담 화면
  const renderResult = () => (
    <div className="result-content">
      <h3>🤖 AI 복지 상담</h3>
      <div className="chat-container">
        {chatMessages
          .filter((msg) => msg.type === "bot" || msg.type === "user")
          .map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.type}`}>
              {msg.message}
            </div>
          ))}
      </div>
      <div className="policy-card-container">
        {chatMessages
          .filter((msg) => msg.type === "policy")
          .flatMap((msg) => msg.policies)
          .map((p, i) => (
            <div key={i} className="policy-card">
              <h4>{p.title}</h4>
              <p>{p.description}</p>
              {p.deadline && <p>📅 마감일: {p.deadline}</p>}
              <button
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
        />
        <button onClick={handleSendMessage}>📤</button>
      </div>
    </div>
  );

  // 진단 기록
  const renderHistory = () => (
    <div>
      <h3>📋 이전 진단 기록</h3>
      {previousRecords.map((record) => (
        <div key={record.id}>
          <h4>{record.date}</h4>
          {record.results.map((r, i) => (
            <div key={i}>
              <p>{r.title} - {r.amount} ({r.status})</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  // 모달
  const ApplyModal = () =>
    showApplyModal && (
      <div className="modal">
        <h3>{selectedPolicy} 신청 안내</h3>
        <p>데모 버전에서는 신청 기능이 준비 중입니다 🙏</p>
        <button onClick={() => setShowApplyModal(false)}>확인</button>
      </div>
    );

  const LoginModal = () =>
    showLoginModal && (
      <div className="modal">
        <h3>로그인</h3>
        <input
          type="text"
          placeholder="아이디"
          value={loginForm.id}
          onChange={(e) => setLoginForm({ ...loginForm, id: e.target.value })}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={loginForm.password}
          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
        />
        <button onClick={handleLogin}>로그인</button>
        <button onClick={() => setShowLoginModal(false)}>취소</button>
      </div>
    );

  const renderContent = () => {
    switch (activeTab) {
      case "home": return renderHome();
      case "check": return renderCheck();
      case "result": return renderResult();
      case "history": return renderHistory();
      default: return renderHome();
    }
  };

  return (
    <div className="app">
      <LoginModal />
      <ApplyModal />
      {renderContent()}
    </div>
  );
};

export default App;
