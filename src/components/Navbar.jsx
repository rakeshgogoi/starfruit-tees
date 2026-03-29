import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import logoSrc from '../assets/SC_Logo_Colored.png';

const Navbar = ({ onCartOpen }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount } = useCart();

  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-xl z-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoSrc} alt="Starfruit Tees" className="h-12 md:h-16 w-auto object-contain flex-shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-lg sm:text-xl md:text-2xl font-display font-black leading-none tracking-tight text-black truncate">Starfruit Tees</span>
            <span className="text-[8px] md:text-[9px] font-medium text-[#555] uppercase tracking-[0.2em] mt-0.5">House of Starfruit</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-7 font-bold text-xs uppercase tracking-widest text-[#333]">
          <Link to="/" className="hover:text-black transition-colors">Drops</Link>
          <Link to="/series/legend" className="hover:text-black transition-colors">Legend</Link>
          <Link to="/series/stadium" className="hover:text-black transition-colors">Stadium</Link>
          <Link to="/#about" className="hover:text-black transition-colors">The House</Link>
          <Link to="/admin" className="hover:text-black transition-colors">Admin</Link>
          <button
            onClick={() => window.open('https://wa.me/916362376160', '_blank')}
            className="bg-black text-white text-xs px-5 py-2.5 rounded-full hover:bg-yellow-400 hover:text-black transition-all duration-300 flex items-center gap-2"
          >
            Contact
          </button>
          <button
            onClick={onCartOpen}
            className="relative flex items-center gap-1.5 border-2 border-black text-black text-xs px-4 py-2.5 rounded-full hover:bg-black hover:text-white transition-all duration-300"
          >
            <ShoppingBag size={15} />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 text-black rounded-full text-[9px] font-black flex items-center justify-center leading-none">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 px-6 py-5 flex flex-col gap-5">
          <Link to="/" onClick={() => setIsMenuOpen(false)} className="font-bold uppercase tracking-widest text-sm">Drops</Link>
          <Link to="/series/legend" onClick={() => setIsMenuOpen(false)} className="font-bold uppercase tracking-widest text-sm">Legend Series</Link>
          <Link to="/series/stadium" onClick={() => setIsMenuOpen(false)} className="font-bold uppercase tracking-widest text-sm">Stadium Series</Link>
          <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="font-bold uppercase tracking-widest text-sm">Admin</Link>
          <button
            onClick={() => { setIsMenuOpen(false); onCartOpen?.(); }}
            className="font-bold uppercase tracking-widest text-sm text-left flex items-center gap-2"
          >
            <ShoppingBag size={15} /> Cart {cartCount > 0 && `(${cartCount})`}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
