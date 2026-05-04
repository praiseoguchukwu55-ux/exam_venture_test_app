// ============================================
// Admin Data Management System
// Uses localStorage to store content
// ============================================

const AdminData = {
    // Initialize default data if not exists
    init: function() {
        if (!localStorage.getItem('tmcMessages')) {
            localStorage.setItem('tmcMessages', JSON.stringify([
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
            ]));
        }
        
        if (!localStorage.getItem('tmcVideos')) {
            localStorage.setItem('tmcVideos', JSON.stringify([
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
            ]));
        }
        
        if (!localStorage.getItem('tmcSongs')) {
            localStorage.setItem('tmcSongs', JSON.stringify([
                { id: 1, title: 'Amazing Grace', artist: 'Traditional', url: '', lyrics: '' },
                { id: 2, title: 'How Great Thou Art', artist: 'Carl Boberg', url: '', lyrics: '' },
                { id: 3, title: 'Jesus Loves Me', artist: 'Anna Bartlett Warner', url: '', lyrics: '' }
            ]));
        }
        
        if (!localStorage.getItem('tmcEbooks')) {
            localStorage.setItem('tmcEbooks', JSON.stringify([
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
            ]));
        }
        
        if (!localStorage.getItem('tmcLinks')) {
            localStorage.setItem('tmcLinks', JSON.stringify([
                { id: 1, title: 'BibleGateway', url: 'https://www.biblegateway.com' },
                { id: 2, title: 'Sermon Audio', url: 'https://www.sermonaudio.com' }
            ]));
        }

        if (!localStorage.getItem('tmcPeople')) {
            localStorage.setItem('tmcPeople', JSON.stringify([]));
        }
    },
    
    // Messages Management
    getMessages: function() {
        this.init();
        return JSON.parse(localStorage.getItem('tmcMessages') || '[]');
    },
    
    addMessage: function(message) {
        const messages = this.getMessages();
        message.id = Math.max(...messages.map(m => m.id || 0), 0) + 1;
        messages.push(message);
        localStorage.setItem('tmcMessages', JSON.stringify(messages));
        return message;
    },
    
    updateMessage: function(id, message) {
        const messages = this.getMessages();
        const index = messages.findIndex(m => m.id == id);
        if (index !== -1) {
            messages[index] = { ...messages[index], ...message, id };
            localStorage.setItem('tmcMessages', JSON.stringify(messages));
            return messages[index];
        }
        return null;
    },
    
    deleteMessage: function(id) {
        const messages = this.getMessages().filter(m => m.id != id);
        localStorage.setItem('tmcMessages', JSON.stringify(messages));
    },
    
    // Videos Management
    getVideos: function() {
        this.init();
        return JSON.parse(localStorage.getItem('tmcVideos') || '[]');
    },
    
    addVideo: function(video) {
        const videos = this.getVideos();
        video.id = Math.max(...videos.map(v => v.id || 0), 0) + 1;
        videos.push(video);
        localStorage.setItem('tmcVideos', JSON.stringify(videos));
        return video;
    },
    
    updateVideo: function(id, video) {
        const videos = this.getVideos();
        const index = videos.findIndex(v => v.id == id);
        if (index !== -1) {
            videos[index] = { ...videos[index], ...video, id };
            localStorage.setItem('tmcVideos', JSON.stringify(videos));
            return videos[index];
        }
        return null;
    },
    
    deleteVideo: function(id) {
        const videos = this.getVideos().filter(v => v.id != id);
        localStorage.setItem('tmcVideos', JSON.stringify(videos));
    },
    
    // Songs Management
    getSongs: function() {
        this.init();
        return JSON.parse(localStorage.getItem('tmcSongs') || '[]');
    },
    
    addSong: function(song) {
        const songs = this.getSongs();
        song.id = Math.max(...songs.map(s => s.id || 0), 0) + 1;
        songs.push(song);
        localStorage.setItem('tmcSongs', JSON.stringify(songs));
        return song;
    },
    
    updateSong: function(id, song) {
        const songs = this.getSongs();
        const index = songs.findIndex(s => s.id == id);
        if (index !== -1) {
            songs[index] = { ...songs[index], ...song, id };
            localStorage.setItem('tmcSongs', JSON.stringify(songs));
            return songs[index];
        }
        return null;
    },
    
    deleteSong: function(id) {
        const songs = this.getSongs().filter(s => s.id != id);
        localStorage.setItem('tmcSongs', JSON.stringify(songs));
    },
    
    // Ebooks Management
    getEbooks: function() {
        this.init();
        return JSON.parse(localStorage.getItem('tmcEbooks') || '[]');
    },
    
    addEbook: function(ebook) {
        const ebooks = this.getEbooks();
        ebook.id = Math.max(...ebooks.map(e => e.id || 0), 0) + 1;
        ebooks.push(ebook);
        localStorage.setItem('tmcEbooks', JSON.stringify(ebooks));
        return ebook;
    },
    
    updateEbook: function(id, ebook) {
        const ebooks = this.getEbooks();
        const index = ebooks.findIndex(e => e.id == id);
        if (index !== -1) {
            ebooks[index] = { ...ebooks[index], ...ebook, id };
            localStorage.setItem('tmcEbooks', JSON.stringify(ebooks));
            return ebooks[index];
        }
        return null;
    },
    
    deleteEbook: function(id) {
        const ebooks = this.getEbooks().filter(e => e.id != id);
        localStorage.setItem('tmcEbooks', JSON.stringify(ebooks));
    },
    
    // Links Management
    getLinks: function() {
        this.init();
        return JSON.parse(localStorage.getItem('tmcLinks') || '[]');
    },
    
    addLink: function(link) {
        const links = this.getLinks();
        link.id = Math.max(...links.map(l => l.id || 0), 0) + 1;
        links.push(link);
        localStorage.setItem('tmcLinks', JSON.stringify(links));
        return link;
    },
    
    updateLink: function(id, link) {
        const links = this.getLinks();
        const index = links.findIndex(l => l.id == id);
        if (index !== -1) {
            links[index] = { ...links[index], ...link, id };
            localStorage.setItem('tmcLinks', JSON.stringify(links));
            return links[index];
        }
        return null;
    },
    
    deleteLink: function(id) {
        const links = this.getLinks().filter(l => l.id != id);
        localStorage.setItem('tmcLinks', JSON.stringify(links));
    },

    // People Records Management
    getPeople: function() {
        this.init();
        return JSON.parse(localStorage.getItem('tmcPeople') || '[]');
    },

    addPerson: function(person) {
        const people = this.getPeople();
        person.id = Math.max(...people.map(p => p.id || 0), 0) + 1;
        people.push(person);
        localStorage.setItem('tmcPeople', JSON.stringify(people));
        return person;
    },

    updatePerson: function(id, person) {
        const people = this.getPeople();
        const index = people.findIndex(p => p.id == id);
        if (index !== -1) {
            people[index] = { ...people[index], ...person, id };
            localStorage.setItem('tmcPeople', JSON.stringify(people));
            return people[index];
        }
        return null;
    },

    deletePerson: function(id) {
        const people = this.getPeople().filter(p => p.id != id);
        localStorage.setItem('tmcPeople', JSON.stringify(people));
    },

    // Images Management
    getAllImages: function() {
        this.init();
        return JSON.parse(localStorage.getItem('tmcImages') || '[]');
    },

    addImage: function(image) {
        const images = this.getAllImages();
        if (!image.id) {
            image.id = Date.now().toString();
        }
        images.push(image);
        localStorage.setItem('tmcImages', JSON.stringify(images));
        return image;
    },

    deleteImage: function(id) {
        const images = this.getAllImages().filter(img => img.id != id);
        localStorage.setItem('tmcImages', JSON.stringify(images));
    },

    getImageById: function(id) {
        const images = this.getAllImages();
        return images.find(img => img.id == id);
    },

    updateImageCategory: function(id, category) {
        const images = this.getAllImages();
        const index = images.findIndex(img => img.id == id);
        if (index !== -1) {
            images[index].category = category;
            localStorage.setItem('tmcImages', JSON.stringify(images));
            return images[index];
        }
        return null;
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    AdminData.init();
});
