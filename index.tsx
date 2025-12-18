import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Augment the global JSX namespace to include React Three Fiber elements.
// This ensures that the TypeScript compiler recognizes 3D elements like <mesh />, <points />, etc.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);