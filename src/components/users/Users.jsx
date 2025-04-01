import React, { useState, useEffect } from "react";
import "./Users.css";
/* import sw from "../../../public/sw" */
/* import sw from "../../../sw";
 */
const Users = () => {
    const [users, setUsers] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
            .then(registro => {
                console.log("✅ Service Worker registrado");
        
                if (Notification.permission === 'default') {
                    Notification.requestPermission().then(async permission => {
                        if (permission === 'granted') {
                            const subscription = await registro.pushManager.subscribe({
                                userVisibleOnly: true,
                                applicationServerKey: keys.public_key
                            });
        
                            // Obtener el correo del usuario desde el almacenamiento local
                            const userEmail = localStorage.getItem('userEmail');
        
                            if (userEmail) {
                                // Guardar suscripción en el servidor
                                await fetch('https://backendpwa001.onrender.com/save-subscription', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ email: userEmail, subscription })
                                });
        
                                console.log('📩 Suscripción guardada con usuario:', userEmail);
                            }
                        }
                    });
                }
            })
            .catch(error => console.error("❌ Error al registrar el Service Worker:", error));
        }
        
    }, []);
    

    // 🚀 Obtener usuarios desde la API
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("https://backendpwa001.onrender.com/users");
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error("❌ Error al obtener usuarios:", error);
            }
        };

        fetchUsers();
    }, []);

    const handleOpenModal = (user) => {
        setSelectedUser(user);
        setModalOpen(true);
    };

    const handleSendNotification = async () => {
        try {
            const response = await fetch('https://backendpwa001.onrender.com/send-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: selectedUser.email, // Enviar email en la solicitud
                    title: `Hola, ${selectedUser.name}!`,
                    body: `Gracias por usar nuestra aplicación!`
                })
            });
    
            const data = await response.json();
            console.log(data.message);
        } catch (error) {
            console.error("❌ Error al enviar notificación:", error);
        }
    
        setModalOpen(false);
    };
    
    

    return (
        <div className="container">
            <h1>Usuarios</h1>
            <table className="users-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Apellido Paterno</th>
                        <th>Apellido Materno</th>
                        <th>Correo</th>
                        <th>Enviar Notificación</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.email}>
                            <td>{user.name}</td>
                            <td>{user.app}</td>
                            <td>{user.apm}</td>
                            <td>{user.email}</td>
                            <td>
                                <button onClick={() => handleOpenModal(user)}>Notificar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {modalOpen && selectedUser && (
                <div className="modal">
                    <div className="modal-content">
                        <p>¿Quieres enviar una notificación a: <span>{selectedUser.email}</span>?</p>
                        <div className="modal-buttons">
                            <button className="btnN" onClick={handleSendNotification}>Sí</button>
                            <button className="btnN" onClick={() => setModalOpen(false)}>No</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;