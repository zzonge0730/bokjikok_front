import React, { useState } from "react";
import { Home, FileText, Target, Calendar, Search, X } from "lucide-react";
import "./App.css";

const App = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [loginForm, setLoginForm] = useState({ id: "", password: "" });
  const API_BASE = "https://bokjikok.onrender.com";
  const [recommendedPolicies, setRecommendedPolicies] = useState([]);
  // 즐겨찾기 상태 추가
  const [favoriteWelfares, setFavoriteWelfares] = useState([
    {
      id: 1,
      name: "청년도약계좌",
      description: "청년층의 자산 형성을 지원하는 적금 상품",
      icon: "💰",
      status: "신청 가능",
    },
    {
      id: 2,
      name: "청년 전세자금 대출",
      description: "만 34세 이하 청년층 대상 전세자금 지원",
      icon: "🏠",
      status: "신청 완료",
    },
    {
      id: 3,
      name: "국민취업지원제도",
      description: "취업취약계층 및 청년층 취업지원 서비스",
      icon: "💼",
      status: "신청 가능",
    },
  ]);

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

  const handleLogin = () => {
    if (loginForm.id && loginForm.password) {
      setIsLoggedIn(true);
      setUserName(loginForm.id);
      setShowLoginModal(false);
      setActiveTab("history");
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
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/chat`, {   // ✅ 여기 수정됨
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput }),
      });
      const data = await res.json();

      // 🗨️ 1. GPT 자연어 답변 (말풍선)
      if (data.reply) {
        setChatMessages((prev) => [
          ...prev,
          { id: Date.now(), type: "bot", message: data.reply }
        ]);
      }

      // 🃏 2. 정책 카드 (항상 최신으로 교체)
      if (data.policies) {
        setChatMessages((prev) => [
          ...prev.filter((msg) => msg.type !== "policy"), // 기존 카드 지우고
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

  const menuItems = [
    { id: "home", label: "홈", icon: "🏠" },
    { id: "check", label: "진단", icon: "📝" },
    { id: "result", label: "마이페이지", icon: "👤" },
  ];

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

  const renderCheck = () => {
    const validateForm = () => {
      const errors = [];

      if (!formData.age || formData.age.trim() === "") {
        errors.push("나이를 입력해주세요");
      } else if (
        isNaN(formData.age) ||
        parseInt(formData.age) < 0 ||
        parseInt(formData.age) > 120
      ) {
        errors.push("올바른 나이를 입력해주세요 (0-120)");
      }

      if (!formData.income || formData.income.trim() === "") {
        errors.push("월 소득을 입력해주세요");
      } else if (isNaN(formData.income) || parseInt(formData.income) < 0) {
        errors.push("올바른 월 소득을 입력해주세요");
      }

      if (!formData.job || formData.job === "") {
        errors.push("직업을 선택해주세요");
      }

      return errors;
    };

    const handleDiagnosis = async () => {
      const errors = validateForm();
      if (errors.length > 0) {
        alert(errors.join("\n"));
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/routes/diagnosis`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        setRecommendedPolicies(data.policies || []);
        if (res.ok) {
          console.log("✅ 진단 성공:", data);
          // TODO: 받은 데이터를 diagnosis 결과 state에 저장
          handleTabChange("diagnosis");
        } else {
          alert(data.error || "진단 요청 실패");
        }
      } catch (err) {
        console.error(err);
        alert("서버와 통신 중 오류가 발생했습니다.");
      }
    };


    const hasAgeError = () => {
      return (
        formData.age &&
        (isNaN(formData.age) ||
          parseInt(formData.age) < 0 ||
          parseInt(formData.age) > 120)
      );
    };

    const hasIncomeError = () => {
      return (
        formData.income &&
        (isNaN(formData.income) || parseInt(formData.income) < 0)
      );
    };

    const isFormValid = () => {
      return (
        formData.age &&
        formData.income &&
        formData.job &&
        !hasAgeError() &&
        !hasIncomeError()
      );
    };

    return (
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
                style={{
                  borderColor: hasAgeError() ? "#ef4444" : "#d1d5db",
                  borderWidth: hasAgeError() ? "2px" : "1px",
                }}
              />
              {hasAgeError() && (
                <div
                  style={{
                    color: "#ef4444",
                    fontSize: "0.75rem",
                    marginTop: "0.5rem",
                    marginLeft: "0.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <span>⚠️</span>
                  올바른 나이를 입력해주세요 (0-120)
                </div>
              )}
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
                style={{
                  borderColor: hasIncomeError() ? "#ef4444" : "#d1d5db",
                  borderWidth: hasIncomeError() ? "2px" : "1px",
                }}
              />
              {hasIncomeError() && (
                <div
                  style={{
                    color: "#ef4444",
                    fontSize: "0.75rem",
                    marginTop: "0.5rem",
                    marginLeft: "0.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <span>⚠️</span>
                  올바른 월 소득을 입력해주세요
                </div>
              )}
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
              onClick={handleDiagnosis}
              className="diagnosis-button"
              style={{
                backgroundColor: !isFormValid() ? "#9ca3af" : "#22d3ee",
                cursor: !isFormValid() ? "not-allowed" : "pointer",
                opacity: !isFormValid() ? 0.7 : 1,
              }}
              disabled={!isFormValid()}
            >
              <Search size={20} />
              {!isFormValid() ? "모든 정보를 입력해주세요" : "진단 시작하기"}
            </button>

            <div
              className="benefits-section"
              style={{
                marginTop: "1rem",
                backgroundColor: "#fef3c7",
                border: "1px solid #fbbf24",
                padding: "1rem",
              }}
            >
              <div
                className="benefits-header"
                style={{ marginBottom: "0.5rem" }}
              >
                <span style={{ fontSize: "1.25rem" }}>⚠️</span>
                <h3
                  style={{
                    fontSize: "0.875rem",
                    color: "#92400e",
                    margin: 0,
                  }}
                >
                  입력 안내
                </h3>
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#92400e",
                  lineHeight: "1.4",
                }}
              >
                정확한 복지 혜택 진단을 위해 모든 정보를 정확히 입력해주세요.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDiagnosisResult = () => {
    const allResults = [
      {
        id: 1,
        name: "청년도약계좌",
        description:
          "청년층의 자산 형성을 지원하는 적금 상품으로, 월 70만원까지 납입 가능하며 정부지원금이 추가됩니다.",
        icon: "💰",
        status: "신청 가능",
        deadline: "2024.12.31",
        benefits: [
          "월 최대 70만원 납입",
          "정부지원금 월 6만원",
          "만기 시 최대 5,000만원",
        ],
      },
      {
        id: 2,
        name: "청년 전세자금 대출",
        description:
          "만 34세 이하 청년층을 대상으로 한 전세자금 지원 프로그램입니다.",
        icon: "🏠",
        status: "신청 가능",
        deadline: "상시 접수",
        benefits: ["최대 2억원 대출", "연 1.8~2.4% 금리", "최대 30년 상환"],
      },
      {
        id: 3,
        name: "국민취업지원제도",
        description:
          "취업취약계층 및 청년층을 위한 맞춤형 취업지원 서비스를 제공합니다.",
        icon: "💼",
        status: "신청 가능",
        deadline: "2024.11.30",
        benefits: ["월 50만원 구직급여", "취업성공패키지", "직업훈련 지원"],
      },
    ];

    const diagnosisResults = allResults.filter(
      (item) => item.status === "신청 가능"
    );

    const handleAddToFavorites = (welfare) => {
      const isAlreadyFavorite = favoriteWelfares.some(
        (item) => item.id === welfare.id
      );

      if (isAlreadyFavorite) {
        alert(`"${welfare.name}"은(는) 이미 즐겨찾기에 있습니다.`);
        return;
      }

      setFavoriteWelfares((prev) => [...prev, welfare]);
      alert(`"${welfare.name}"이(가) 즐겨찾기에 추가되었습니다!`);
    };

    const getStatusStyle = (status) => {
      if (status === "신청 가능") {
        return { backgroundColor: "#dcfce7", color: "#166534" };
      } else if (status === "신청 완료") {
        return { backgroundColor: "#dbeafe", color: "#1e40af" };
      } else {
        return { backgroundColor: "#fee2e2", color: "#dc2626" };
      }
    };

    return (
      <div className="result-content">
        <div
          className="benefits-section"
          style={{
            marginBottom: "1.5rem",
            backgroundColor: "#f0f9ff",
            border: "1px solid #bae6fd",
          }}
        >
          <div className="benefits-header">
            <span style={{ fontSize: "1.5rem" }}>🎯</span>
            <h3 style={{ margin: 0, color: "#0369a1" }}>복지 혜택 진단 결과</h3>
          </div>
          <div
            style={{
              fontSize: "0.875rem",
              color: "#0369a1",
              lineHeight: "1.5",
            }}
          >
            입력하신 정보를 바탕으로 {diagnosisResults.length}개의 신청 가능한
            복지 혜택을 찾았습니다.
          </div>
        </div>

        <div className="result-list">
          {diagnosisResults.map((welfare) => (
            <div key={welfare.id} className="welfare-card">
              <div className="welfare-header">
                <div className="welfare-icon">{welfare.icon}</div>
                <div className="welfare-info">
                  <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "1.125rem" }}>
                    {welfare.name}
                  </h3>

                  <p
                    style={{
                      margin: "0 0 0.75rem 0",
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      lineHeight: "1.5",
                    }}
                  >
                    {welfare.description}
                  </p>

                  <div style={{ marginBottom: "0.75rem" }}>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        color: "#374151",
                        marginBottom: "0.25rem",
                      }}
                    >
                      주요 혜택:
                    </div>
                    {welfare.benefits.map((benefit, index) => (
                      <div
                        key={index}
                        style={{
                          fontSize: "0.75rem",
                          color: "#6b7280",
                          marginLeft: "0.5rem",
                          marginBottom: "0.125rem",
                        }}
                      >
                        • {benefit}
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                    }}
                  >
                    <button
                      onClick={() => handleAddToFavorites(welfare)}
                      style={{
                        width: "100%",
                        backgroundColor: "#22c55e",
                        color: "white",
                        border: "none",
                        padding: "0.5rem 1rem",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                      }}
                      onMouseOver={(e) =>
                        (e.target.style.backgroundColor = "#16a34a")
                      }
                      onMouseOut={(e) =>
                        (e.target.style.backgroundColor = "#22c55e")
                      }
                    >
                      ⭐ 즐겨찾기 추가
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => handleTabChange("check")}
          className="retry-button"
          style={{ marginTop: "1.5rem" }}
        >
          🔄 다시 진단하기
        </button>

        <div
          className="benefits-section"
          style={{
            marginTop: "1rem",
            backgroundColor: "#fef3c7",
            border: "1px solid #fbbf24",
          }}
        >
          <div className="benefits-header" style={{ marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "1.25rem" }}>💡</span>
            <h3
              style={{
                fontSize: "0.875rem",
                color: "#92400e",
                margin: 0,
              }}
            >
              진단 결과 안내
            </h3>
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "#92400e",
              lineHeight: "1.4",
            }}
          >
            위 결과는 신청 가능한 복지 혜택만을 표시한 것입니다.
            <br />
            각 혜택의 신청 조건을 자세히 확인하신 후 신청해 주세요.
            <br />
            혜택에 따라 추가 서류나 심사가 필요할 수 있습니다.
          </div>
        </div>
      </div>
    );
  };

  const renderResult = () => {
    const handleRemoveFavorite = (id) => {
      setFavoriteWelfares((prev) => prev.filter((item) => item.id !== id));
    };

    return (
      <div className="result-content">
        <div className="chat-section" style={{ marginBottom: "1.5rem" }}>
          <h3>⭐ 즐겨찾기</h3>

          {favoriteWelfares.length > 0 ? (
            <div className="result-list">
              {favoriteWelfares.map((welfare) => (
                <div key={welfare.id} className="welfare-card">
                  <div className="welfare-header">
                    <div className="welfare-icon">{welfare.icon}</div>
                    <div className="welfare-info">
                      <h3>{welfare.name}</h3>
                      <p>{welfare.description}</p>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <span
                          className={`status ${welfare.status.replace(
                            " ",
                            "\\ "
                          )}`}
                        >
                          {welfare.status}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          marginTop: "0.75rem",
                        }}
                      >
                        <button
                          onClick={() => handleRemoveFavorite(welfare.id)}
                          style={{
                            width: "100%",
                            backgroundColor: "#ef4444",
                            color: "white",
                            border: "none",
                            padding: "0.5rem 1rem",
                            borderRadius: "0.5rem",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "background-color 0.2s",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                          }}
                          onMouseOver={(e) =>
                            (e.target.style.backgroundColor = "#dc2626")
                          }
                          onMouseOut={(e) =>
                            (e.target.style.backgroundColor = "#ef4444")
                          }
                        >
                          삭제하기
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "2rem 1rem",
                backgroundColor: "white",
                borderRadius: "0.75rem",
                border: "1px solid #e5e7eb",
                color: "#6b7280",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⭐</div>
              <p style={{ marginBottom: "0.5rem", fontWeight: "500" }}>
                아직 즐겨찾기한 복지가 없습니다
              </p>
              <p style={{ fontSize: "0.875rem" }}>
                복지 검색에서 관심있는 혜택을 즐겨찾기로 저장해보세요
              </p>
            </div>
          )}
        </div>

        <div className="chat-section">
          <h3>🤖 AI 복지 상담</h3>
          <div className="chat-container">
            {chatMessages
              .filter((msg) => msg.type === "bot" || msg.type === "user")
              .map((msg) => (
                <div key={msg.id} className={`chat-message ${msg.type}`}>
                  {msg.message.split("\n").map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
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
  };

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
      case "diagnosis":
        return renderDiagnosisResult();
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
      <div className="main-content">
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
            {activeTab === "diagnosis" && (
              <>
                <span className="header-icon">🎯</span>
                <h1>진단 결과</h1>
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

        <main className="content">{renderContent()}</main>

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
