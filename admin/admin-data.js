// ============================================
// Admin Data Management System
// Uses shared backend API storage with async/await
// ============================================

// Determine API base URL.
// Priority:
// 1. file:// local dev -> localhost backend
// 2. config.json / runtime config -> Render backend
// 3. same-origin http hosting -> relative /api
let API_BASE_CACHE = null;

async function getApiBase() {
    if (API_BASE_CACHE) {
        return API_BASE_CACHE;
    }

    if (window.location.protocol === 'file:') {
        API_BASE_CACHE = 'http://localhost:3000/api';
        return API_BASE_CACHE;
    }

    if (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) {
        API_BASE_CACHE = window.APP_CONFIG.API_BASE_URL;
        return API_BASE_CACHE;
    }

    try {
        const response = await fetch('/config.json', { cache: 'no-store' });
        if (response.ok) {
            const config = await response.json();
            if (config && config.API_BASE_URL) {
                API_BASE_CACHE = config.API_BASE_URL;
                return API_BASE_CACHE;
            }
        }
    } catch (error) {
        console.warn('Could not load config.json, falling back to same-origin API:', error);
    }

    API_BASE_CACHE = '/api';
    return API_BASE_CACHE;
}

async function request(method, endpoint, body) {
    const apiBase = await getApiBase();
    const fullUrl = `${apiBase}${endpoint}`;
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors'
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        console.log(`Fetching: ${method} ${fullUrl}`, body ? `with body: ${JSON.stringify(body)}` : '');
        const response = await fetch(fullUrl, options);
        console.log(`Response status: ${response.status} for ${fullUrl}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Request failed: ${method} ${fullUrl} => Status ${response.status}, Response:`, errorText);
            throw new Error(`Request to ${endpoint} failed with status ${response.status}: ${errorText}`);
        }

        const text = await response.text();
        if (!text) return null;

        try {
            return JSON.parse(text);
        } catch (parseError) {
            console.error(`JSON parse error for response from ${fullUrl}:`, parseError, text);
            throw new Error(`Invalid JSON response from ${endpoint}`);
        }
    } catch (error) {
        if (error instanceof TypeError) {
            console.error(`Network/CORS error for ${fullUrl}:`, error.message);
            throw new Error(`Network error: ${error.message}. Is the server running at ${apiBase}?`);
        }
        console.error(`Error for ${fullUrl}:`, error);
        throw error;
    }
}

async function getCollection(name) {
    return await request('GET', `/${name}`) || [];
}

async function mutateCollection(method, name, body, id) {
    const endpoint = id ? `/${name}/${id}` : `/${name}`;
    return await request(method, endpoint, body);
}

const AdminData = {
    async init() {
        try {
            await request('GET', '/health');
        } catch (error) {
            console.error('Admin data init failed:', error);
        }
    },

    // Messages Management
    async getMessages() {
        return await getCollection('messages');
    },

    async addMessage(message) {
        return await mutateCollection('POST', 'messages', message);
    },

    async updateMessage(id, message) {
        return await mutateCollection('PUT', 'messages', message, id);
    },

    async deleteMessage(id) {
        await mutateCollection('DELETE', 'messages', null, id);
    },

    // Videos Management
    async getVideos() {
        return await getCollection('videos');
    },

    async addVideo(video) {
        return await mutateCollection('POST', 'videos', video);
    },

    async updateVideo(id, video) {
        return await mutateCollection('PUT', 'videos', video, id);
    },

    async deleteVideo(id) {
        await mutateCollection('DELETE', 'videos', null, id);
    },

    // Songs Management
    async getSongs() {
        return await getCollection('songs');
    },

    async addSong(song) {
        return await mutateCollection('POST', 'songs', song);
    },

    async updateSong(id, song) {
        return await mutateCollection('PUT', 'songs', song, id);
    },

    async deleteSong(id) {
        await mutateCollection('DELETE', 'songs', null, id);
    },

    // Ebooks Management
    async getEbooks() {
        return await getCollection('ebooks');
    },

    async addEbook(ebook) {
        return await mutateCollection('POST', 'ebooks', ebook);
    },

    async updateEbook(id, ebook) {
        return await mutateCollection('PUT', 'ebooks', ebook, id);
    },

    async deleteEbook(id) {
        await mutateCollection('DELETE', 'ebooks', null, id);
    },

    // Links Management
    async getLinks() {
        return await getCollection('links');
    },

    async addLink(link) {
        return await mutateCollection('POST', 'links', link);
    },

    async updateLink(id, link) {
        return await mutateCollection('PUT', 'links', link, id);
    },

    async deleteLink(id) {
        await mutateCollection('DELETE', 'links', null, id);
    },

    // People Records Management
    async getPeople() {
        return await getCollection('people');
    },

    async addPerson(person) {
        return await mutateCollection('POST', 'people', person);
    },

    async updatePerson(id, person) {
        return await mutateCollection('PUT', 'people', person, id);
    },

    async deletePerson(id) {
        await mutateCollection('DELETE', 'people', null, id);
    },

    // Images Management
    async getAllImages() {
        return await getCollection('images');
    },

    async addImage(image) {
        return await mutateCollection('POST', 'images', image);
    },

    async deleteImage(id) {
        await mutateCollection('DELETE', 'images', null, id);
    },

    async getImageById(id) {
        const images = await this.getAllImages();
        return images.find(img => img.id == id);
    },

    async updateImageCategory(id, category) {
        return await mutateCollection('PUT', 'images', { category }, id);
    },

    // Radio Settings
    async getRadioSettings() {
        return await request('GET', '/radio-settings') || {};
    },

    async saveRadioSettings(settings) {
        return await request('PUT', '/radio-settings', settings);
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    AdminData.init();
});
