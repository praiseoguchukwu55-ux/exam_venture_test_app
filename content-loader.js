// ============================================
// Content Loader from Admin Panel
// Loads all content from the shared backend API
// ============================================

const ContentLoader = {
    requestSync: function(method, endpoint) {
        const xhr = new XMLHttpRequest();
        xhr.open(method, `/api${endpoint}`, false);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(null);

        if (xhr.status >= 200 && xhr.status < 300) {
            return xhr.responseText ? JSON.parse(xhr.responseText) : null;
        }

        return null;
    },

    escapeHtml: function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    getBackgroundStyle: function(imageField, imageMap) {
        if (!imageField) {
            return 'linear-gradient(135deg, #abb400 0%, #ffffff 100%)';
        }

        if (String(imageField).match(/^\d+$/) && imageMap) {
            const image = imageMap.get(String(imageField));
            if (image && image.data) {
                return `url('${image.data}')`;
            }
        }

        return imageField;
    },

    loadMessages: function(containerId) {
        const messages = this.requestSync('GET', '/messages') || [];
        const images = this.requestSync('GET', '/images') || [];
        const imageMap = new Map(images.map(image => [String(image.id), image]));
        const container = document.getElementById(containerId);

        if (!container || messages.length === 0) return;

        container.innerHTML = '';

        messages.forEach(message => {
            const card = document.createElement('div');
            card.className = 'media-card';
            const bgStyle = this.getBackgroundStyle(message.image, imageMap);
            const styleStr = bgStyle.startsWith('url(')
                ? `background: ${bgStyle}; background-size: cover; background-position: center;`
                : `background: ${bgStyle}`;

            card.innerHTML = `
                <div class="media-image" style="${styleStr}"></div>
                <h3>${this.escapeHtml(message.title)}</h3>
                <p>${this.escapeHtml(message.description)}</p>
                <a href="${message.link || '#'}" class="card-link">Explore →</a>
            `;
            container.appendChild(card);
        });
    },

    loadVideos: function(containerId) {
        const videos = this.requestSync('GET', '/videos') || [];
        const container = document.getElementById(containerId);

        if (!container || videos.length === 0) return;

        container.innerHTML = '';

        videos.forEach(video => {
            const card = document.createElement('div');
            card.className = 'video-card';
            card.innerHTML = `
                <div class="video-thumbnail"></div>
                <h3>${this.escapeHtml(video.title)}</h3>
                <p>${this.escapeHtml(video.description)}</p>
            `;
            container.appendChild(card);
        });
    },

    loadSongs: function(containerId) {
        const songs = this.requestSync('GET', '/songs') || [];
        const container = document.getElementById(containerId);

        if (!container || songs.length === 0) return;

        container.innerHTML = '';

        songs.forEach(song => {
            const item = document.createElement('div');
            item.className = 'song-item';
            const songLink = song.url ? `<a href="${this.escapeHtml(song.url)}" target="_blank" class="song-link">▶ Listen</a>` : '';
            item.innerHTML = `
                <div class="song-cover"></div>
                <h4>${this.escapeHtml(song.title)}</h4>
                <p>${this.escapeHtml(song.artist)}</p>
                ${songLink}
            `;
            container.appendChild(item);
        });
    },

    loadEbooks: function(containerId) {
        const ebooks = this.requestSync('GET', '/ebooks') || [];
        const images = this.requestSync('GET', '/images') || [];
        const imageMap = new Map(images.map(image => [String(image.id), image]));
        const container = document.getElementById(containerId);

        if (!container || ebooks.length === 0) return;

        container.innerHTML = '';

        ebooks.forEach(ebook => {
            const card = document.createElement('div');
            card.className = 'ebook-card';
            const bgStyle = this.getBackgroundStyle(ebook.image, imageMap);
            const styleStr = bgStyle.startsWith('url(')
                ? `background: ${bgStyle}; background-size: cover; background-position: center;`
                : `background: ${bgStyle}`;

            card.innerHTML = `
                <div class="ebook-cover" style="${styleStr}"></div>
                <h3>${this.escapeHtml(ebook.title)}</h3>
                <p>${this.escapeHtml(ebook.description)}</p>
                <a href="${ebook.fileUrl || '#'}" class="download-btn" target="_blank">Download →</a>
            `;
            container.appendChild(card);
        });
    },

    loadLinks: function(containerId) {
        const links = this.requestSync('GET', '/links') || [];
        const container = document.getElementById(containerId);

        if (!container || links.length === 0) return;

        container.innerHTML = '';

        const linksList = document.createElement('ul');
        linksList.style.listStyle = 'none';
        linksList.style.padding = '0';

        links.forEach(link => {
            const item = document.createElement('li');
            item.style.padding = '12px 0';
            item.style.borderBottom = '1px solid #d8e1cf';
            item.innerHTML = `
                <a href="${this.escapeHtml(link.url)}" target="_blank" style="color: #abb400; text-decoration: none; font-weight: 500;">
                    ${this.escapeHtml(link.title)} →
                </a>
            `;
            linksList.appendChild(item);
        });

        container.appendChild(linksList);
    },

    loadRadioSettings: function() {
        const settings = this.requestSync('GET', '/radio-settings') || {};

        if (settings.title) {
            const titleEl = document.querySelector('.radio-player h3');
            if (titleEl) titleEl.textContent = settings.title;
        }

        if (settings.description) {
            const descEl = document.querySelector('.radio-player p');
            if (descEl) descEl.textContent = settings.description;
        }
    }
};

// Initialize content loading on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('mediaGrid') && document.title.includes('Metropolitan Church, Ibadan')) {
        ContentLoader.loadMessages('mediaGrid');
    } else if (document.title.includes('Videos')) {
        ContentLoader.loadVideos('mediaGrid');
    } else if (document.title.includes('Songs')) {
        ContentLoader.loadSongs('songsGrid');
    } else if (document.title.includes('Books') || document.title.includes('Ebooks')) {
        ContentLoader.loadEbooks('ebooksGrid');
    } else if (document.title.includes('Links')) {
        ContentLoader.loadLinks('linksContent');
    }

    if (document.querySelector('.radio-player')) {
        ContentLoader.loadRadioSettings();
    }
});
