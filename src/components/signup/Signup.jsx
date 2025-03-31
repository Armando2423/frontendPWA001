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
        password: ''
    });

    useEffect(() => {
        window.addEventListener('online', sendOfflineData);
        return () => {
            window.removeEventListener('online', sendOfflineData);
        };
    }, []);

    const openDatabase = () => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("database", 3);

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
            const request = store.add(data);

            request.onsuccess = () => console.log("Datos guardados en IndexedDB:", data);
            request.onerror = (event) => console.error("Error al guardar en IndexedDB:", event.target.error);

            setError("No hay conexión. Datos guardados y serán enviados cuando haya internet.");
        } catch (error) {
            console.error("Error al guardar en IndexedDB:", error);
        }
    };

    const sendOfflineData = async () => {
        const db = await openDatabase();
        if (!db.objectStoreNames.contains("offlineDB")) return;

        const transaction = db.transaction("offlineDB", "readonly");
        const store = transaction.objectStore("offlineDB");
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = async () => {
            const offlineData = getAllRequest.result;
            if (offlineData.length === 0) return;

            let allSynced = true;
            for (const data of offlineData) {
                try {
                    await axios.post('https://backendpwa001.onrender.com/register', data);
                    console.log("Datos sincronizados:", data);
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
                alert("Los datos guardados sin conexión se han sincronizado exitosamente.");
            }
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name || !formData.app || !formData.apm || !formData.email || !formData.password) {
            setError('Todos los campos son obligatorios');
            return;
        }

        if (navigator.onLine) {
            try {
                const response = await axios.post('https://backendpwa001.onrender.com/register', formData);
                console.log('Respuesta del servidor:', response.data);
                alert('Registro exitoso');
                navigate('/');
            } catch (error) {
                console.error('Error en el registro:', error.response?.data || error);
                setError(error.response?.data?.message || 'Error en el registro. Intenta nuevamente.');
            }
        } else {
            saveOfflineData(formData);
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
                    <input type="text" placeholder="Nombre" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    <FaUser className="icon" />
                </div>
                <div className="input-box">
                    <input type="text" placeholder="Apellido Paterno" value={formData.app} onChange={(e) => setFormData({ ...formData, app: e.target.value })} required />
                    <FaUser className="icon" />
                </div>
                <div className="input-box">
                    <input type="text" placeholder="Apellido Materno" value={formData.apm} onChange={(e) => setFormData({ ...formData, apm: e.target.value })} required />
                    <FaUser className="icon" />
                </div>
                <div className="input-box">
                    <input type="email" placeholder="Correo" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    <FaEnvelope className="icon" />
                </div>
                <div className="input-box">
                    <input type="password" placeholder="Contraseña" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                    <FaLock className="icon" />
                </div>
                <button type="submit">Registrarse</button>
            </form>
        </div>
    );
};

export default SignUp;
