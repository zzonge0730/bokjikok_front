import React, { useState } from "react";
import {
  Search,
  User,
  Heart,
  Bell,
  MessageCircle,
  Calendar,
  Star,
  Menu,
  X,
  Home,
  LogIn,
  LogOut,
  Lock,
  AlertCircle,
} from "lucide-react";
import "./App.css"; // CSS 파일 import
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";


const WelfareApp = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 추가
  const [showLoginModal, setShowLoginModal] = useState(false); // 로그인 모달 상태
  const [userInfo, setUserInfo] = useState({
    age: "",
    income: "",
    job: "",
    family: "",
    region: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: "bot",
      message:
        "안녕하세요! 복지콕 챗봇입니다. 궁금한 복지 혜택에 대해 질문해주세요! 😊",
    },
  ]);
  // 즐겨찾기 상태 관리 (localStorage 사용)
  const [bookmarkedItems, setBookmarkedItems] = useState(() => {
    const saved = localStorage.getItem("bookmarkedWelfares");
    return saved ? JSON.parse(saved) : [];
  });

  // 즐겨찾기 토글 함수
  const toggleBookmark = (welfareId) => {
    setBookmarkedItems((prev) => {
      const newBookmarks = prev.includes(welfareId)
        ? prev.filter((id) => id !== welfareId)
        : [...prev, welfareId];

      localStorage.setItem("bookmarkedWelfares", JSON.stringify(newBookmarks));
      return newBookmarks;
    });
    };
  function parseIncome(value) {
    if (!value) return null;

    // "100-200" or "100~200"
    if (value.includes("~") || value.includes("-")) {
      const [min, max] = value.split(/~|-/).map(v => parseInt(v, 10));
      return Math.round((min + max) / 2) * 10000;
    }

    if (value.includes("+")) {
      return parseInt(value, 10) * 10000;
    }

    return parseInt(value, 10) * 10000;
  }


  // 샘플 복지 데이터
  const sampleWelfares = [
    {
      id: 1,
      title: "청년 월세 한시 특별지원",
      category: "주거",
      amount: "월 20만원",
      deadline: "2025-12-31",
      agency: "국토교통부",
      conditions: "만 19~34세, 월소득 250만원 이하",
      isBookmarked: false,
    },
    {
      id: 2,
      title: "국가장학금 Ⅰ유형",
      category: "교육",
      amount: "등록금 지원",
      deadline: "2025-05-30",
      agency: "한국장학재단",
      conditions: "대학(원)생, 소득분위별 차등 지원",
      isBookmarked: true,
    },
    {
      id: 3,
      title: "신혼부부 전세자금 대출",
      category: "주거",
      amount: "최대 2억원",
      deadline: "상시",
      agency: "주택도시기금",
      conditions: "혼인 7년 이내, 부부합산 연소득 7천만원 이하",
      isBookmarked: false,
    },
  ];

  const categories = ["전체", "주거", "교육", "고용", "의료", "육아", "노후"];

  // 메뉴 아이템 - 로그인 상태에 따라 접근 제한
  const menuItems = [
    { id: "home", label: "홈", icon: Home, requiresLogin: false },
    { id: "profile", label: "개인정보 입력", icon: User, requiresLogin: false },
    { id: "chat", label: "AI 상담", icon: MessageCircle, requiresLogin: false },
    { id: "bookmarks", label: "즐겨찾기", icon: Heart, requiresLogin: false },
    { id: "alarms", label: "알림", icon: Bell, requiresLogin: true },
  ];

  // 로그인 필요한 기능 접근 시 체크
  const checkLoginRequired = (tabId) => {
    const menuItem = menuItems.find((item) => item.id === tabId);
    if (menuItem?.requiresLogin && !isLoggedIn) {
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  // 탭 변경 핸들러
  const handleTabChange = (tabId) => {
    if (checkLoginRequired(tabId)) {
      setActiveTab(tabId);
      setSidebarOpen(false);
    }
  };

  // 로그인 핸들러
  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowLoginModal(false);

    // 로그인 시 마감일 임박 복지 알림 생성
    checkDeadlineNotifications();
  };

  // 마감일 확인 및 알림 생성
  const checkDeadlineNotifications = () => {
    const today = new Date();
    const notifications = [];

    sampleWelfares.forEach((welfare) => {
      if (welfare.deadline !== "상시") {
        const deadlineDate = new Date(welfare.deadline);
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // 7일 이내 마감인 경우 알림 생성
        if (diffDays > 0 && diffDays <= 7) {
          notifications.push({
            id: `deadline-${welfare.id}`,
            type: diffDays <= 3 ? "urgent" : "info",
            title: diffDays <= 3 ? "마감 임박" : "마감 안내",
            message: `${welfare.title} 신청 마감이 ${diffDays}일 남았습니다!`,
            date: welfare.deadline,
            welfare: welfare,
          });
        }
      }
    });

    // 즐겨찾기한 복지 중 마감 임박한 것이 있으면 우선 알림
    const bookmarkedDeadlines = notifications.filter((notif) =>
      bookmarkedItems.includes(notif.welfare.id)
    );

    if (bookmarkedDeadlines.length > 0) {
      setNotifications((prev) => [...prev, ...bookmarkedDeadlines]);
    } else if (notifications.length > 0) {
      // 즐겨찾기 없으면 일반 마감 알림
      setNotifications((prev) => [...prev, ...notifications.slice(0, 2)]);
    }
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab("home");
    setNotifications([]); // 알림 초기화
    setUserInfo({
      age: "",
      income: "",
      job: "",
      family: "",
      region: "",
    });
  };

  // 채팅 메시지 전송
   const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const newUserMessage = {
      id: Date.now(),
      type: "user",
      message: chatInput,
    };
    setChatMessages((prev) => [...prev, newUserMessage]);
    setChatInput("");

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: chatInput,
          context: "복지 혜택 상담",
          userInfo: isLoggedIn ? userInfo : null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        let replyText = "";
        // 🔹 백엔드 응답(JSON 정책 리스트) 맞게 처리
        if (data.policies && data.policies.length > 0) {
          replyText = data.policies
            .map((p, i) => `${i + 1}. ${p.title} - ${p.description}`)
            .join("\n\n");
        } else if (data.reply) {
          replyText = data.reply;
        } else {
          replyText = "추천 가능한 정책을 찾지 못했습니다 😅";
        }


        const botResponse = {
          id: Date.now() + 1,
          type: "bot",
          message: replyText,
        };
        setChatMessages((prev) => [...prev, botResponse]);
      } else {
        throw new Error("API 호출 실패");
      }
    } catch (error) {
      const botResponse = {
        id: Date.now() + 1,
        type: "bot",
        message: "죄송합니다. 챗봇 연결에 문제가 생겼어요 😅",
      };
      setChatMessages((prev) => [...prev, botResponse]);
    }
  };
  const handleFindPolicies = async () => {
    try {
      const query = new URLSearchParams({
        age: userInfo.age,
        region: userInfo.region,
        job: userInfo.job,
        income: parseIncome(userInfo.income), // 숫자만
        householdSize: userInfo.family === "child" ? 3 : 1,
        limit: 5,
      });
      const res = await fetch(`${API_URL}/policies?${query.toString()}`);
      const data = await res.json();

      if (data.policies && data.policies.length > 0) {
        alert(
          data.policies
            .map((p, i) => `${i + 1}. ${p.title}\n${p.description}`)
            .join("\n\n")
        );
      } else {
        alert("조건에 맞는 정책을 찾지 못했어요 😅");
      }
    } catch (err) {
      console.error("정책 조회 실패:", err);
      alert("정책 데이터를 불러오는 데 실패했습니다.");
    }
  };


  // 로그인 모달 컴포넌트
  const LoginModal = () =>
    showLoginModal && (
      <>
        <div
          className="sidebar-overlay"
          onClick={() => setShowLoginModal(false)}
        />
        <div className="login-modal">
          <div className="login-modal-content">
            <div className="login-modal-header">
              <h3>로그인이 필요합니다</h3>
              <button
                onClick={() => setShowLoginModal(false)}
                className="close-btn"
              >
                <X size={20} />
              </button>
            </div>
            <div className="login-modal-body">
              <Lock size={48} />
              <p>이 기능을 사용하려면 로그인이 필요합니다.</p>
              <p>로그인하시겠습니까?</p>
            </div>
            <div className="login-modal-actions">
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

  const SidebarItem = ({ item, isActive, onClick }) => {
    const isDisabled = item.requiresLogin && !isLoggedIn;

    return (
      <button
        onClick={() => onClick(item.id)}
        className={`sidebar-item ${isActive ? "active" : ""} ${
          isDisabled ? "disabled" : ""
        }`}
        disabled={isDisabled && !isLoggedIn}
      >
        <item.icon size={20} />
        <span>{item.label}</span>
        {isDisabled && <Lock size={16} className="lock-icon" />}
      </button>
    );
  };

  const WelfareCard = ({ welfare }) => {
    const isBookmarked = bookmarkedItems.includes(welfare.id);

    const handleBookmark = () => {
      toggleBookmark(welfare.id);
    };

    return (
      <div className="welfare-card">
        <div className="welfare-card-header">
          <h3>{welfare.title}</h3>
          <button onClick={handleBookmark} className="star-button">
            <Star
              size={20}
              className={`star ${isBookmarked ? "bookmarked" : ""}`}
            />
          </button>
        </div>

        <div className="welfare-tags">
          <span className="tag category-tag">{welfare.category}</span>
          <span className="tag amount-tag">{welfare.amount}</span>
        </div>

        <p className="welfare-conditions">{welfare.conditions}</p>

        <div className="welfare-meta">
          <span>{welfare.agency}</span>
          <span className="deadline">
            <Calendar size={12} />
            {welfare.deadline}
          </span>
        </div>

        <button className="welfare-button">자세히 보기</button>
      </div>
    );
  };

  const renderHome = () => (
    <div className="home-content">
      {/* 웰컴 배너 */}
      <div className="welcome-banner">
        <h1>안녕하세요!👋</h1>
        <p>오늘도 새로운 복지 혜택을 찾아보세요</p>
        <div className="stats">
          <div className="stat-item">
            <span className="stat-label">신규 혜택</span>
            <span className="stat-value">12개</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">맞춤 추천</span>
            <span className="stat-value">8개</span>
          </div>
        </div>
      </div>

      {/* 로그인 혜택 안내 (비로그인 시에만 표시) */}
      {!isLoggedIn && (
        <div className="login-notice">
          <AlertCircle size={20} />
          <span>
            로그인하시면 마감일 알림, 조건 자동 저장 등 더 많은 기능을 이용할 수
            있습니다!
          </span>
          <button
            onClick={() => setShowLoginModal(true)}
            className="login-notice-btn"
          >
            로그인
          </button>
        </div>
      )}

      {/* 검색바 */}
      <div className="search-container">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          placeholder="궁금한 복지 혜택을 검색해보세요"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* 카테고리 필터 */}
      <div className="categories">
        {categories.map((category) => (
          <button key={category} className="category-btn">
            {category}
          </button>
        ))}
      </div>

      {/* 액션 카드들 */}
      <div className="action-cards">
        <div className="action-card recommendation">
          <div className="action-header">
            <User size={24} />
            <span>맞춤 추천</span>
          </div>
          <p>개인정보를 입력하면 더 정확한 복지 혜택을 추천받을 수 있어요!</p>
          <button
            onClick={() => handleTabChange("profile")}
            className="action-button"
          >
            정보 입력하기 →
          </button>
        </div>

        <div className="action-card consultation">
          <div className="action-header">
            <MessageCircle size={24} />
            <span>AI 상담</span>
          </div>
          <p>궁금한 복지 혜택에 대해 AI 챗봇에게 바로 물어보세요!</p>
          <button
            onClick={() => handleTabChange("chat")}
            className="action-button"
          >
            상담 시작하기 →
          </button>
        </div>
      </div>

      {/* 복지 목록 */}
      <div className="welfare-section">
        <div className="section-header">
          <h2>인기 복지 혜택</h2>
          <button className="view-all">전체보기 →</button>
        </div>
        <div className="welfare-grid">
          {sampleWelfares.map((welfare) => (
            <WelfareCard key={welfare.id} welfare={welfare} />
          ))}
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="profile-content">
      <h2>개인정보 입력</h2>
      <p>정확한 복지 혜택 추천을 위해 기본 정보를 입력해주세요.</p>

      {/* 비로그인 상태 안내 */}
      {!isLoggedIn && (
        <div className="profile-notice">
          <AlertCircle size={16} />
          <span>
            비로그인 상태에서는 입력한 정보가 자동으로 저장되지 않습니다.
            로그인하시면 정보를 안전하게 보관할 수 있어요!
          </span>
        </div>
      )}

      <div className="form-container">
        <div className="form-group">
          <label>나이</label>
          <input
            type="number"
            placeholder="만 나이를 입력하세요"
            value={userInfo.age}
            onChange={(e) => setUserInfo({ ...userInfo, age: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>월 소득</label>
          <select
            value={userInfo.income}
            onChange={(e) =>
              setUserInfo({ ...userInfo, income: e.target.value })
            }
          >
            <option value="">선택하세요</option>
            <option value="0-100">100만원 미만</option>
            <option value="100-200">100~200만원</option>
            <option value="200-300">200~300만원</option>
            <option value="300-500">300~500만원</option>
            <option value="500+">500만원 이상</option>
          </select>
        </div>

        <div className="form-group">
          <label>직업 상태</label>
          <select
            value={userInfo.job}
            onChange={(e) => setUserInfo({ ...userInfo, job: e.target.value })}
          >
            <option value="">선택하세요</option>
            <option value="student">학생</option>
            <option value="employee">직장인</option>
            <option value="unemployed">구직자</option>
            <option value="freelancer">프리랜서</option>
            <option value="business">사업자</option>
            <option value="etc">기타</option>
          </select>
        </div>

        <div className="form-group">
          <label>가족 상황</label>
          <select
            value={userInfo.family}
            onChange={(e) =>
              setUserInfo({ ...userInfo, family: e.target.value })
            }
          >
            <option value="">선택하세요</option>
            <option value="single">1인 가구</option>
            <option value="couple">신혼부부</option>
            <option value="child">자녀 있음</option>
            <option value="senior">부모님 부양</option>
          </select>
        </div>

        <div className="form-group">
          <label>거주 지역</label>
          <input
            type="text"
            placeholder="예: 서울특별시 강남구"
            value={userInfo.region}
            onChange={(e) =>
              setUserInfo({ ...userInfo, region: e.target.value })
            }
          />
        </div>
      </div>

      {/* 🔹 버튼에 API 호출 핸들러 연결 */}
      <button className="submit-button" onClick={handleFindPolicies}>
        맞춤 복지 찾기
      </button>

      {/* 추천 정책 섹션 */}
      <div className="recommendation-policy">
        <h3>🎯 추천 정책</h3>
        <div className="policy-item">
          <h4>나이 기반 추천</h4>
          <p>
            입력하신 나이를 기준으로 청년, 중장년, 노인 대상 복지를 우선
            추천합니다.
          </p>
        </div>
        <div className="policy-item">
          <h4>소득 기반 추천</h4>
          <p>월 소득 수준에 맞는 소득분위별 지원 혜택을 추천합니다.</p>
        </div>
        <div className="policy-item">
          <h4>가족 상황 기반 추천</h4>
          <p>
            1인 가구, 신혼부부, 자녀 유무 등에 따른 맞춤형 복지를 추천합니다.
          </p>
        </div>
        <div className="policy-item">
          <h4>지역별 추천</h4>
          <p>거주 지역의 지방자치단체별 특화 복지 혜택을 추천합니다.</p>
        </div>
      </div>
    </div>
  );


  const renderChat = () => (
    <div className="chat-content">
      <h2>복지 상담 챗봇</h2>

      <div className="chat-container">
        {chatMessages.map((message) => (
          <div key={message.id} className={`chat-message ${message.type}`}>
            {message.message.split("\n").map((line, index) => (
              <div key={index}>{line}</div>
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
          전송
        </button>
      </div>

      <div className="quick-questions">
        <button
          className="quick-btn"
          onClick={() => setChatInput("청년 대상 지원금에 대해 알려주세요")}
        >
          💰 청년 대상 지원금
        </button>
        <button
          className="quick-btn"
          onClick={() => setChatInput("주거 지원 혜택에 대해 알려주세요")}
        >
          🏠 주거 지원 혜택
        </button>
        <button
          className="quick-btn"
          onClick={() => setChatInput("교육비 지원에 대해 알려주세요")}
        >
          📚 교육비 지원
        </button>
        <button
          className="quick-btn"
          onClick={() => setChatInput("육아 지원 제도에 대해 알려주세요")}
        >
          👶 육아 지원 제도
        </button>
      </div>

      <div className="chat-tips">
        <h4>💡 상담 팁</h4>
        <ul>
          <li>구체적인 상황을 말씀해주시면 더 정확한 안내가 가능해요</li>
          <li>나이, 소득, 가족 상황 등을 함께 알려주세요</li>
          <li>궁금한 복지 제도의 신청 방법도 문의할 수 있어요</li>
        </ul>
      </div>
    </div>
  );

  const renderBookmarks = () => {
    const bookmarkedWelfares = sampleWelfares.filter((welfare) =>
      bookmarkedItems.includes(welfare.id)
    );

    return (
      <div className="bookmarks-content">
        <h2>즐겨찾기</h2>

        {!isLoggedIn && (
          <div className="bookmark-notice">
            <AlertCircle size={16} />
            <span>
              현재 브라우저에만 저장됩니다. 로그인하시면 다른 기기에서도
              즐겨찾기를 확인할 수 있어요!
            </span>
          </div>
        )}

        {bookmarkedWelfares.length > 0 ? (
          <div className="welfare-grid">
            {bookmarkedWelfares.map((welfare) => (
              <WelfareCard key={welfare.id} welfare={welfare} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Heart size={48} />
            <p>아직 즐겨찾기한 복지 혜택이 없어요.</p>
            <p>관심있는 복지 혜택을 즐겨찾기해보세요!</p>
          </div>
        )}
      </div>
    );
  };

  const renderAlarms = () => {
    // 기본 알림 + 동적 생성된 알림
    const defaultAlarms = [
      {
        id: "welcome",
        type: "success",
        title: "환영합니다",
        message:
          "복지콕에 로그인해주셔서 감사합니다. 이제 마감일 알림을 받을 수 있어요!",
        date: "방금 전",
      },
      {
        id: "info-update",
        type: "info",
        title: "새로운 혜택",
        message: "회원님께 추천하는 새로운 복지 혜택이 있어요!",
        date: "청년 취업 장려금",
      },
    ];

    const allAlarms = [...notifications, ...defaultAlarms];

    return (
      <div className="alarms-content">
        <div className="alarms-header">
          <h2>알림</h2>
          {isLoggedIn && notifications.length > 0 && (
            <span className="notification-count">
              {notifications.length}개의 새 알림
            </span>
          )}
        </div>

        {!isLoggedIn ? (
          <div className="alarm-login-required">
            <Bell size={48} />
            <h3>로그인이 필요합니다</h3>
            <p>알림 기능을 사용하려면 로그인해주세요.</p>
            <p>로그인하시면 복지 마감일 알림을 받을 수 있어요!</p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="alarm-login-btn"
            >
              로그인하기
            </button>
          </div>
        ) : (
          <div className="alarms-list">
            {allAlarms.length > 0 ? (
              allAlarms.map((alarm) => (
                <div key={alarm.id} className={`alarm-item ${alarm.type}`}>
                  <div className="alarm-header">
                    <Bell size={20} />
                    <span>{alarm.title}</span>
                  </div>
                  <p>{alarm.message}</p>
                  <span className="alarm-date">{alarm.date}</span>
                </div>
              ))
            ) : (
              <div className="empty-alarms">
                <Bell size={48} />
                <p>새로운 알림이 없습니다.</p>
                <p>복지 혜택을 즐겨찾기하시면 마감일 알림을 받을 수 있어요!</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return renderHome();
      case "profile":
        return renderProfile();
      case "chat":
        return renderChat();
      case "bookmarks":
        return renderBookmarks();
      case "alarms":
        return renderAlarms();
      default:
        return renderHome();
    }
  };

  return (
    <div className="app">
      {/* 로그인 모달 */}
      <LoginModal />

      {/* 사이드바 오버레이 */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo">복</div>
            <h1>복지콕</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="close-btn">
            <X size={20} />
          </button>
          <p className="tagline">받을 수 있는 복지를 콕!</p>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              isActive={activeTab === item.id}
              onClick={handleTabChange}
            />
          ))}
        </nav>

        <div className="sidebar-footer">
          {/* 로그인/로그아웃 버튼 */}
          <div className="auth-section">
            {isLoggedIn ? (
              <button onClick={handleLogout} className="auth-button logout">
                <LogOut size={16} />
                로그아웃
              </button>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="auth-button login"
              >
                <LogIn size={16} />
                로그인
              </button>
            )}
          </div>

          <div className="help-box">
            <p>💡 도움이 필요하세요?</p>
            <p>AI 상담을 통해 맞춤 복지를 찾아보세요!</p>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="main-content">
        {/* 모바일 헤더 */}
        <header className="mobile-header">
          <button onClick={() => setSidebarOpen(true)} className="menu-btn">
            <Menu size={24} />
          </button>
          <div className="mobile-logo">
            <div className="logo-small">복</div>
            <h1>복지콕</h1>
          </div>
          <div className="mobile-auth">
            {isLoggedIn ? (
              <button onClick={handleLogout} className="mobile-auth-btn">
                <LogOut size={16} />
              </button>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="mobile-auth-btn"
              >
                <LogIn size={16} />
              </button>
            )}
          </div>
        </header>

        {/* 데스크톱 헤더 */}
        <header className="desktop-header">
          <h2>
            {menuItems.find((item) => item.id === activeTab)?.label || "홈"}
          </h2>
          <div className="header-actions">
            <button
              className="notification-btn"
              onClick={() => handleTabChange("alarms")}
              disabled={!isLoggedIn}
            >
              <Bell size={20} />
              {isLoggedIn && notifications.length > 0 && (
                <span className="notification-dot">{notifications.length}</span>
              )}
            </button>
            <div className="profile-avatar"></div>
            {isLoggedIn ? (
              <button onClick={handleLogout} className="auth-button logout">
                <LogOut size={16} />
                로그아웃
              </button>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="auth-button login"
              >
                <LogIn size={16} />
                로그인
              </button>
            )}
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="content">{renderContent()}</main>
      </div>
    </div>
  );
};

export default WelfareApp;
