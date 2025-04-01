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
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log("✅ Service Worker registrado en Main");

                    // Verificar permisos de notificación
                    if (Notification.permission === 'default') {
                        Notification.requestPermission().then(permission => {
                            if (permission === 'granted') {
                                subscribeToPushNotifications(registration);
                            } else {
                                console.warn("🚫 Notificaciones denegadas por el usuario");
                                alert("Has rechazado las notificaciones. Puedes activarlas desde la configuración del navegador.");
                            }
                        });
                    } else if (Notification.permission === 'granted') {
                        subscribeToPushNotifications(registration);
                    }
                })
                .catch(error => console.error("❌ Error al registrar el Service Worker:", error));
        }
    }, []);

    const subscribeToPushNotifications = async (registration) => {
        try {
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: keys.public_key
            });

            console.log("📩 Suscripción a notificaciones:", subscription);

            // Guardar suscripción en el servidor
            const response = await fetch('https://backendpwa001.onrender.com/save-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscription)
            });

            const data = await response.json();
            console.log("📩 Suscripción guardada:", data);
        } catch (error) {
            console.error("❌ Error al suscribirse a notificaciones:", error);
        }
    };

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
