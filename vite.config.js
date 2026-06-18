{
  "name": "mesto",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "devDependencies": {
    "autoprefixer": "^10.5.0",
    "gh-pages": "^6.3.0",
    "postcss-import": "^16.1.1",
    "vite": "^8.0.8"
  }
}
