# Image Upload Feature Guide

## Overview
The Metropolitan Church website now includes a dedicated **Image Upload** feature in the admin panel. This allows you to upload actual images instead of just using color gradients for content cards.

## Accessing Image Management

1. Log into the Admin Panel at `admin/login.html`
2. Click on **Images** in the navigation menu
3. You'll see the Image Management page with upload capabilities

## How to Upload Images

### Method 1: Drag and Drop
1. Go to the Image Management page
2. Drag and drop image files directly onto the blue upload area
3. Images are automatically processed and stored

### Method 2: Click to Browse
1. Click anywhere on the upload area
2. Select one or multiple image files from your computer
3. Click "Open" to upload

## Supported Image Formats
- ✅ JPG/JPEG
- ✅ PNG
- ✅ GIF
- ✅ WebP
- ❌ Maximum file size: 5MB per image

## Image Organization

After uploading, images can be organized by category:
- **Messages** - For message/teaching cards
- **Videos** - For video thumbnails
- **E-Books** - For e-book cover images
- **Other** - For miscellaneous images

### To Categorize an Image:
1. Find the image in the uploaded images gallery
2. Click the **Copy ID** button to get the image ID
3. Go to the content page (Messages, E-Books, etc.)
4. When creating/editing content, paste the image ID in the image field
5. The system will automatically display your uploaded image

## Using Images in Content

### For Messages:
1. Go to **Admin → Messages**
2. Add or Edit a Message
3. In the **Image** field, paste the image ID (e.g., `1609876543210`)
4. Save the message
5. The message card will now display your uploaded image

### For E-Books:
1. Go to **Admin → E-Books**
2. Add or Edit an E-Book
3. In the **Image** field, paste the image ID
4. Save the e-book
5. The e-book cover will display your uploaded image

### For Videos (Coming Soon):
1. Go to **Admin → Videos**
2. Add or Edit a Video
3. In the **Image** field, paste the image ID for custom thumbnail
4. Save the video

## Managing Uploaded Images

### View Images
- All images are displayed in a gallery
- Filter by category using the tabs at the top
- Images show file size and upload category

### Copy Image ID
1. Click the **Copy ID** button on any image card
2. The image ID is copied to your clipboard
3. Paste it in your content's image field

### Delete Images
1. Click the **Delete** button on any image card
2. Confirm the deletion when prompted
3. The image is permanently removed
4. Any content using this image will revert to gradient background

## Fallback Behavior

If an image ID is not found or invalid:
- The system automatically falls back to a default gradient
- Content will still display properly
- Default gradient: `linear-gradient(135deg, #abb400 0%, #ffffff 100%)`

## Storage Information

- Images are stored in browser localStorage
- Maximum storage varies by browser (typically 5-10MB)
- For large deployments, consider migrating to cloud storage
- All data persists until manually deleted

## Tips & Best Practices

✅ **DO:**
- Use high-quality, optimized images (compress first)
- Keep images under 5MB for better performance
- Use consistent image dimensions for better appearance
- Organize images by category for easier management
- Back up your images regularly

❌ **DON'T:**
- Upload uncompressed large images
- Use very large resolution images (over 2000px width)
- Upload non-image files (system will reject them)
- Rely solely on images without text fallback

## Image Optimization Tips

Before uploading, optimize your images:

### Using Online Tools:
- [TinyPNG](https://tinypng.com/) - Compress PNG/JPEG
- [Optimizilla](https://imageoptimize.io/) - Quick optimization
- [ImageMagick](https://imagemagick.org/) - Advanced users

### Recommended Dimensions:
- **Message Cards**: 400×300px
- **E-Book Covers**: 300×400px
- **Video Thumbnails**: 320×180px

## Troubleshooting

### Images Not Showing?
1. Verify the image ID is correct (copy it again)
2. Check that the image hasn't been deleted
3. Clear browser cache and reload the page
4. Try re-uploading the image

### Upload Failed?
1. Check file size (must be under 5MB)
2. Verify file format is supported (JPG, PNG, GIF, WebP)
3. Check browser storage isn't full
4. Try a different image file

### Lost Images?
1. Images are stored in browser localStorage
2. Clearing browser data will delete all images
3. We recommend creating backups periodically
4. Consider using a database for larger deployments

## Advanced: Using Both Images and Gradients

You can mix images and gradients:

- **Paste a gradient directly**: `linear-gradient(135deg, #ff0000 0%, #0000ff 100%)`
- **Paste an image ID**: `1609876543210` (numeric ID from uploads)
- **Leave blank**: Uses default gradient

## Future Enhancements

Planned features:
- Batch image upload
- Image cropping/resizing
- Image folder organization
- Cloud storage integration
- CDN delivery for faster loading
- Image optimization on upload

## Support

For issues or feature requests:
1. Check this guide for solutions
2. Review the troubleshooting section
3. Contact your administrator
4. Check browser console for error messages (F12)

---

**Last Updated:** May 2026  
**Version:** 1.0
