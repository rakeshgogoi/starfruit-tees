import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Admin from './pages/Admin.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import SeriesPage from './pages/SeriesPage.jsx'
import Policies from './pages/Policies.jsx'
import { CartProvider } from './context/CartContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/series/:slug" element={<SeriesPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/policies" element={<Policies />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  </StrictMode>,
)
