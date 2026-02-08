import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css'; // ✅ Bootstrap CSS

import './App.css'; // ✅ Your custom CSS
import App from './App.jsx'; // ✅ Main app component

console.log("main.jsx is running...");

const rootElement = document.getElementById('root');
console.log("Root element:", rootElement);

if (rootElement) {
  console.log("Creating root and rendering App...");
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} else {
  console.error("Root element not found!");
}
