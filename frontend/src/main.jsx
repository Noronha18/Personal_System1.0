import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // <--- Garanta que está importando o App.jsx correto
import './index.css' // <--- Garanta que o Tailwind está sendo carregado aqui

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
