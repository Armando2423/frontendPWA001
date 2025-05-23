import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaLock, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';

const SignUp = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        app: '',
        apm: '',
        email: '',
        pwd: '',
        subscription: null
    });

    useEffect(() => {
        window.addEventListener('online', sendOfflineData);
        return () => {
            window.removeEventListener('online', sendOfflineData);
        };
    }, []);

    const openDatabase = async () => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("database");

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains("offlineDB")) {
                    db.createObjectStore("offlineDB", { autoIncrement: true });
                }
            };

            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target.error);
        });
    };

    const saveOfflineData = async (data) => {
        try {
            const db = await openDatabase();
            const transaction = db.transaction("offlineDB", "readwrite");
            const store = transaction.objectStore("offlineDB");
            store.add(data);

            console.log("Datos guardados en IndexedDB:", data);
            setError("No hay conexión. Datos guardados y serán enviados cuando haya internet.");
            setFormData({ name: '', app: '', apm: '', email: '', pwd: '' });
        } catch (error) {
            console.error("Error al guardar en IndexedDB:", error);
        }
    };

    const sendOfflineData = async () => {
        const db = await openDatabase();
        if (!db.objectStoreNames.contains("offlineDB")) {
            console.error("No existe el objectStore offlineDB");
            return;
        }

        const transaction = db.transaction("offlineDB", "readonly");
        const store = transaction.objectStore("offlineDB");
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = async () => {
            const offlineData = getAllRequest.result;
            console.log("Datos guardados en IndexedDB:", offlineData);
            if (offlineData.length === 0) return;

            let allSynced = true;
            for (const data of offlineData) {
                try {
                    console.log("Enviando datos sincronizados:", data);
                    const response = await axios.post('https://backendpwa001.onrender.com/register', data);
                    console.log("Datos sincronizados:", response.data);
                } catch (error) {
                    console.error("Error al sincronizar:", error);
                    allSynced = false;
                }
            }

            if (allSynced) {
                const deleteTransaction = db.transaction("offlineDB", "readwrite");
                const deleteStore = deleteTransaction.objectStore("offlineDB");
                deleteStore.clear();
                console.log("Datos eliminados de IndexedDB después de sincronizar.");
                alert("La conexión ha vuelto. Los datos han sido registrados correctamente.");
            } else {
                alert("Algunos datos no pudieron sincronizarse. Se intentará nuevamente.");
                setTimeout(sendOfflineData, 2000); // Reintentar después de 5s
            }
        };
      
    };

    const getSubscription = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.error("Las notificaciones no están soportadas en este navegador.");
            return null;
        }
    
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.REACT_APP_PUBLIC_VAPID_KEY
        });
    
        return subscription;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
    
        if (!formData.name || !formData.app || !formData.apm || !formData.email || !formData.pwd) {
            setError('Todos los campos son obligatorios');
            return;
        }
    
        // Obtener suscripción de notificaciones
        const subscription = await getSubscription();
        if (subscription) {
            // Agregar la suscripción al formData
            setFormData((prevFormData) => ({
                ...prevFormData,
                subscription: {
                    endpoint: subscription.endpoint,
                    expirationTime: subscription.expirationTime,
                    keys: {
                        p256dh: subscription.getKey('p256dh'),
                        auth: subscription.getKey('auth')
                    }
                }
            }));
        }
    
        // Luego, realiza la solicitud si hay conexión
        if (navigator.onLine) {
            try {
                const response = await axios.post('https://backendpwa001.onrender.com/register', formData);
                console.log('Respuesta del servidor:', response.data);
                alert('Registro exitoso');
                setFormData({ name: '', app: '', apm: '', email: '', pwd: '', subscription: null });
                navigate('/');
            } catch (error) {
                console.log('Error en el registro:', error.response ? error.response.data : error);
                setError(error.response?.data?.message || 'Error en el registro. Intenta nuevamente.');
            }
        } else {
            await saveOfflineData(formData);
        }
    };
    

    return (
        <div className="wrapper">
            <div className="back-arrow" onClick={() => navigate(-1)}>
                <div className="circle">
                    <FaArrowLeft className="icon_back" />
                </div>
            </div>

            <h1>Registro</h1>
            <div className="line" />

            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleSubmit}>
                <div className="input-box">
                    <input type="text" name="name" placeholder="Nombre" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    <FaUser className="icon" />
                </div>

                <div className="input-box">
                    <input type="text" name="app" placeholder="Apellido Paterno" value={formData.app} onChange={(e) => setFormData({ ...formData, app: e.target.value })} required />
                    <FaUser className="icon" />
                </div>

                <div className="input-box">
                    <input type="text" name="apm" placeholder="Apellido Materno" value={formData.apm} onChange={(e) => setFormData({ ...formData, apm: e.target.value })} required />
                    <FaUser className="icon" />
                </div>

                <div className="input-box">
                    <input type="email" name="email" placeholder="Correo" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    <FaEnvelope className="icon" />
                </div>

                <div className="input-box">
                    <input type="password" name="pwd" placeholder="Contraseña" value={formData.pwd} onChange={(e) => setFormData({ ...formData, pwd: e.target.value })} required />
                    <FaLock className="icon" />
                </div>

                <button type="submit">Registrarse</button>
            </form>
        </div>
    );
};

export default SignUp;
