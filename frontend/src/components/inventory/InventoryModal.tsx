"use client";

interface InventoryItem {
  id: string;
  quantity: number;
  item: {
    id: string;
    name: string;
    description: string;
    type: string;
    effectValue: number;
  };
}

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
}

export default function InventoryModal({ isOpen, onClose, inventory }: InventoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-800 border-2 border-blue-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-blue-900/40 p-4 border-b border-blue-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-blue-400 flex items-center gap-2">
            <span>🎒</span> Sailbag
          </h2>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-red-400 transition-colors bg-zinc-900 w-8 h-8 rounded-full flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 min-h-[300px]">
          {inventory.length === 0 ? (
             <div className="text-center p-8 text-zinc-500 font-medium h-full flex items-center justify-center">
                Your sailbag is empty. Visit the shop!
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {inventory.map(invItem => (
                <div key={invItem.id} className="bg-zinc-900 border border-zinc-700 p-3 rounded-lg relative group">
                  <div className="absolute -top-2 -right-2 bg-amber-500 text-black font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md z-10">
                    {invItem.quantity}
                  </div>
                  
                  <div className="h-16 bg-zinc-800 rounded mb-2 flex items-center justify-center text-3xl">
                     {invItem.item.type === 'WEAPON' && '🗡️'}
                     {invItem.item.type === 'CONSUMABLE' && '🍖'}
                     {invItem.item.type === 'KEY_ITEM' && '🧭'}
                  </div>

                  <h3 className="font-bold text-blue-300 text-sm truncate">{invItem.item.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2" title={invItem.item.description}>
                    {invItem.item.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
