# Admin Panel - The Metropolitan Church

## Overview

The Admin Panel is a separate, password-protected interface where you can manage all content displayed on The Metropolitan Church website. All changes made in the admin panel are automatically synchronized with the main website using browser localStorage.

## Access the Admin Panel

1. Navigate to: `admin/login.html`
2. Use the demo credentials:
   - **Username:** `admin`
   - **Password:** `password`

## Features

### Dashboard
- View statistics for all content sections
- Quick access to add new content
- Overview of all available features

### Messages Management
- Add new messages/sermons
- Edit existing messages
- Delete messages
- Set custom gradients for visual appeal

### Videos Management
- Upload video titles and descriptions
- Add video URLs (YouTube, Vimeo, etc.)
- Edit and delete videos
- Track all video content

### Songs Management
- Manage your worship song library
- Add song titles and artist names
- Organize songs easily
- Edit or remove songs

### E-Books Management
- Upload e-book titles and descriptions
- Add download links
- Manage resource materials
- Track all available resources

### Links Management
- Organize external resource links
- Add links to helpful websites
- Manage church partner websites
- Quick edit and delete functionality

### Radio Broadcasts
- Configure broadcast settings
- Set broadcast title and description
- Add streaming URL
- Set broadcast schedule

## How It Works

### Data Storage
All content is stored in the browser's localStorage, which means:
- Data persists across sessions
- No backend server required
- Fast and instant synchronization
- Works completely offline
All content is stored on the server in `data/store.json`, which means:
- Data is shared across all users and devices
- Changes persist after deployment
- The main website always reads the latest saved content
- A running Node server is required

### Content Synchronization
When you make changes in the admin panel:
1. Data is saved to the shared backend API
2. Main website automatically reads from the API
3. Changes appear on the main site after refresh
4. No browser-only content store is used

## Important Notes

⚠️ **Before Using in Production:**
1. Change the admin credentials in `admin/login.html`
2. Implement proper authentication system
3. Add backup mechanism for data
4. Consider adding export/import functionality
5. Set up a proper backend for persistent storage

## File Structure

```
admin/
├── index.html                 # Dashboard
├── login.html                # Login page
├── messages.html             # Manage messages
├── videos.html               # Manage videos
├── songs.html                # Manage songs
├── ebooks.html               # Manage e-books
├── links.html                # Manage links
├── radio.html                # Configure radio
├── admin-data.js             # Data management library
├── admin-styles.css          # Admin panel styles
└── README.md                 # This file
```

## Usage Instructions

### Adding Content
1. Go to the relevant management page (e.g., Messages, Videos, etc.)
2. Click "Add New [Item]" button
3. Fill in the required fields
4. Click "Save [Item]"
5. The item appears immediately on the main website

### Editing Content
1. Find the item in the list
2. Click the "Edit" button
3. Modify the information
4. Click "Save [Item]"

### Deleting Content
1. Find the item in the list
2. Click the "Delete" button
3. Confirm the deletion
4. Item is removed immediately

## Tips

- **Search the Main Site:** Use the search bars on each page to test your content visibility
- **Keep Descriptions Short:** Better for mobile display
- **Update Regularly:** Keep your content fresh and engaging
- **Check Link URLs:** Ensure all external links are working correctly
- **Test Videos:** Verify that video URLs embed correctly on the main site

## Technical Details

### localStorage Keys
### Server Data Store
- `data/store.json` - Stores messages, videos, songs, ebooks, links, people, images, and radio settings

### Data Structure Example
```javascript
// Message
{
    id: 1,
    title: "Sermon Title",
    description: "Sermon description",
    link: "https://example.com",
    image: "linear-gradient(135deg, #abb400 0%, #ffffff 100%)"
}

// Video
{
    id: 1,
    title: "Video Title",
    description: "Video description",
    videoUrl: "https://youtube.com/watch?v=...",
    image: "linear-gradient(...)"
}
```

## Security Considerations

Current implementation is for **demo/development purposes only**. For production:

1. **Authentication:** Implement proper user authentication
2. **Authorization:** Control access by user roles
3. **Data Encryption:** Encrypt sensitive data
4. **Backup System:** Regular automated backups
5. **Audit Trail:** Log all changes with timestamps
6. **API Protection:** Use proper API authentication if integrating backend

## Support

For issues or questions:
1. Check the main website to verify changes are reflected
2. Clear browser cache and reload
3. Check browser console for any error messages
4. Verify localStorage is enabled in browser

## Future Enhancements

- Add image upload functionality
- Implement database backend
- Add user role management
- Create content scheduling
- Add analytics tracking
- Email notifications
- Content version history
- Multi-language support

---

**Last Updated:** May 2026
**Admin Panel Version:** 1.0
