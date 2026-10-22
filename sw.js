// نسخه‌ی کش را با هر تغییر فایل‌ها عوض کنید (مثلاً v2) تا گوشی نسخه‌ی تازه را بگیرد
const CACHE = 'shelta-pricing-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

// ابتدا نسخه‌ی ذخیره‌شده (کار بدون اینترنت)، و هم‌زمان در پس‌زمینه نسخه‌ی تازه گرفته می‌شود
self.addEventListener('fetch', e => {
    const req = e.request;
    if (req.method !== 'GET') return;
    e.respondWith(
        caches.match(req).then(cached => {
            const network = fetch(req).then(res => {
                if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
                return res;
            }).catch(() => cached);
            return cached || network;
        })
    );
});
