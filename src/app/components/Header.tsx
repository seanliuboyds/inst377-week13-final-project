'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface SearchWeaponResult {
  category: string;
  icon: string;
  id: string;
  name: string;
}

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isClosing, setIsSearchClosing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchWeaponResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Focus the big input when modal opens
  useEffect(() => {
    if (isSearchOpen) {
      inputRef.current?.focus();
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden';
      }
    } else {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'unset';
      }
      setQuery('');
      setResults([]);
    }
  }, [isSearchOpen]);

  // Debounced Search Logic
  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/weapons/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
        console.log("Search Results:", data.results);
      } catch (err) {
        console.error("Search Error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const closeSearch = () => {
    setIsSearchClosing(true);
    // Wait for the fade-out animation to finish (0.25s) before unmounting
    setTimeout(() => {
      setIsSearchOpen(false);
      setIsSearchClosing(false);
    }, 250); 
  };

  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        closeSearch();
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isSearchOpen]);

  // Handle clicking ANYWHERE on the screen (overlay)
  const handleOverlayClick = () => {
    closeSearch();
  };

  const trackWeaponSelection = (weapon: SearchWeaponResult) => {
    const payload = JSON.stringify({
      category: weapon.category,
      hash: Number(weapon.id),
      icon: weapon.icon,
      name: weapon.name,
    });

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/weapons/trending', blob);
      return;
    }

    void fetch('/api/weapons/trending', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
      keepalive: true,
    });
  };

  if (!mounted) return null;

  return (
    <>
      <header className="site-header">
        <div className="header-left">
          <Link href="/" className="logo-link">
            MIDA Mega Tool
          </Link>
        </div>

        {/* Small trigger search bar */}
        <div className="main-search-bar" onClick={() => setIsSearchOpen(true)}>
          <span className="search-icon">🔍</span>
          <span style={{ color: '#666', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
            SEARCH ARSENAL...
          </span>
        </div>

        <nav className="header-right">
          <Link href="/weapon-lab" className="nav-link">WEAPONS</Link>
          <Link href="/manifest-lab" className="nav-link">MANIFEST</Link>
          <Link href="/how-to" className="nav-link">HOW TO</Link>
          <Link href="/about" className="nav-link">ABOUT</Link>
          <div className="user-avatar-placeholder" />
        </nav>
      </header>

      {/* The Big Search Modal */}
      {isSearchOpen && (
        <div 
          className={`search-overlay ${isClosing ? 'closing' : ''}`} 
          onClick={handleOverlayClick}
          style={{ cursor: 'pointer' }}
        >
          <div 
            className="modal-search-container" 
            ref={modalRef} 
            onClick={(e) => e.stopPropagation()}
            style={{ cursor: 'default' }}
          >
            <div className="big-search-box">
              <span style={{ fontSize: '1.5rem' }}>🔍</span>
              <input 
                ref={inputRef}
                type="text" 
                placeholder="SEARCH FOR WEAPONS..." 
                className="big-search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="search-results-container">
                {isLoading && (
                  <div className="loading-state loading-state-animated">
                    <span className="loading-spinner" aria-hidden="true" />
                    <span>Searching Archive...</span>
                  </div>
                )}
                
                {results.map((weapon) => (
                  <Link 
                    key={weapon.id} 
                    href={`/weapon-lab/${weapon.id}`} 
                    className="weapon-item-link"
                    onClick={() => {
                      trackWeaponSelection(weapon);
                      closeSearch();
                    }}
                  >
                    <div className="weapon-icon-container">
                      <img src={weapon.icon} alt={weapon.name} width={40} height={40} />
                    </div>
                    <div className="weapon-text-stack">
                      <div className="weapon-name">{weapon.name}</div>
                      <div className="weapon-category">{weapon.category}</div>
                    </div>
                    <div className="hover-arrow">→</div>
                  </Link>
                ))}

                {query.length >= 3 && results.length === 0 && !isLoading && (
                   <div className="no-results">No weapons found matching "{query}"</div>
                )}
            </div>

            <div className="modal-hint">Click outside or press ESC to close</div>
          </div>
        </div>
      )}
    </>
  );
}
