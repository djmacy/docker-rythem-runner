import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { createRoot } from 'react-dom/client';

// Use createRoot for React 18 and ReactDOM.render for React 17 and below
const root = createRoot(document.getElementById('root'));

root.render(
    <>
        <App/>
    </>
);