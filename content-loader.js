// ============================================
// Content Loader from Admin Panel
// Loads all content from the shared backend API
// ============================================

const ContentLoader = {
    apiBaseCache: null,

    async getApiBase() {
        if (this.apiBaseCache) {
            return this.apiBaseCache;
        }

        if (typeof location !== 'undefined' && location.protocol === 'file:') {
            this.apiBaseCache = 'http://localhost:3000/api';
            return this.apiBaseCache;
        }

        if (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) {
            this.apiBaseCache = window.APP_CONFIG.API_BASE_URL;
            return this.apiBaseCache;
        }

        try {
            const response = await fetch('/config.json', { cache: 'no-store' });
            if (response.ok) {
                const config = await response.json();
                if (config && config.API_BASE_URL) {
                    this.apiBaseCache = config.API_BASE_URL;
                    return this.apiBaseCache;
                }
            }
        } catch (error) {
            console.warn('Could not load config.json, falling back to same-origin API:', error);
        }

        this.apiBaseCache = '/api';
        return this.apiBaseCache;
    },

    // Async request method using fetch API
    async request(method, endpoint) {
        try {
            const apiBase = await this.getApiBase();
            const url = `${apiBase}${endpoint}`;
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                mode: 'cors'
            });

            if (!response.ok) {
                console.error(`API Error: ${response.status} ${response.statusText}`);
                return [];
            }

            const data = await response.json();
            return data || [];
        } catch (error) {
            console.error(`Failed to fetch ${endpoint}:`, error);
            return [];
        }
    },

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    getBackgroundStyle(imageField, imageMap) {
        if (!imageField) {
            return 'linear-gradient(135deg, #abb400 0%, #ffffff 100%)';
        }

        if (String(imageField).match(/^\d+$/) && imageMap) {
            const image = imageMap.get(String(imageField));
            if (image && image.data) {
                // Handle Google Drive links
                if (image.type === 'google-drive-link' && image.data.includes('drive.google.com')) {
                    // Convert Google Drive sharing link to direct image URL
                    const fileIdMatch = image.data.match(/\/d\/([^\/]+)/);
                    if (fileIdMatch && fileIdMatch[1]) {
                        const fileId = fileIdMatch[1];
                        return `url('https://drive.google.com/thumbnail?sz=w500&id=${fileId}')`;
                    }
                }
                // Handle regular data URIs
                return `url('${image.data}')`;
            }
        }

        return imageField;
    },

    async loadMessages(containerId) {
        const fetched = await this.request('GET', '/messages');
        const images = await this.request('GET', '/images');
        // Hardcoded announcement so it shows on the public site in any browser
        const hardcoded = {
            id: 'hc-1',
            title: "Announcement: Today's Message Uploaded",
            description: "Good evening Pastor Sir\nGood evening Family @all\n\nThank you Pastor Sir for the privilege of posting this announcement.\n\nToday's message has been uploaded. Let's listen again and be blessed.\n\nThank you family.",
            link: 'https://drive.google.com/file/d/14pR2lNm9T6oz64VA3U4T-7eFbFuMnzoK/view?usp=drivesdk',
            image: ''
        };
        const messages = [hardcoded].concat(fetched || []);
        const imageMap = new Map(images.map(image => [String(image.id), image]));
        const container = document.getElementById(containerId);

        if (!container) return;

        container.innerHTML = '';

        if (messages.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No messages available yet.</p>';
            return;
        }

        messages.forEach(message => {
            const bgStyle = this.getBackgroundStyle(message.image, imageMap);
            const styleStr = bgStyle.startsWith('url(')
                ? `background: ${bgStyle}; background-size: cover; background-position: center;`
                : `background: ${bgStyle}`;

            const link = document.createElement('a');
            link.href = message.link || '#';
            link.style.textDecoration = 'none';
            link.style.color = 'inherit';
            link.className = 'media-card';
            link.innerHTML = `
                <div class="media-image" style="${styleStr}"></div>
                <h3>${this.escapeHtml(message.title)}</h3>
                <p>${this.escapeHtml(message.description)}</p>
                <span class="card-link">Explore →</span>
            `;
            container.appendChild(link);
        });
    },

    async loadVideos(containerId) {
        const videos = await this.request('GET', '/videos');
        const container = document.getElementById(containerId);

        if (!container) return;

        container.innerHTML = '';

        if (videos.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No videos available yet.</p>';
            return;
        }

        videos.forEach(video => {
            const link = document.createElement('a');
            link.href = video.url || '#';
            link.target = video.url ? '_blank' : '';
            link.style.textDecoration = 'none';
            link.style.color = 'inherit';
            link.className = 'video-card';
            link.innerHTML = `
                <div class="video-thumbnail"></div>
                <h3>${this.escapeHtml(video.title)}</h3>
                <p>${this.escapeHtml(video.description)}</p>
                <span class="card-link">Watch →</span>
            `;
            container.appendChild(link);
        });
    },

    async loadSongs(containerId) {
        const songs = await this.request('GET', '/songs');
        const container = document.getElementById(containerId);

        if (!container) return;

        container.innerHTML = '';

        if (songs.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No songs available yet.</p>';
            return;
        }

        songs.forEach(song => {
            const link = document.createElement('a');
            link.href = song.url || '#';
            link.target = song.url ? '_blank' : '';
            link.style.textDecoration = 'none';
            link.style.color = 'inherit';
            link.className = 'song-item';
            link.innerHTML = `
                <div class="song-cover"></div>
                <h4>${this.escapeHtml(song.title)}</h4>
                <p>${this.escapeHtml(song.artist || 'Unknown Artist')}</p>
                <span class="song-link">▶ Listen</span>
            `;
            container.appendChild(link);
        });
    },

    async loadEbooks(containerId) {
        const ebooks = await this.request('GET', '/ebooks');
        const images = await this.request('GET', '/images');
        const imageMap = new Map(images.map(image => [String(image.id), image]));
        const container = document.getElementById(containerId);

        if (!container) return;

        container.innerHTML = '';

        if (ebooks.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No e-books available yet.</p>';
            return;
        }

        ebooks.forEach(ebook => {
            const bgStyle = this.getBackgroundStyle(ebook.image, imageMap);
            const styleStr = bgStyle.startsWith('url(')
                ? `background: ${bgStyle}; background-size: cover; background-position: center;`
                : `background: ${bgStyle}`;

            const link = document.createElement('a');
            link.href = (ebook.fileUrl && ebook.fileUrl !== '#') ? ebook.fileUrl : '#';
            link.target = (ebook.fileUrl && ebook.fileUrl !== '#') ? '_blank' : '';
            link.style.textDecoration = 'none';
            link.style.color = 'inherit';
            link.className = 'ebook-card';
            link.innerHTML = `
                <div class="ebook-cover" style="${styleStr}"></div>
                <h3>${this.escapeHtml(ebook.title)}</h3>
                <p>${this.escapeHtml(ebook.description)}</p>
                ${ebook.fileUrl && ebook.fileUrl !== '#' ? `<span class="download-btn">Download →</span>` : '<span class="download-btn" style="opacity: 0.5;">Coming Soon</span>'}
            `;
            container.appendChild(link);
        });
    },

    async loadLinks(containerId) {
        const links = await this.request('GET', '/links');
        const container = document.getElementById(containerId);

        if (!container) return;

        container.innerHTML = '';

        if (links.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999;">No links available yet.</p>';
            return;
        }

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

    async loadRadioSettings() {
        const settings = await this.request('GET', '/radio-settings');

        if (settings && settings.title) {
            const titleEl = document.querySelector('.radio-player h3');
            if (titleEl) titleEl.textContent = settings.title;
        }

        if (settings && settings.description) {
            const descEl = document.querySelector('.radio-player p');
            if (descEl) descEl.textContent = settings.description;
        }
    }
};

// Initialize content loading on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Load messages on home page
    if (document.getElementById('mediaGrid') && document.title.includes('Metropolitan Church, Ibadan')) {
        await ContentLoader.loadMessages('mediaGrid');
    }
    // Load videos
    if (document.title.includes('Videos')) {
        await ContentLoader.loadVideos('mediaGrid');
    }
    // Load songs
    if (document.title.includes('Songs')) {
        await ContentLoader.loadSongs('songsGrid');
    }
    // Load ebooks
    if (document.title.includes('Books') || document.title.includes('Ebooks')) {
        await ContentLoader.loadEbooks('ebooksGrid');
    }
    // Load links
    if (document.title.includes('Links')) {
        await ContentLoader.loadLinks('linksContent');
    }
    // Load radio settings if radio player exists
    if (document.querySelector('.radio-player')) {
        await ContentLoader.loadRadioSettings();
    }
});
