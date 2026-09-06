/* CSCS 備考 App — service worker
 * 策略：
 *   - 導覽/HTML：network-first 且強制向伺服器驗證，成功就順手更新快取；
 *     離線時回退到快取。這樣「線上一定看到最新版」（不必再強制重整），
 *     「離線也讀得到」。
 *   - 其他靜態檔（圖示、manifest）：cache-first，背景更新。
 * 因為 HTML 走 network-first，改版時不需要手動 bump 版本號。
 */
const CACHE = 'cscs-v2';
const SHELL = ['./', './index.html', './manifest.webmanifest',
               './icons/icon-192.png', './icons/icon-512.png',
               './icons/icon-maskable-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(SHELL.map(u => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  const isDoc = req.mode === 'navigate' ||
                (req.headers.get('accept') || '').includes('text/html');

  if (isDoc) {
    // cache:'no-cache' 會跳過瀏覽器自己的 HTTP 快取、直接向伺服器驗證
    // （GitHub Pages 對 HTML 送 max-age=600，不加這個的話最多可能拿到 10 分鐘前的版本）。
    // 有 ETag，所以未改版時是便宜的 304。
    e.respondWith(
      fetch(req, { cache: 'no-cache' })
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html').then(r => r || caches.match('./')))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req).then(res => {
        if (res && res.ok) caches.open(CACHE).then(c => c.put(req, res.clone()));
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
