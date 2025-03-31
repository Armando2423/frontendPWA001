import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaLock, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        app: '',
        apm: '',
        email: '',
        password: ''
    });

    const [error, setError] = useState('');  // Estado para errores

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Guardar datos en IndexedDB cuando no hay conexión
    const saveOfflineData = (data) => {
        const request = indexedDB.open("database", 2);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("offlineDB")) {
                db.createObjectStore("offlineDB", { autoIncrement: true });
            }
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction("offlineDB", "readwrite");
            const store = transaction.objectStore("offlineDB");

            store.add(data);
            console.log("Datos guardados en IndexedDB:", data);
        };

        request.onerror = (event) => {
            console.error("Error al guardar en IndexedDB:", event.target.error);
        };
    };

    // Enviar datos guardados en IndexedDB cuando haya conexión
    const sendOfflineData = async () => {
    const request = indexedDB.open("database", 2);

    request.onsuccess = async (event) => {
        const db = event.target.result;
        const transaction = db.transaction("offlineDB", "readonly");
        const store = transaction.objectStore("offlineDB");
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = async () => {
            const offlineData = getAllRequest.result;

            if (offlineData.length === 0) return;

            for (const data of offlineData) {
                try {
                    const response = await axios.post('https://backendpwa001.onrender.com/register', data);
                    console.log("Datos sincronizados:", response.data);

                    // Limpiar IndexedDB después de sincronizar
                    const deleteTransaction = db.transaction("offlineDB", "readwrite");
                    const deleteStore = deleteTransaction.objectStore("offlineDB");
                    deleteStore.clear();
                    console.log("Datos eliminados de IndexedDB después de sincronizar.");

                    // **Muestra una alerta**
                    alert("Los datos guardados sin conexión se han sincronizado exitosamente.");

                    // **Limpia el formulario**
                    setFormData({
                        name: '',
                        app: '',
                        apm: '',
                        email: '',
                        password: ''
                    });
                } catch (error) {
                    console.error("Error al sincronizar:", error);
                }
            }
        };
    };
};


    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name || !formData.app || !formData.apm || !formData.email || !formData.password) {
            setError('Todos los campos son obligatorios');
            return;
        }

        if (navigator.onLine) {
            try {
                const response = await axios.post('https://backendpwa001.onrender.com/register', {
                    name: formData.name,
                    app: formData.app,
                    apm: formData.apm,
                    email: formData.email,
                    pwd: formData.password
                });

                console.log('Respuesta del servidor:', response.data);
                alert('Registro exitoso');
                navigate('/');
            } catch (error) {
                console.log('Error en el registro:', error.response ? error.response.data : error);
                setError(error.response?.data?.message || 'Error en el registro. Intenta nuevamente.');
            }
        } else {
            saveOfflineData(formData);
            setError("No hay conexión. Los datos se guardaron y se enviarán cuando haya conexión.");
        }
    };

    useEffect(() => {
        window.addEventListener('online', sendOfflineData);
        return () => {
            window.removeEventListener('online', sendOfflineData);
        };
    }, []);

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
                    <input
                        type="text"
                        name="name"
                        placeholder="Nombre"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <FaUser className="icon" />
                </div>

                <div className="input-box">
                    <input
                        type="text"
                        name="app"
                        placeholder="Apellido Paterno"
                        value={formData.app}
                        onChange={handleChange}
                        required
                    />
                    <FaUser className="icon" />
                </div>

                <div className="input-box">
                    <input
                        type="text"
                        name="apm"
                        placeholder="Apellido Materno"
                        value={formData.apm}
                        onChange={handleChange}
                        required
                    />
                    <FaUser className="icon" />
                </div>

                <div className="input-box">
                    <input
                        type="email"
                        name="email"
                        placeholder="Correo"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <FaEnvelope className="icon" />
                </div>

                <div className="input-box">
                    <input
                        type="password"
                        name="password"
                        placeholder="Contraseña"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <FaLock className="icon" />
                </div>

                <button type="submit">Registrarse</button>
            </form>
        </div>
    );
};

export default SignUp;
