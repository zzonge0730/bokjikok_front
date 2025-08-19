import React from "react";

const ChatSection = () => {
  return (
    <section className="chat-section">
      <h3>🤖 AI 복지 상담</h3>
      <div className="chat-bubble">안녕하세요! 복지혜택 상담을 도와드릴게요 😊</div>
      <input type="text" placeholder="복지 혜택에 대해 질문해보세요..." />
    </section>
  );
};

export default ChatSection;
