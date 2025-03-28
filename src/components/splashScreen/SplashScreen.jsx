import React, { useState, useEffect } from "react";
import logo from "../../imgs/fire.png"; // Ajusta la ruta según tu estructura
import "./SplashScreen.css";

const SplashScreen = () => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setFadeOut(true);
    }, 1500);
  }, []); 

  return (
    <div className={`splash-container ${fadeOut ? "fade-out" : ""}`}>
      <img src={logo} alt="Logo" className="splash-logo" />
      <h1 className="splash-text">WELCOME to my PWA 🚀</h1>
    </div>
  );
};

export default SplashScreen;
