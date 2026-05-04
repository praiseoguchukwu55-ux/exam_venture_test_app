// ============================================
// Content Loader from Admin Panel
// Loads all content managed in the admin panel
// ============================================

const ContentLoader = {
    // Helper: Get background style from image field or image ID
    getBackgroundStyle: function(imageField) {
        if (!imageField) {
            return 'linear-gradient(135deg, #abb400 0%, #ffffff 100%)';
        }
        
        // Check if it's an image ID (numeric string or timestamp)
        if (imageField.match(/^\d+$/)) {
            const images = JSON.parse(localStorage.getItem('tmcImages') || '[]');
            const image = images.find(img => img.id == imageField);
            if (image && image.data) {
                return `url('${image.data}')`;
            }
        }
        
        // Otherwise, treat as gradient or CSS value
        return imageField;
    },

    // Load messages for the Messages page
    loadMessages: function(containerId) {
        const messages = JSON.parse(localStorage.getItem('tmcMessages') || '[]');
        const container = document.getElementById(containerId);
        
        if (!container || messages.length === 0) return;
        
        container.innerHTML = '';
        
        messages.forEach(message => {
            const card = document.createElement('div');
            card.className = 'media-card';
            const bgStyle = this.getBackgroundStyle(message.image);
            let styleStr = '';
            
            if (bgStyle.startsWith('url(')) {
                styleStr = `background: ${bgStyle}; background-size: cover; background-position: center;`;
            } else {
                styleStr = `background: ${bgStyle}`;
            }
            
            card.innerHTML = `
                <div class="media-image" style="${styleStr}"></div>
                <h3>${this.escapeHtml(message.title)}</h3>
                <p>${this.escapeHtml(message.description)}</p>
                <a href="${message.link || '#'}" class="card-link">Explore →</a>
            `;
            container.appendChild(card);
        });
    },
    
    // Load videos for the Videos page
    loadVideos: function(containerId) {
        const videos = JSON.parse(localStorage.getItem('tmcVideos') || '[]');
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
    
    // Load songs for the Songs page
    loadSongs: function(containerId) {
        const songs = JSON.parse(localStorage.getItem('tmcSongs') || '[]');
        const container = document.getElementById(containerId);
        
        if (!container || songs.length === 0) return;
        
        container.innerHTML = '';
        
        songs.forEach(song => {
            const item = document.createElement('div');
            item.className = 'song-item';
            let songLink = '';
            if (song.url) {
                songLink = `<a href="${this.escapeHtml(song.url)}" target="_blank" class="song-link">▶ Listen</a>`;
            }
            item.innerHTML = `
                <div class="song-cover"></div>
                <h4>${this.escapeHtml(song.title)}</h4>
                <p>${this.escapeHtml(song.artist)}</p>
                ${songLink}
            `;
            container.appendChild(item);
        });
    },
    
    // Load ebooks for the Ebooks page
    loadEbooks: function(containerId) {
        const ebooks = JSON.parse(localStorage.getItem('tmcEbooks') || '[]');
        const container = document.getElementById(containerId);
        
        if (!container || ebooks.length === 0) return;
        
        container.innerHTML = '';
        
        ebooks.forEach(ebook => {
            const card = document.createElement('div');
            card.className = 'ebook-card';
            const bgStyle = this.getBackgroundStyle(ebook.image);
            let styleStr = '';
            
            if (bgStyle.startsWith('url(')) {
                styleStr = `background: ${bgStyle}; background-size: cover; background-position: center;`;
            } else {
                styleStr = `background: ${bgStyle}`;
            }
            
            card.innerHTML = `
                <div class="ebook-cover" style="${styleStr}"></div>
                <h3>${this.escapeHtml(ebook.title)}</h3>
                <p>${this.escapeHtml(ebook.description)}</p>
                <a href="${ebook.fileUrl || '#'}" class="download-btn" target="_blank">Download →</a>
            `;
            container.appendChild(card);
        });
    },
    
    // Load links for the Links page
    loadLinks: function(containerId) {
        const links = JSON.parse(localStorage.getItem('tmcLinks') || '[]');
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
    
    // Load radio settings
    loadRadioSettings: function() {
        const settings = JSON.parse(localStorage.getItem('tmcRadioSettings') || '{}');
        
        if (settings.title) {
            const titleEl = document.querySelector('.radio-player h3');
            if (titleEl) titleEl.textContent = settings.title;
        }
        
        if (settings.description) {
            const descEl = document.querySelector('.radio-player p');
            if (descEl) descEl.textContent = settings.description;
        }
    },
    
    // Utility function to escape HTML
    escapeHtml: function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialize content loading on page load
document.addEventListener('DOMContentLoaded', () => {
    // Determine which page we're on by checking for specific elements
    
    // Messages page (index.html)
    if (document.getElementById('mediaGrid') && document.title.includes('Metropolitan Church, Ibadan')) {
        ContentLoader.loadMessages('mediaGrid');
    }
    // Videos page
    else if (document.title.includes('Videos')) {
        ContentLoader.loadVideos('mediaGrid');
    }
    // Songs page
    else if (document.title.includes('Songs')) {
        ContentLoader.loadSongs('songsGrid');
    }
    // E-Books page
    else if (document.title.includes('Books') || document.title.includes('Ebooks')) {
        ContentLoader.loadEbooks('ebooksGrid');
    }
    // Links page
    else if (document.title.includes('Links')) {
        ContentLoader.loadLinks('linksContent');
    }
    
    // Load radio settings on all pages
    if (document.querySelector('.radio-player')) {
        ContentLoader.loadRadioSettings();
    }
});
