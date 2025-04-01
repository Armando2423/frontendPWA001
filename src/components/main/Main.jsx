import React, { useState, useEffect } from "react";
import "./Main.css";
import keys from "../../../keys.json"; // Asegúrate de que contiene la clave pública

// Images 
import Snake4 from "../../imgs/snake4.jpg";
import Snake2 from "../../imgs/snake2.jpg";
import Snake1 from "../../imgs/snake1.jpg";

const Main = () => {
    const [currentImage, setCurrentImage] = useState(0);
    const images = [Snake4, Snake2, Snake1];

    useEffect(() => {
        const askNotificationPermission = async () => {
            if (!('Notification' in window) || !('serviceWorker' in navigator)) {
                console.log("❌ Notificaciones o Service Workers no soportados en este navegador");
                return;
            }

            if (Notification.permission === "default") {
                const permission = await Notification.requestPermission();
                if (permission === "granted") {
                    subscribeToPushNotifications();
                }
            } else if (Notification.permission === "granted") {
                subscribeToPushNotifications();
            }
        };

        const subscribeToPushNotifications = async () => {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log("✅ Service Worker registrado en Main");

                if (!('pushManager' in registration)) {
                    console.error("❌ pushManager no soportado en este navegador");
                    return;
                }

                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: keys.public_key
                });

                console.log("📩 Suscripción a notificaciones:", subscription);

                await fetch('https://backendpwa001.onrender.com/save-subscription', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(subscription)
                });

                console.log("📩 Suscripción enviada al backend");

            } catch (error) {
                console.error("❌ Error al suscribirse a notificaciones:", error);
            }
        };

        askNotificationPermission();
    }, []);

    const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
    const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

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
