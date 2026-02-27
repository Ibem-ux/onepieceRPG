"use client";

import { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';
import IslandMap from '@/components/map/IslandMap';
import AuthScreen from '@/components/auth/AuthScreen';
import CharacterCreationScreen from '@/components/character/CharacterCreationScreen';
import ShopModal from '@/components/shop/ShopModal';
import InventoryModal from '@/components/inventory/InventoryModal';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [character, setCharacter] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  // Initial load: check for token and fetch character
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      fetchCharacter(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCharacter = async (authToken: string) => {
    try {
      // First fetch the character
      const charRes = await fetch('http://localhost:4000/api/character', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (charRes.ok) {
        const charData = await charRes.json();
        setCharacter(charData.character);
        
        // Then fetch the full inventory for the character
        const invRes = await fetch('http://localhost:4000/api/inventory', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (invRes.ok) {
            const invData = await invRes.json();
            setInventory(invData.inventory);
        }

      } else if (charRes.status === 404) {
        setCharacter(null); // Needs to create character
      } else {
        // Token might be invalid/expired
        handleLogout();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Socket connection manager
  useEffect(() => {
    if (!token || !character) return;

    socket.connect();
    function onConnect() { setIsConnected(true); }
    function onDisconnect() { setIsConnected(false); }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.disconnect();
    };
  }, [token, character]);

  const handleLoginSuccess = (newToken: string, loggedInUser: any) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setToken(newToken);
    setUser(loggedInUser);
    setLoading(true);
    fetchCharacter(newToken);
  };

  const handleCharacterCreated = (newCharacter: any) => {
    setCharacter(newCharacter);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setCharacter(null);
    setInventory([]);
  };

  const handlePurchaseSuccess = async (updatedBerries: number) => {
      // Optimistically update berries
      setCharacter((prev: any) => ({ ...prev, berries: updatedBerries }));
      
      // Re-fetch inventory to get the latest items and quantities
      if (token) {
          try {
              const res = await fetch('http://localhost:4000/api/inventory', {
                  headers: { 'Authorization': `Bearer ${token}` }
              });
              if (res.ok) {
                  const data = await res.json();
                  setInventory(data.inventory);
              }
          } catch (e) { console.error("Error refreshing inventory", e); }
      }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-900 text-white font-sans">
        <h1 className="text-2xl font-bold text-amber-500 animate-pulse">Loading Grand Line...</h1>
      </main>
    );
  }

  // Not logged in -> Show Login/Register
  if (!token) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-zinc-900 text-white font-sans p-8">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 text-amber-500 tracking-wider">One Piece MMO</h1>
          <p className="text-zinc-400 text-lg">Your adventure begins here.</p>
        </div>
        <AuthScreen onSuccess={handleLoginSuccess} />
      </main>
    );
  }

  // Logged in but no character -> Show Character Creation
  if (token && !character) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-zinc-900 text-white font-sans p-8">
        <CharacterCreationScreen token={token} onSuccess={handleCharacterCreated} />
        <button onClick={handleLogout} className="mt-8 text-zinc-500 hover:text-red-400 text-sm underline">
          Cancel & Logout
        </button>
      </main>
    );
  }

  // Fully logged in and character exists -> Main Game UI
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-zinc-900 text-white font-sans p-2 sm:p-8 relative">
      
      <div className="w-full max-w-6xl flex justify-between items-center mb-6 px-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-amber-500">One Piece MMO</h1>
        <button onClick={handleLogout} className="text-zinc-400 hover:text-red-400 text-sm font-semibold transition-colors bg-zinc-800 px-4 py-2 rounded-md">
          Logout
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start justify-center w-full max-w-6xl">
        {/* Play Area */}
        <div className="flex-1 w-full flex justify-center">
          <IslandMap />
        </div>

        {/* Sidebar / Status */}
        <div className="w-full md:w-80 p-0 border rounded-xl shadow-lg bg-zinc-800 border-zinc-700 overflow-hidden flex flex-col">
          
          <div className="bg-zinc-900 p-4 border-b border-zinc-700">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-2xl font-bold text-amber-500">{character.name}</h2>
              <span className={`text-xs px-2 py-1 rounded-full font-bold
                    ${character.faction === 'PIRATE' ? 'bg-amber-900/50 text-amber-500 border border-amber-700' : ''}
                    ${character.faction === 'MARINE' ? 'bg-blue-900/50 text-blue-400 border border-blue-700' : ''}
                    ${character.faction === 'BOUNTY_HUNTER' ? 'bg-green-900/50 text-green-400 border border-green-700' : ''}
                `}>
                {character.faction}
              </span>
            </div>
            <p className="text-sm text-zinc-400">Level {character.level}</p>
          </div>

          <div className="p-4 space-y-4">
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Wealth</p>
                <div className="flex items-center gap-2">
                    <span className="text-amber-500 text-lg">💰</span>
                    <span className="font-mono text-lg font-semibold">{character.berries.toLocaleString()} Berries</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Stats</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-zinc-900 p-2 rounded border border-zinc-700">
                        <span className="text-red-400 block text-xs mb-1">Health</span>
                        <span className="font-mono font-bold">{character.health}/{character.health}</span>
                    </div>
                    <div className="bg-zinc-900 p-2 rounded border border-zinc-700">
                        <span className="text-blue-400 block text-xs mb-1">Stamina</span>
                        <span className="font-mono font-bold">{character.stamina}/{character.stamina}</span>
                    </div>
                </div>
              </div>
              
              {/* --- ACTION BUTTONS --- */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                  <button 
                    onClick={() => setIsInventoryOpen(true)}
                    className="bg-blue-900/50 hover:bg-blue-800/50 border border-blue-700 text-blue-200 py-2 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                      <span>🎒</span> Bag
                  </button>
                  <button 
                    onClick={() => setIsShopOpen(true)}
                    className="bg-amber-900/50 hover:bg-amber-800/50 border border-amber-700 text-amber-200 py-2 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                      <span>🏪</span> Shop
                  </button>
              </div>

              <div className="pt-2 border-t border-zinc-700 mt-2">
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2">Location</p>
                <p className="font-bold text-md text-white">{character.mapRegion}: Windmill Village</p>
              </div>

              <div className="pt-0">
                <div className="flex items-center gap-2 mt-4">
                <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${isConnected ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'}`}></div>
                <span className={isConnected ? 'text-green-400 font-medium text-xs' : 'text-red-400 font-medium text-xs'}>
                    {isConnected ? 'Server Online' : 'Server Offline'}
                </span>
                </div>
              </div>
          </div>

        </div>
      </div>

      {/* --- MODALS --- */}
      <ShopModal 
        token={token}
        isOpen={isShopOpen} 
        onClose={() => setIsShopOpen(false)} 
        onPurchaseSuccess={handlePurchaseSuccess}
      />
      <InventoryModal 
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        inventory={inventory}
      />
    </main>
  );
}
