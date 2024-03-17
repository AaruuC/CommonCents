import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const root = document.getElementById('app');
createRoot(root).render(
    <BrowserRouter>
            <App />
    </BrowserRouter>
);