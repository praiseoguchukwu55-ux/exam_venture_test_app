// ============================================
// Admin Data Management System
// Uses shared backend API storage
// ============================================

const API_BASE = '/api';

function requestSync(method, endpoint, body) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, `${API_BASE}${endpoint}`, false);
    xhr.setRequestHeader('Content-Type', 'application/json');

    try {
        xhr.send(body ? JSON.stringify(body) : null);
    } catch (error) {
        throw new Error(`Network error while calling ${endpoint}`);
    }

    if (xhr.status >= 200 && xhr.status < 300) {
        if (!xhr.responseText) {
            return null;
        }

        return JSON.parse(xhr.responseText);
    }

    throw new Error(`Request to ${endpoint} failed with status ${xhr.status}`);
}

function getCollection(name) {
    return requestSync('GET', `/${name}`) || [];
}

function mutateCollection(method, name, body, id) {
    const endpoint = id ? `/${name}/${id}` : `/${name}`;
    return requestSync(method, endpoint, body);
}

const AdminData = {
    init: function() {
        requestSync('GET', '/health');
    },

    // Messages Management
    getMessages: function() {
        return getCollection('messages');
    },

    addMessage: function(message) {
        return mutateCollection('POST', 'messages', message);
    },

    updateMessage: function(id, message) {
        return mutateCollection('PUT', 'messages', message, id);
    },

    deleteMessage: function(id) {
        mutateCollection('DELETE', 'messages', null, id);
    },

    // Videos Management
    getVideos: function() {
        return getCollection('videos');
    },

    addVideo: function(video) {
        return mutateCollection('POST', 'videos', video);
    },

    updateVideo: function(id, video) {
        return mutateCollection('PUT', 'videos', video, id);
    },

    deleteVideo: function(id) {
        mutateCollection('DELETE', 'videos', null, id);
    },

    // Songs Management
    getSongs: function() {
        return getCollection('songs');
    },

    addSong: function(song) {
        return mutateCollection('POST', 'songs', song);
    },

    updateSong: function(id, song) {
        return mutateCollection('PUT', 'songs', song, id);
    },

    deleteSong: function(id) {
        mutateCollection('DELETE', 'songs', null, id);
    },

    // Ebooks Management
    getEbooks: function() {
        return getCollection('ebooks');
    },

    addEbook: function(ebook) {
        return mutateCollection('POST', 'ebooks', ebook);
    },

    updateEbook: function(id, ebook) {
        return mutateCollection('PUT', 'ebooks', ebook, id);
    },

    deleteEbook: function(id) {
        mutateCollection('DELETE', 'ebooks', null, id);
    },

    // Links Management
    getLinks: function() {
        return getCollection('links');
    },

    addLink: function(link) {
        return mutateCollection('POST', 'links', link);
    },

    updateLink: function(id, link) {
        return mutateCollection('PUT', 'links', link, id);
    },

    deleteLink: function(id) {
        mutateCollection('DELETE', 'links', null, id);
    },

    // People Records Management
    getPeople: function() {
        return getCollection('people');
    },

    addPerson: function(person) {
        return mutateCollection('POST', 'people', person);
    },

    updatePerson: function(id, person) {
        return mutateCollection('PUT', 'people', person, id);
    },

    deletePerson: function(id) {
        mutateCollection('DELETE', 'people', null, id);
    },

    // Images Management
    getAllImages: function() {
        return getCollection('images');
    },

    addImage: function(image) {
        return mutateCollection('POST', 'images', image);
    },

    deleteImage: function(id) {
        mutateCollection('DELETE', 'images', null, id);
    },

    getImageById: function(id) {
        return this.getAllImages().find(img => img.id == id);
    },

    updateImageCategory: function(id, category) {
        return mutateCollection('PUT', 'images', { category }, id);
    },

    // Radio Settings
    getRadioSettings: function() {
        return requestSync('GET', '/radio-settings') || {};
    },

    saveRadioSettings: function(settings) {
        return requestSync('PUT', '/radio-settings', settings);
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    AdminData.init();
});
