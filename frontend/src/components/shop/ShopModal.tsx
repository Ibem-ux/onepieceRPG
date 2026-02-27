"use client";

import { useState, useEffect } from 'react';

interface Item {
  id: string;
  name: string;
  description: string;
  type: string;
  effectValue: number;
  price: number;
}

interface ShopModalProps {
  token: string;
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess: (updatedBerries: number) => void;
}

export default function ShopModal({ token, isOpen, onClose, onPurchaseSuccess }: ShopModalProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buyingId, setBuyingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchItems();
    }
  }, [isOpen]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:4000/api/inventory/shop');
      const data = await res.json();
      if (res.ok) {
        setItems(data.items);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError('Failed to load shop items');
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (item: Item) => {
    try {
      setBuyingId(item.id);
      setError('');
      
      const res = await fetch('http://localhost:4000/api/inventory/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemId: item.id, quantity: 1 })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Purchase failed');
      }

      // Notify parent to update local berries state and inventory
      onPurchaseSuccess(data.berries);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBuyingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-800 border-2 border-amber-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-amber-900/40 p-4 border-b border-amber-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-amber-500 flex items-center gap-2">
            <span>🏪</span> Merchant
          </h2>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-red-400 transition-colors bg-zinc-900 w-8 h-8 rounded-full flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {error && <div className="bg-red-900/50 text-red-200 p-3 rounded mb-4 text-sm text-center border border-red-500">{error}</div>}
          
          {loading ? (
             <div className="text-center p-8 text-amber-500 animate-pulse">Checking inventory...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map(item => (
                <div key={item.id} className="bg-zinc-900 border border-zinc-700 p-4 rounded-lg flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-amber-400">{item.name}</h3>
                    <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-300">{item.type}</span>
                  </div>
                  
                  <p className="text-sm text-zinc-400 mb-4 flex-1">{item.description}</p>
                  
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-zinc-800">
                    <div className="flex items-center gap-1 font-bold">
                        <span className="text-amber-500">💰</span>
                        <span className="text-white">{item.price}</span>
                    </div>
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={buyingId === item.id}
                      className="bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white px-4 py-2 rounded font-bold text-sm transition-colors"
                    >
                      {buyingId === item.id ? 'Buying...' : 'Buy'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
