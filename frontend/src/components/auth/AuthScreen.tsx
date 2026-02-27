"use client";

import { useState } from 'react';

interface AuthScreenProps {
    onSuccess: (token: string, user: any) => void;
}

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const response = await fetch(`http://localhost:4000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            onSuccess(data.token, data.user);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-md mx-auto bg-zinc-800 p-8 rounded-xl shadow-2xl border border-zinc-700">
            <h2 className="text-3xl font-bold text-amber-500 mb-6 text-center">
                {isLogin ? 'Enter the Grand Line' : 'Join the Crew'}
            </h2>

            {error && (
                <div className="w-full bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-md mb-4 text-sm text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div>
                    <label className="block text-zinc-400 text-sm font-bold mb-2">Pirate Name (Username)</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                        placeholder="Monkey D. Luffy"
                        required
                        minLength={3}
                    />
                </div>

                <div>
                    <label className="block text-zinc-400 text-sm font-bold mb-2">Secret Code (Password)</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                        placeholder="••••••••"
                        required
                        minLength={6}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-amber-50 font-bold py-3 px-4 rounded-md shadow-md transition-colors mt-6 disabled:opacity-50"
                >
                    {loading ? 'Setting Sail...' : isLogin ? 'Login' : 'Register'}
                </button>
            </form>

            <div className="mt-6 text-zinc-400 text-sm">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                    onClick={() => { setIsLogin(!isLogin); setError(''); }}
                    className="text-amber-500 hover:text-amber-400 font-semibold underline"
                >
                    {isLogin ? 'Register here' : 'Login here'}
                </button>
            </div>
        </div>
    );
}
