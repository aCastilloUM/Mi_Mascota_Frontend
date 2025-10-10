import "./styles/global.css";
import "./styles/datepicker-custom.css";
import "./styles/dropdown-custom.css";
import "./styles/scrollbar.css";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
