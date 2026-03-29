import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Menu, X, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Navbar = ({ onCartOpen }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount } = useCart();

  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-xl z-50 border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center shadow-md flex-shrink-0" style={{ backgroundColor: '#E0A600' }}>
            <Star size={14} className="md:w-4 md:h-4" fill="#fff" stroke="#fff" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-base sm:text-lg md:text-xl font-display font-black leading-none tracking-tight text-black truncate">Starfruit Tees</span>
            <span className="text-[7px] md:text-[8px] font-medium text-[#555] uppercase tracking-[0.2em] mt-0.5">House of Starfruit</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6 font-medium text-[10px] uppercase tracking-widest text-[#333]">
          <Link to="/" className="hover:text-black transition-colors">DROPS</Link>
          <Link to="/series/legend" className="hover:text-black transition-colors">LEGEND</Link>
          <Link to="/series/stadium" className="hover:text-black transition-colors">STADIUM</Link>
          <Link to="/#about" className="hover:text-black transition-colors">THE HOUSE</Link>
          <Link to="/admin" className="hover:text-black transition-colors">ADMIN</Link>
          <button
            onClick={() => window.open('https://wa.me/918720951721', '_blank')}
            className="bg-black text-white px-5 py-2.5 rounded-full hover:bg-yellow-400 hover:text-black transition-all duration-300 flex items-center gap-2"
          >
            Contact
          </button>
          <button
            onClick={onCartOpen}
            className="relative flex items-center gap-1.5 border-2 border-black text-black px-4 py-2 rounded-full hover:bg-black hover:text-white transition-all duration-300"
          >
            <ShoppingBag size={14} />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 text-black rounded-full text-[9px] font-black flex items-center justify-center leading-none">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 px-6 py-4 flex flex-col gap-4">
          <Link to="/" onClick={() => setIsMenuOpen(false)} className="font-bold uppercase tracking-widest text-xs">Drops</Link>
          <Link to="/series/legend" onClick={() => setIsMenuOpen(false)} className="font-bold uppercase tracking-widest text-xs">Legend Series</Link>
          <Link to="/series/stadium" onClick={() => setIsMenuOpen(false)} className="font-bold uppercase tracking-widest text-xs">Stadium Series</Link>
          <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="font-bold uppercase tracking-widest text-xs">Admin</Link>
          <button
            onClick={() => { setIsMenuOpen(false); onCartOpen?.(); }}
            className="font-bold uppercase tracking-widest text-xs text-left flex items-center gap-2"
          >
            <ShoppingBag size={13} /> Cart {cartCount > 0 && `(${cartCount})`}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
