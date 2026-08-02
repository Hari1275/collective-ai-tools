import { useState, useEffect, useCallback } from 'react';

export function useFavorites(type: 'tool' | 'mcp' | 'prompt' | 'skill' | 'repo') {
  // Use backward-compatible key for tools, otherwise use generic namespaced key
  const storageKey = type === 'tool' ? 'favoriteTools' : `favorites_${type}`;

  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const loadFavorites = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setFavorites(new Set(JSON.parse(stored)));
      }
    } catch (e) {
      console.error('Failed to load favorites', e);
    }
  }, [storageKey]);

  useEffect(() => {
    loadFavorites();
    
    const handleUpdate = () => loadFavorites();
    window.addEventListener('favorites-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate); // For cross-tab sync
    
    return () => {
      window.removeEventListener('favorites-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadFavorites]);

  const toggleFavorite = (idOrName: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(idOrName)) {
      newFavorites.delete(idOrName);
    } else {
      newFavorites.add(idOrName);
    }
    
    setFavorites(newFavorites);
    localStorage.setItem(storageKey, JSON.stringify(Array.from(newFavorites)));
    // Dispatch custom event to notify other components in the same tab
    window.dispatchEvent(new Event('favorites-updated'));
  };

  const isFavorite = (idOrName: string) => favorites.has(idOrName);

  return { favorites, toggleFavorite, isFavorite };
}

export function useAllFavorites() {
  const [allFavs, setAllFavs] = useState<Record<string, Set<string>>>({});

  const loadAll = useCallback(() => {
    const types = ['tool', 'mcp', 'prompt', 'skill', 'repo'];
    const newFavs: Record<string, Set<string>> = {};
    for (const t of types) {
      const key = t === 'tool' ? 'favoriteTools' : `favorites_${t}`;
      try {
        const stored = localStorage.getItem(key);
        newFavs[t] = stored ? new Set(JSON.parse(stored)) : new Set();
      } catch (e) {
        console.error('Failed to load favorites for', t, e);
      }
    }
    setAllFavs(newFavs);
  }, []);

  useEffect(() => {
    loadAll();
    const handleUpdate = () => loadAll();
    window.addEventListener('favorites-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('favorites-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadAll]);

  const isFavoriteAny = (type: string, idOrName: string) => {
    return allFavs[type]?.has(idOrName) || false;
  };

  return { isFavoriteAny };
}
