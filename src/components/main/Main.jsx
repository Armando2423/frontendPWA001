import React, { useState } from "react";
import './Main.css';
import keys from "../../../keys.json";
// images 
import Snake4 from "../../imgs/snake4.jpg";
import Snake2 from "../../imgs/snake2.jpg";
import Snake1 from "../../imgs/snake1.jpg";

const Main = () => {
    const [currentImage, setCurrentImage] = useState(0);

    const images = [Snake4, Snake2, Snake1];

    const nextImage = () => {
        setCurrentImage((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="carousel-container">
            <h1>Serpientes</h1>
            <div className="carousel">
                <span className="span prev" onClick={prevImage}>{"<"}</span>
                <img src={images[currentImage]} alt="Snake" className="carousel-image" />
                <span className="next" onClick={nextImage}>{">"}</span>
            </div>
        </div>
    );
};

export default Main;
