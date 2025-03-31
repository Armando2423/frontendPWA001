import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

/* if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js")
        .then(() => console.log("Service Worker registrado con éxito"))
        .catch(err => console.error("Error al registrar el Service Worker:", err));
} else {
    console.warn("Service Worker no es compatible con este navegador.");
} */

navigator.serviceWorker.register('./sw.js', {type: 'module'})
.then((registro) => {
    console.log('Service worker conectando...exitosamente', registro);
})
.catch(error => console.error("Error al conectar el service worker", error));

createRoot(document.getElementById('root')).render(<App />);
