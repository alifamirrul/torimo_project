This is a minimal Vite + React scaffold for the Torimo frontend.

Development:
1. cd frontend
2. npm install
3. npm run dev (binds to `http://localhost:5173/` with `--strictPort`)

If you need a different host/port, edit `package.json` or run `vite --host <ip> --port <port>` directly.

The dev server proxies to the Django API at /api/ (you can use CORS during development).

Production build:
1. npm run build
2. copy the produced `dist/` files into `torimoApp/static/frontend/` (or serve separately via CDN)
