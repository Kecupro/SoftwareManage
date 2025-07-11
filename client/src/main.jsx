import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import App from './App.jsx'
import './index.css'

// Thiết lập base URL cho axios
import axios from 'axios'

// Force dùng domain hiện tại cho production
const baseURL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : window.location.origin;

axios.defaults.baseURL = baseURL;
console.log('🔗 API Base URL:', baseURL);
console.log('🌐 Current hostname:', window.location.hostname);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
