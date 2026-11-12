// LEDGER 앱버전 서비스 워커 — 판 1.0.0+b15cf752
// 앱 화면 파일을 휴대폰에 저장해 두고, 인터넷이 되면 늘 새 파일을 먼저 받는다(새 판이 바로 반영되게).
// 가계부 자료(구글 서버 요청)는 건드리지 않는다 — 자료는 늘 대표자 드라이브에서.
const CACHE = 'ledger-app-1.0.0+b15cf752';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('ledger-app-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return; // 구글 서버 요청은 그대로 통과
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('index.html')))
  );
});
