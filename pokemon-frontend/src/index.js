import React from 'react';
import ReactDOM from 'react-dom/client'; // Ou import ReactDOM from 'react-dom'; para versões mais antigas
import { BrowserRouter } from 'react-router-dom'; // <-- Importar
import './index.css'; // Seu CSS global, se houver
import App from './App';
import reportWebVitals from './reportWebVitals'
// import reportWebVitals from './reportWebVitals'; // Se você usa

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* V--- Envolve o App com BrowserRouter ---V */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
    {/* ^--- Fim do BrowserRouter ---^ */}
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
