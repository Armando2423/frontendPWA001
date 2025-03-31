const CACHE_NAME = "appShell-v5";
const OFFLINE_URL = "/index.html";



self.addEventListener("install", (event) => {
    console.log("Service Worker instalando...");
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Cargando archivos en caché...");
            return cache.addAll([
/*                 "/",
                "/index.html",
                "/manifest.json",
                "/src/index.css",
                "/src/App.jsx",
                "/src/App.css",
                "/src/main.jsx",
                "/fire.png",
                "/src/assets/react.svg",
                "/src/components/login/Login.jsx",
                "/src/components/login/Login.css",
                "/src/components/main/Main.jsx",
                "/src/components/main/Main.css",
                "/src/components/signup/Signup.jsx",
                "/src/components/signup/Signup.css",
                "/src/components/splashScreen/SplashScreen.jsx",
                "/src/components/splashScreen/SplashScreen.css",
                "/src/components/users/Users.jsx",
                "/src/components/users/Users.css" */

                "/",
                "/index.html",
                "/manifest.json",
                "/fire.png",
                "/assets/react.svg",
            ]);
        }).catch(err => console.error("Error al cargar archivos en caché:", err))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    console.log("Service Worker activado.");
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log("Borrando caché antigua:", cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                console.log("Sirviendo desde caché:", event.request.url);
                return cachedResponse;
            }

            return fetch(event.request)
                .then((response) => {
                    if (!response || response.status !== 200 || response.type !== "basic") {
                        return response;
                    }

                    let responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });

                    return response;
                })
                .catch(() => {
                    console.warn("No hay conexión, sirviendo página offline.");
                    return caches.match(OFFLINE_URL);
                });
        })
    );
});

// Sincronización con IndexedDB
function insertIndexedDB(data) {
    let request = indexedDB.open("database", 2);

    request.onupgradeneeded = (event) => {
        let db = event.target.result;
        if (!db.objectStoreNames.contains("offlineDB")) {
            db.createObjectStore("offlineDB", { autoIncrement: true });
        }
    };

    request.onsuccess = (event) => {
        let db = event.target.result;
        let transaction = db.transaction("offlineDB", "readwrite");
        let store = transaction.objectStore("offlineDB");

        store.add(data);
        console.log("Usuario registrado en IndexedDB, sin conexión:", data);
    };
}

self.addEventListener("fetch", (event) => {
    if (event.request.method === "POST" && event.request.url.includes("/register")) {
        event.respondWith(
            event.request.clone().text().then((body) => {
                try {
                    let data = JSON.parse(body);
                    insertIndexedDB(data);
                    self.registration.sync.register("syncUsers");
                } catch (e) {
                    console.error("Error al parsear JSON:", e);
                }

                return fetch(event.request).catch(() => {
                    return new Response(JSON.stringify({
                        message: "No hay conexión. Los datos se guardaron y se enviarán al restaurar conexión."
                    }), {
                        headers: { "Content-Type": "application/json" }
                    });
                });
            })
        );
    }
});

self.addEventListener("sync", (event) => {
    if (event.tag === "syncUsers") {
        console.log("Intentando sincronizar usuarios con MongoDB...");
        event.waitUntil(
            new Promise((resolve, reject) => {
                let request = indexedDB.open("database", 2);
                request.onsuccess = (event) => {
                    let db = event.target.result;
                    let transaction = db.transaction("offlineDB", "readwrite");
                    let store = transaction.objectStore("offlineDB");

                    let getAllRequest = store.getAll();
                    getAllRequest.onsuccess = () => {
                        let users = getAllRequest.result;
                        if (users.length === 0) {
                            console.log("No hay usuarios pendientes de sincronizar.");
                            return resolve();
                        }

                        let syncPromises = users.map((user) =>
                            fetch("https://backendpwa001.onrender.com/register", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(user),
                            })
                        );

                        Promise.all(syncPromises)
                            .then(() => {
                                let clearTransaction = db.transaction("offlineDB", "readwrite");
                                let clearStore = clearTransaction.objectStore("offlineDB");
                                clearStore.clear();
                                console.log("Usuarios sincronizados con MongoDB y eliminados de IndexedDB.");
                                resolve();
                            })
                            .catch(reject);
                    };
                };
            })
        );
    }
});

// Notificaciones push
self.addEventListener("push", (event) => {
    if (event.data) {
        const { title, body } = event.data.json();
        const options = {
            body,
            icon: "/src/imgs/fire.png",
            image: "/src/imgs/fire.png",
            vibrate: [200, 100, 200],
        };

        self.registration.showNotification(title, options);
    }
});


// Manejo de clic en notificaciones
self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(clients.openWindow("/"));
});
