# The Metropolitan Church, Ibadan - Website

A modern, responsive website for The Metropolitan Church, Ibadan. Built with HTML5, CSS3, and vanilla JavaScript.

## Features

- **Responsive Design** - Works beautifully on desktop, tablet, and mobile devices
- **Modern UI** - Clean, professional design with pink/magenta accent colors
- **Navigation Menu** - Sticky navigation with dropdown support
- **Content Sections**:
  - Teachings & Gospel Messages
  - Radio Broadcasts
  - Videos
  - Worship Songs
  - E-Books & Resources
  - Contact Information
- **Interactive Elements**:
  - Mobile hamburger menu
  - Smooth scrolling navigation
  - Radio player controls
  - Contact form
  - Social media links
- **Accessibility** - Semantic HTML and keyboard navigation support

## Project Structure

```
TMC Church/
├── index.html      - Main website HTML
├── styles.css      - Styling and responsive design
├── script.js       - Interactive functionality
└── README.md       - Documentation (this file)
```

## Getting Started

### Quick Start (No Installation Required)

1. **Open in Browser**
   - Simply open `index.html` in any modern web browser
   - No server or build tools required

2. **Live Development** (Optional - Using VS Code)
   - Install the "Live Server" extension in VS Code
   - Right-click on `index.html` and select "Open with Live Server"
   - Changes will auto-refresh in your browser

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- No dependencies or installation needed

## Customization Guide

### Update Church Information

Edit the following in `index.html`:

- **Church Name & Location**: Update the logo circle text and hero section
- **Contact Details**: Section #contact - add phone, email, service times
- **Media Content**: Replace placeholder titles and descriptions
- **Social Links**: Update footer social media links

### Modify Colors & Branding

Edit the CSS variables in `styles.css` (top of file):

```css
:root {
    --primary-color: #e91e63;      /* Pink/Magenta */
    --primary-dark: #c2185b;       /* Darker shade */
    --dark-bg: #1a1a1a;            /* Navigation background */
    --light-bg: #f5f5f5;           /* Light sections */
    --text-dark: #333;             /* Main text */
    --text-light: #666;            /* Secondary text */
}
```

### Add Your Content

1. **Teachings Section** - Replace placeholder cards with actual teachings
2. **Media Grid** - Update titles, descriptions, and links
3. **Contact Information** - Add real phone, email, address, service times
4. **Footer** - Customize "About Us" text and social media handles

### Add Images

To add church photos, logos, or media thumbnails:

1. Create an `images/` folder in the project
2. Add your images there
3. Reference them in HTML, e.g.:
   ```html
   <img src="images/church-photo.jpg" alt="Church">
   ```

## Features Explained

### Navigation
- **Sticky header** - Stays visible when scrolling
- **Mobile menu** - Hamburger toggle on screens under 768px
- **Dropdown links** - "LINKS" menu has sub-items

### Sections

1. **Hero** - Welcome banner with call-to-action button
2. **Teachings** - Featured teaching cards with gradient backgrounds
3. **Radio** - Audio player interface with volume control
4. **Videos** - Video thumbnail grid with play indicators
5. **Songs** - Worship song cards with album covers
6. **E-Books** - Downloadable resource cards
7. **Contact** - Map-ready location, contact details, and message form
8. **Footer** - Links, social icons, and copyright

## Browser Compatibility

- ✅ Chrome/Chromium (Latest)
- ✅ Firefox (Latest)
- ✅ Safari (Latest)
- ✅ Edge (Latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- **Lightweight** - No frameworks or large dependencies
- **Fast Loading** - Optimized CSS and vanilla JavaScript
- **Mobile Optimized** - Responsive images and touch-friendly
- **SEO Friendly** - Semantic HTML structure

## Next Steps

1. **Personalize Content** - Add church-specific teachings, contact info, images
2. **Connect Services** - Link radio broadcasts, video platforms (YouTube)
3. **Email Integration** - Connect contact form to email service
4. **Domain Setup** - Deploy to web hosting and custom domain
5. **Analytics** - Add Google Analytics for traffic tracking
6. **Social Media** - Link to church social media accounts

## Development Tips

### Adding New Content
- Keep titles concise and descriptive
- Use the existing card layouts for consistency
- Test on mobile devices frequently

### Improving SEO
- Update meta tags in `<head>` of index.html
- Add meaningful image alt text
- Use descriptive link text

### Mobile Testing
- Use browser DevTools (F12) → Toggle Device Toolbar
- Test on actual phones if possible
- Verify all interactive elements work on touch

## Support & Credits

Created with HTML5, CSS3, and JavaScript - no external dependencies.

Designed for The Metropolitan Church, Ibadan, Nigeria.

---

**Version:** 1.0  
**Last Updated:** May 2026  
**Status:** Ready for Customization
