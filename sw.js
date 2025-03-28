
function insertIndexedDB(data) {
    let request = indexedDB.open("database", 2);

    request.onupgradeneeded = event => {
        let db = event.target.result;
        if (!db.objectStoreNames.contains("offlineDB")) {
            db.createObjectStore("offlineDB", { autoIncrement: true });
        }
    };

    request.onsuccess = event => {
        let db = event.target.result;
        let transaction = db.transaction("offlineDB", "readwrite");
        let store = transaction.objectStore("offlineDB");

        store.add(data);
        console.log("usuario rgistrado Indexed, no hay conxión", data);
    };
}

console.log("asfas");
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('appShell').then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/src/fallBack.html',
                "/src/index.css",
                "/src/App.css",
                '/src/assets/react.svg',
                "/src/App.jsx",
                "/src/main.jsx",
                '/src/components/login/Login.jsx',
                '/src/components/signup/Signup.jsx',
                '/src/components/splashScreen/SplashScreen.jsx',
                '/src/components/users/Users.jsx',
                '/src/components/main/Main.jsx'
            ]);
        })
    );
    self.skipWaiting();
});

self.addEventListener('fetch', event => {
    if (event.request.method === "POST" && event.request.url.includes("/register")) {
        event.respondWith(
            event.request.clone().text().then(body => {  // Clonar primero
                try {
                    let data = JSON.parse(body);
                    insertIndexedDB(data);
                    self.registration.sync.register("syncUsers");
                } catch (e) {
                    console.error("Error al analizar JSON:", e);
                }

                return fetch(event.request).catch(() => {
                    return new Response(JSON.stringify({ 
                        message: "No hay conexión. Los datos se guardaron localmente y se enviarán cuando haya conexión." 
                    }), {
                        headers: { "Content-Type": "application/json" }
                    });
                });
            })
        );
    }
});


self.addEventListener('sync', event => {
    if (event.tag === "syncUsers") {
        console.log("Intentando registrar usuarios en mongoDB");

        event.waitUntil(
            new Promise((resolve, reject) => {
                let request = indexedDB.open("database", 2);
                request.onsuccess = event => {
                    let db = event.target.result;
                    let transaction = db.transaction("offlineDB", "readwrite");
                    let store = transaction.objectStore("offlineDB");

                    let getAllRequest = store.getAll();
                    getAllRequest.onsuccess = () => {
                        let users = getAllRequest.result;
                        if (users.length === 0) {
                            console.log("No hay usuarios pendientes de registro.");
                            return resolve();
                        }

                        let syncPromises = users.map(user =>
                            fetch("http://192.168.100.16:3008/register", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(user)
                            })
                        );

                        Promise.all(syncPromises)
                            .then(() => {
                                let clearTransaction = db.transaction("offlineDB", "readwrite");
                                let clearStore = clearTransaction.objectStore("offlineDB");
                                clearStore.clear();
                                console.log("Usuarios de indexed registrados en mongo y eliminados de Indexed.");
                                resolve();
                            })
                            .catch(reject);
                    };
                };
            })
        );
    }
});


self.addEventListener('message', (event) => {
    if (event.data.action === 'sendNotification') {
        const { title, body } = event.data;
        const options = {
            body: body,
            icon: "/src/imgs/fire.png",
            image: "/src/imgs/fire.png",
            vibrate: [200, 100, 200]
        };
        
        self.registration.showNotification(title, options);
    }
});


// Manejo de clic en notificaciones
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});
