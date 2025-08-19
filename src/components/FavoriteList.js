import React from "react";

const FavoriteList = ({ favorites, onToggleFavorite }) => {
  return (
    <section>
      <h3>⭐ 즐겨찾기한 정책</h3>
      {favorites.length === 0 ? (
        <p>즐겨찾기한 정책이 없습니다.</p>
      ) : (
        favorites.map((policy) => (
          <div className="policy-card" key={policy.id}>
            <div className="header">
              <h4>{policy.title}</h4>
              <button onClick={() => onToggleFavorite(policy)}>★</button>
            </div>
            <p>마감일: {policy.deadline}</p>
            <button>상세보기</button>
          </div>
        ))
      )}
    </section>
  );
};

export default FavoriteList;
