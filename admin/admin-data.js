// ============================================
// Admin Data Management System
// Uses shared backend API storage with async/await
// ============================================

// Determine API base URL
// If opened as file://, connect to http://localhost:3000
// If opened via http, use current host
const API_BASE = (function() {
    if (window.location.protocol === 'file:') {
        // Running from file:// - connect to localhost:3000
        return 'http://localhost:3000/api';
    } else {
        // Running via http - use relative path (same host)
        return '/api';
    }
})();

async function request(method, endpoint, body) {
    const fullUrl = `${API_BASE}${endpoint}`;
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
            throw new Error(`Network error: ${error.message}. Is the server running at ${API_BASE}?`);
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
