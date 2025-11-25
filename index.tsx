import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// In some CDN environments, ReactDOM might be the default export or a named export.
// We try to use createRoot from the imported module.
const createRoot = ReactDOM.createRoot || (ReactDOM as any).default?.createRoot;

if (createRoot) {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
} else {
    console.error("ReactDOM.createRoot is not available. Check import map.");
}