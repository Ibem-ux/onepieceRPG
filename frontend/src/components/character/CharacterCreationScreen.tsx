"use client";

import { useState } from 'react';

interface CharacterCreationScreenProps {
    token: string;
    onSuccess: (character: any) => void;
}

export default function CharacterCreationScreen({ token, onSuccess }: CharacterCreationScreenProps) {
    const [name, setName] = useState('');
    const [faction, setFaction] = useState<'PIRATE' | 'MARINE' | 'BOUNTY_HUNTER'>('PIRATE');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:4000/api/character/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, faction })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create character');
            }

            onSuccess(data.character);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[500px] w-full max-w-xl mx-auto bg-zinc-800 p-8 rounded-xl shadow-2xl border border-zinc-700">
            <h2 className="text-3xl font-bold text-amber-500 mb-2 text-center">Create Your Legend</h2>
            <p className="text-zinc-400 text-sm mb-8 text-center">Choose your path in the Grand Line</p>

            {error && (
                <div className="w-full bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-md mb-4 text-sm text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="w-full space-y-6">
                <div>
                    <label className="block text-zinc-400 text-sm font-bold mb-2">Character Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-600 rounded-md py-3 px-4 text-white text-lg focus:outline-none focus:border-amber-500 transition-colors"
                        placeholder="Enter your name..."
                        required
                        minLength={3}
                        maxLength={20}
                    />
                </div>

                <div>
                    <label className="block text-zinc-400 text-sm font-bold mb-4">Choose Faction</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <div
                            onClick={() => setFaction('PIRATE')}
                            className={`cursor-pointer p-4 rounded-lg border-2 transition-all flex flex-col items-center justify-center text-center ${faction === 'PIRATE' ? 'border-amber-500 bg-amber-900/30' : 'border-zinc-600 bg-zinc-900 hover:border-amber-700'}`}
                        >
                            <div className="text-4xl mb-2">🏴‍☠️</div>
                            <h3 className="font-bold text-amber-500 text-lg">Pirate</h3>
                            <p className="text-xs text-zinc-400 mt-1 mt-auto">Seek freedom and treasure.</p>
                        </div>

                        <div
                            onClick={() => setFaction('MARINE')}
                            className={`cursor-pointer p-4 rounded-lg border-2 transition-all flex flex-col items-center justify-center text-center ${faction === 'MARINE' ? 'border-blue-500 bg-blue-900/30' : 'border-zinc-600 bg-zinc-900 hover:border-blue-700'}`}
                        >
                            <div className="text-4xl mb-2">⚓</div>
                            <h3 className="font-bold text-blue-400 text-lg">Marine</h3>
                            <p className="text-xs text-zinc-400 mt-1 mt-auto">Enforce absolute justice.</p>
                        </div>

                        <div
                            onClick={() => setFaction('BOUNTY_HUNTER')}
                            className={`cursor-pointer p-4 rounded-lg border-2 transition-all flex flex-col items-center justify-center text-center ${faction === 'BOUNTY_HUNTER' ? 'border-green-500 bg-green-900/30' : 'border-zinc-600 bg-zinc-900 hover:border-green-700'}`}
                        >
                            <div className="text-4xl mb-2">⚔️</div>
                            <h3 className="font-bold text-green-400 text-lg">Hunter</h3>
                            <p className="text-xs text-zinc-400 mt-1 mt-auto">Work alone for the berries.</p>
                        </div>

                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-amber-50 font-bold py-4 px-4 rounded-md shadow-md transition-colors mt-8 text-lg disabled:opacity-50"
                >
                    {loading ? 'Creating...' : 'Begin Adventure'}
                </button>
            </form>
        </div>
    );
}
