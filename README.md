# DevVault - Free Developer Toolkit

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.4-646CFF.svg)](https://vitejs.dev/)

A comprehensive, free online developer toolkit with 8 essential tools for developers. Built with modern web technologies for optimal performance and user experience.

## 🚀 Features

### 🛠️ Developer Tools
- **JSONify** - JSON formatter, validator, and prettifier with real-time validation
- **RegexLab** - Interactive regex tester with live highlighting and match details
- **TokenPeek** - JWT token decoder with header, payload, and signature parsing
- **HashHub** - Hash generator supporting MD5, SHA1, SHA256, SHA512, SHA3, RIPEMD160, and UUID generation
- **APIBox** - Postman-like API request builder and tester
- **GitWizard** - Comprehensive Git commands cheatsheet with search functionality
- **Colorly** - Color palette extractor from images with format conversion
- **Markee** - Live Markdown editor with GitHub Flavored Markdown support

### 🎨 User Experience
- **Responsive Design** - Mobile-first design that works on all devices
- **Dark Mode** - Toggle between light and dark themes
- **Real-time Updates** - Live validation and preview across all tools
- **Copy to Clipboard** - One-click copy functionality throughout the app
- **Export Capabilities** - Download functionality for generated content
- **Offline Ready** - PWA support for offline usage

### ⚡ Performance & SEO
- **Lazy Loading** - Code splitting for optimal loading performance
- **SEO Optimized** - Comprehensive meta tags, structured data, and sitemap
- **PWA Ready** - Progressive Web App with offline support
- **Fast Loading** - Optimized bundle size and efficient rendering
- **Accessibility** - WCAG compliant with proper ARIA labels

## 🏗️ Tech Stack

- **Frontend**: React 19.1.1 with Hooks
- **Build Tool**: Vite 7.1.4
- **Styling**: Tailwind CSS with dark mode support
- **State Management**: Zustand
- **Routing**: React Router v6
- **Icons**: Heroicons
- **SEO**: React Helmet Async
- **Utilities**: Crypto-JS, Marked, Axios

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/devvault/devvault.git
cd devvault

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.jsx      # Main header with navigation
│   ├── Navigation.jsx  # Sidebar navigation
│   ├── SEO.jsx        # SEO meta tags component
│   └── ...
├── pages/              # Tool pages
│   ├── Home.jsx       # Landing page
│   ├── JSONify.jsx    # JSON formatter tool
│   ├── RegexLab.jsx   # Regex tester tool
│   └── ...
├── store/              # State management
│   └── useStore.js    # Zustand store
├── utils/              # Utility functions
│   └── jsonUtils.js   # JSON processing utilities
└── App.jsx            # Main application component
```

## 🔧 SEO & Performance Features

### SEO Optimization
- **Meta Tags**: Comprehensive title, description, keywords, and Open Graph tags
- **Structured Data**: JSON-LD schema for better search engine understanding
- **Sitemap**: XML sitemap for all tool pages (`/sitemap.xml`)
- **Robots.txt**: Search engine crawling instructions (`/robots.txt`)
- **Canonical URLs**: Proper canonical links for each page
- **PWA Manifest**: Web app manifest for mobile installation

### Performance Features
- **Code Splitting**: Lazy loading of route components
- **Bundle Optimization**: Tree shaking and minification
- **Image Optimization**: Responsive images and lazy loading
- **Caching**: Efficient browser caching strategies

## 🌟 Current Status

✅ **Complete Frontend Implementation**
✅ **All 8 Developer Tools Functional**
✅ **Responsive Design & Mobile Support**
✅ **Dark Mode Implementation**
✅ **SEO Optimization**
✅ **Performance Optimization**
✅ **PWA Ready**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Heroicons](https://heroicons.com/) - Icon library

---

Made with ❤️ by the DevVault team
