import React, { useState, useEffect } from "react";
import "./Users.css";
import keys from  "../../../keys.json";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(async registro => {
                    console.log("✅ Service Worker registrado");
        
                    if (Notification.permission === 'default') {
                        const permission = await Notification.requestPermission();
                        if (permission === 'granted') {
                            const subscription = await registro.pushManager.subscribe({
                                userVisibleOnly: true,
                                applicationServerKey: keys.publicKey
                            });
        
                            const userEmail = localStorage.getItem("userEmail"); 
                            if (userEmail) {
                                await fetch('https://backendpwa001.onrender.com/save-subscription', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ email: userEmail, subscription })
                                });
                            }
                        }
                    }
                })
                .catch(error => console.error("❌ Error al registrar el Service Worker:", error));
        }        
    }, []);
    
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
            const response = await fetch('https://backendpwa001.onrender.com/save_subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: selectedUser.email,
                    title: `BIENVENIDO, ${selectedUser.name}!`,
                    body: `Gracias por usar mi PWA!`
                })
            });
    
            const data = await response.json();
            console.log(data.message);
        } catch (error) {
            console.error("❌ Error al enviar notificación:", error);
        }
    
        setModalOpen(false);
    };

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener("push", (event) => {
                if (event.data) {
                    const { title, body } = event.data.json();
                    const options = {
                        body,
                        icon: "/src/imgs/fire.png",
                        image: "/src/imgs/fire.png",
                        vibrate: [200, 100, 200],
                    };
                    new Notification(title, options);
                }
            });
        }
    }, []);
    
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
