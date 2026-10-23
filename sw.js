// Service worker de JARVIS : permet l'installation et le fonctionnement hors-ligne.
const CACHE = 'jarvis-v3';
const FICHIERS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FICHIERS)));
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((noms) => Promise.all(noms.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
    );
    self.clients.claim();
});

// Réseau d'abord (les mises à jour arrivent tout de suite), cache si pas de connexion
self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;
    // On ne touche pas aux requêtes vers d'autres sites (météo, etc.)
    if (new URL(e.request.url).origin !== self.location.origin) return;
    e.respondWith(
        fetch(e.request)
            .then((r) => {
                if (r && r.status === 200 && r.type === 'basic') {
                    const copie = r.clone();
                    caches.open(CACHE).then((c) => c.put(e.request, copie));
                }
                return r;
            })
            .catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html')))
    );
});
