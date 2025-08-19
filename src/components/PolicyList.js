import React from "react";

const dummyPolicies = [
  { id: 1, title: "청년월세 한시 특별지원사업", deadline: "상시" },
  { id: 2, title: "부산 청년 월세 지원", deadline: "2025년 9월" },
];

const PolicyList = ({ onToggleFavorite, favorites }) => {
  return (
    <section>
      <h3>📌 추천 정책</h3>
      {dummyPolicies.map((policy) => {
        const isFav = favorites.some((f) => f.id === policy.id);
        return (
          <div className="policy-card" key={policy.id}>
            <div className="header">
              <h4>{policy.title}</h4>
              <button onClick={() => onToggleFavorite(policy)}>
                {isFav ? "⭐" : "☆"}
              </button>
            </div>
            <p>마감일: {policy.deadline}</p>
            <button>신청하기</button>
          </div>
        );
      })}
    </section>
  );
};

export default PolicyList;
