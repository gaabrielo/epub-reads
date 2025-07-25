// Service Worker para servir arquivos EPUB do IndexedDB
// ativa logo após o install
self.addEventListener('install', (ev) => {
  ev.waitUntil(self.skipWaiting());
});

// assume o controle das pages imediatamente
self.addEventListener('activate', (ev) => {
  ev.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Intercepta requests para /epub-local/
  if (url.pathname.startsWith('/epub-local/')) {
    event.respondWith(
      (async () => {
        // O id do livro está na URL: /epub-local/:id
        const id = url.pathname.split('/').pop();
        if (!id) return new Response('ID não fornecido', { status: 400 });
        // Abre o IndexedDB e busca o arquivo
        return new Promise((resolve, reject) => {
          const openReq = indexedDB.open('epub-palette-reader', 1);
          openReq.onupgradeneeded = () => {
            // Garante que o object store 'books' exista
            if (!openReq.result.objectStoreNames.contains('books')) {
              openReq.result.createObjectStore('books', { keyPath: 'id' });
            }
          };
          openReq.onerror = () =>
            resolve(new Response('IndexedDB error', { status: 500 }));
          openReq.onsuccess = () => {
            const db = openReq.result;
            let tx;
            try {
              tx = db.transaction('books', 'readonly');
            } catch (e) {
              resolve(new Response('Object store not found', { status: 500 }));
              return;
            }
            const store = tx.objectStore('books');
            const getReq = store.get(id);
            getReq.onsuccess = () => {
              const book = getReq.result;
              if (!book) {
                resolve(new Response('Livro não encontrado', { status: 404 }));
              } else {
                resolve(new Response(book.file));
              }
            };
            getReq.onerror = () =>
              resolve(new Response('Erro ao buscar livro', { status: 500 }));
          };
        });
      })()
    );
  }
});
