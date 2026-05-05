const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const rootDir = __dirname;
const dataDir = path.join(rootDir, 'data');
const storePath = path.join(dataDir, 'store.json');
const port = Number(process.env.PORT || 3000);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.ico': 'image/x-icon'
};

const defaultStore = {
  messages: [
    {
      id: 1,
      title: 'Saints Community In Songs - Vol 15',
      description: 'Discover powerful teachings on living a faithful Christian life',
      link: '#',
      image: 'linear-gradient(135deg, #abb400 0%, #ffffff 100%)'
    },
    {
      id: 2,
      title: 'Believers Convention 2025 - Times Of Refreshing',
      description: 'Learn from our pastor\'s insights and spiritual wisdom',
      link: '#',
      image: 'linear-gradient(135deg, #abb400 0%, #f7fad9 100%)'
    },
    {
      id: 3,
      title: 'Faith For All Seasons - Part 3',
      description: 'Deep dive into Scripture with our study groups',
      link: '#',
      image: 'linear-gradient(135deg, #abb400 0%, #eef4bf 100%)'
    }
  ],
  videos: [
    {
      id: 1,
      title: 'Sunday Service Highlights',
      description: 'Experience our latest service message.',
      videoUrl: '',
      image: 'linear-gradient(135deg, #abb400 0%, #ffffff 100%)'
    },
    {
      id: 2,
      title: 'Ministry Updates',
      description: 'Stay updated with our church ministries.',
      videoUrl: '',
      image: 'linear-gradient(135deg, #abb400 0%, #f7fad9 100%)'
    },
    {
      id: 3,
      title: 'Youth Outreach',
      description: 'Watch our community impact stories.',
      videoUrl: '',
      image: 'linear-gradient(135deg, #abb400 0%, #eef4bf 100%)'
    }
  ],
  songs: [
    { id: 1, title: 'Amazing Grace', artist: 'Traditional', url: '', lyrics: '' },
    { id: 2, title: 'How Great Thou Art', artist: 'Carl Boberg', url: '', lyrics: '' },
    { id: 3, title: 'Jesus Loves Me', artist: 'Anna Bartlett Warner', url: '', lyrics: '' }
  ],
  ebooks: [
    {
      id: 1,
      title: 'Daily Devotional',
      description: 'Start your day with spiritual guidance',
      fileUrl: '#',
      image: 'linear-gradient(135deg, #abb400 0%, #ffffff 100%)'
    },
    {
      id: 2,
      title: 'Bible Study Guide',
      description: 'Comprehensive Scripture study materials',
      fileUrl: '#',
      image: 'linear-gradient(135deg, #abb400 0%, #f7fad9 100%)'
    }
  ],
  links: [
    { id: 1, title: 'BibleGateway', url: 'https://www.biblegateway.com' },
    { id: 2, title: 'Sermon Audio', url: 'https://www.sermonaudio.com' }
  ],
  people: [],
  images: [],
  radioSettings: {
    title: 'Listen Live',
    description: 'Tune in to our weekly radio broadcast and devotion sessions.',
    streamUrl: '',
    schedule: 'Sunday 10:00 AM\nMonday-Friday 6:00 AM'
  }
};

function seedStore() {
  return JSON.parse(JSON.stringify(defaultStore));
}

function ensureStore() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(storePath)) {
    fs.writeFileSync(storePath, JSON.stringify(seedStore(), null, 2));
  }
}

function readStore() {
  ensureStore();
  return JSON.parse(fs.readFileSync(storePath, 'utf8'));
}

function writeStore(store) {
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, text, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(statusCode, { 'Content-Type': contentType });
  res.end(text);
}

function getCollectionName(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] !== 'api') {
    return null;
  }

  return parts[1];
}

function getCollection(store, name) {
  if (name === 'radio-settings') {
    return store.radioSettings;
  }

  return store[name];
}

function setCollection(store, name, value) {
  if (name === 'radio-settings') {
    store.radioSettings = value;
    return;
  }

  store[name] = value;
}

function nextId(items) {
  return Math.max(0, ...items.map(item => Number(item.id) || 0)) + 1;
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 10 * 1024 * 1024) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function serveStatic(req, res, pathname) {
  let safePath = pathname === '/' ? '/index.html' : pathname;
  if (safePath.endsWith('/')) {
    safePath += 'index.html';
  }

  const filePath = path.normalize(path.join(rootDir, safePath));
  if (!filePath.startsWith(rootDir)) {
    sendText(res, 403, 'Forbidden');
    return;
  }

  fs.readFile(filePath, (error, fileBuffer) => {
    if (error) {
      sendText(res, 404, 'Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(fileBuffer);
  });
}

async function handleApi(req, res, pathname) {
  const collectionName = getCollectionName(pathname);
  if (!collectionName) {
    return false;
  }

  const store = readStore();

  if (pathname === '/api/health') {
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (req.method === 'GET' && pathname === '/api/stats') {
    sendJson(res, 200, {
      messages: store.messages.length,
      videos: store.videos.length,
      songs: store.songs.length,
      ebooks: store.ebooks.length,
      links: store.links.length,
      people: store.people.length,
      images: store.images.length
    });
    return true;
  }

  const recognized = ['messages', 'videos', 'songs', 'ebooks', 'links', 'people', 'images', 'radio-settings'];
  if (!recognized.includes(collectionName)) {
    sendJson(res, 404, { error: 'Unknown API endpoint' });
    return true;
  }

  if (req.method === 'GET') {
    const payload = getCollection(store, collectionName);
    sendJson(res, 200, payload);
    return true;
  }

  const parts = pathname.split('/').filter(Boolean);
  const id = parts[2];

  if (req.method === 'POST') {
    const body = await parseBody(req);
    const collection = Array.isArray(getCollection(store, collectionName)) ? getCollection(store, collectionName) : [];
    const record = { ...body };
    if (collectionName === 'images' && record.id == null) {
      record.id = Date.now().toString();
    } else if (record.id == null) {
      record.id = nextId(collection);
    }
    collection.push(record);
    setCollection(store, collectionName, collection);
    writeStore(store);
    sendJson(res, 201, record);
    return true;
  }

  if (req.method === 'PUT') {
    const body = await parseBody(req);

    if (collectionName === 'radio-settings') {
      const current = getCollection(store, collectionName) || {};
      const updated = { ...current, ...body };
      setCollection(store, collectionName, updated);
      writeStore(store);
      sendJson(res, 200, updated);
      return true;
    }

    const collection = Array.isArray(getCollection(store, collectionName)) ? getCollection(store, collectionName) : [];
    const index = collection.findIndex(item => String(item.id) === String(id));
    if (index === -1) {
      sendJson(res, 404, { error: 'Record not found' });
      return true;
    }

    collection[index] = { ...collection[index], ...body, id: collection[index].id };
    setCollection(store, collectionName, collection);
    writeStore(store);
    sendJson(res, 200, collection[index]);
    return true;
  }

  if (req.method === 'DELETE') {
    if (collectionName === 'radio-settings') {
      setCollection(store, collectionName, {});
      writeStore(store);
      sendJson(res, 200, { ok: true });
      return true;
    }

    const collection = Array.isArray(getCollection(store, collectionName)) ? getCollection(store, collectionName) : [];
    const filtered = collection.filter(item => String(item.id) !== String(id));
    setCollection(store, collectionName, filtered);
    writeStore(store);
    sendJson(res, 200, { ok: true });
    return true;
  }

  sendJson(res, 405, { error: 'Method not allowed' });
  return true;
}

ensureStore();

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = requestUrl.pathname;

  // Add CORS headers to allow requests from file:// and any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (pathname.startsWith('/api/')) {
    try {
      await handleApi(req, res, pathname);
    } catch (error) {
      sendJson(res, 500, { error: error.message || 'Server error' });
    }
    return;
  }

  serveStatic(req, res, pathname);
});

server.listen(port, () => {
  console.log(`The Metropolitan Church site is running on http://localhost:${port}`);
});
