import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import App from './App.jsx'
import './index.css'

// Thiết lập base URL cho axios
import axios from 'axios'

// Tự động detect environment
const isDevelopment = import.meta.env.DEV;
const baseURL = isDevelopment 
  ? 'http://localhost:5000' 
  : window.location.origin; // Sẽ dùng domain hiện tại trong production

axios.defaults.baseURL = baseURL;
console.log('🔗 API Base URL:', baseURL);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
