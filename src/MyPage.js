import React, { useState, useEffect } from "react";
import ChatSection from "./components/ChatSection";
import PolicyList from "./components/PolicyList";
import FavoriteList from "./components/FavoriteList";

const MyPage = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const toggleFavorite = (policy) => {
    let updatedFavorites;
    const exists = favorites.find((item) => item.id === policy.id);

    if (exists) {
      updatedFavorites = favorites.filter((item) => item.id !== policy.id);
    } else {
      updatedFavorites = [...favorites, policy];
    }

    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  return (
    <div className="mypage">
      <ChatSection />
      <PolicyList onToggleFavorite={toggleFavorite} favorites={favorites} />
      <FavoriteList favorites={favorites} onToggleFavorite={toggleFavorite} />
    </div>
  );
};

export default MyPage;
