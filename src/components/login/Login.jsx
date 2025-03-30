import React, { useState } from 'react';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ onLoginSuccess }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('https://backendpwa001.onrender.com/login', { email, password });

            if (response.data.rol) {
                alert('Haz iniciado sesión, exitosamente',);
                localStorage.setItem("isAuthenticated", "true");
                onLoginSuccess(); // ✅ Actualiza `isAuthenticated` en App.js
                navigate(response.data.rol.toLowerCase() === "admin" ? '/users' : '/main');
            }
        } catch (err) {
            alert('ERROR, Vuelve a iniciar sesión');
            setError(err.response?.data?.message || 'Error al iniciar sesión');
        }
    };

    return (
        <div className="wrapper">
            <form onSubmit={handleSubmit}>
                <h1>Iniciar sesión</h1>
                {error && <p className="error-message">{error}</p>}
                <div className="input-box">
                    <input
                        type='email'
                        placeholder='Correo'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <FaEnvelope className='icon' />
                </div>
                <div className="input-box">
                    <input
                        type='password'
                        placeholder='Contraseña'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <FaLock className='icon' />
                </div>

                <button type='submit'>Inicia sesión</button>

                <div className="register-link">
                    <p>¿No tienes cuenta? <span onClick={() => navigate('/signup')} className='a'>Regístrate</span></p>
                </div>
            </form>
        </div>
    );
};


export default Login;