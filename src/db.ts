const DB_NAME = 'epub-palette-reader';
const BOOKS_STORE = 'books';
const PREFS_STORE = 'preferences';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 2);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(BOOKS_STORE)) {
        db.createObjectStore(BOOKS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(PREFS_STORE)) {
        db.createObjectStore(PREFS_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export interface StoredBook {
  id: string;
  name: string;
  file: File;
  lastLocation?: string;
}
// Atualiza a posição do livro salvo
export async function updateBookLocation(
  id: string,
  location: string
): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BOOKS_STORE, 'readwrite');
    const store = tx.objectStore(BOOKS_STORE);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const book = getReq.result as StoredBook;
      if (book) {
        book.lastLocation = location;
        store.put(book);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      } else {
        resolve(); // Não faz nada se não encontrar
      }
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function addBook(file: File): Promise<string> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BOOKS_STORE, 'readwrite');
    const store = tx.objectStore(BOOKS_STORE);
    const id = crypto.randomUUID();
    store.add({ id, name: file.name, file } as StoredBook);
    tx.oncomplete = () => resolve(id);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllBooks(): Promise<StoredBook[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BOOKS_STORE, 'readonly');
    const store = tx.objectStore(BOOKS_STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as StoredBook[]);
    req.onerror = () => reject(req.error);
  });
}

export async function getBook(id: string): Promise<StoredBook | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BOOKS_STORE, 'readonly');
    const store = tx.objectStore(BOOKS_STORE);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result as StoredBook);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteBook(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BOOKS_STORE, 'readwrite');
    const store = tx.objectStore(BOOKS_STORE);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export interface UserPreferences {
  id: string;
  [key: string]: unknown;
}

export async function saveUserPreferences(
  prefs: Omit<UserPreferences, 'id'>
): Promise<void> {
  const db = await openDb();
  // Busca as preferências atuais
  const currentPrefs: UserPreferences | undefined = await getUserPreferences();
  const merged = { ...(currentPrefs || { id: 'user' }), ...prefs };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PREFS_STORE, 'readwrite');
    const store = tx.objectStore(PREFS_STORE);
    store.put(merged);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getUserPreferences(): Promise<
  UserPreferences | undefined
> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PREFS_STORE, 'readonly');
    const store = tx.objectStore(PREFS_STORE);
    const req = store.get('user');
    req.onsuccess = () => resolve(req.result as UserPreferences);
    req.onerror = () => reject(req.error);
  });
}

export const defaultSettings: Omit<UserPreferences, 'id'> = {
  theme: 'light',
  fontSize: 16,
  lineHeight: 1.5,
  fontFamily: 'Georgia, serif',
  showBookCover: true,
};

export async function seedInitialData(): Promise<void> {
  // 1) Se não há livros, popula com o default.epub
  const existing = await getAllBooks();
  if (existing.length === 0) {
    // Faz fetch do EPUB padrão
    const resp = await fetch('/default.epub');
    if (!resp.ok) {
      console.warn('/default.epub was not found, fatal error');
    } else {
      const blob = await resp.blob();
      // Cria um File para que addBook funcione igual ao upload do usuário
      const file = new File(
        [blob],
        "Alice's Adventures in Wonderland by Lewis Carroll.epub",
        { type: blob.type }
      );
      await addBook(file);
    }
  }

  // 2) Se não há prefs, salva as defaultSettings
  const prefs = await getUserPreferences();
  if (!prefs) {
    await saveUserPreferences(defaultSettings);
    console.log('Default user preferences saved');
  }
}
