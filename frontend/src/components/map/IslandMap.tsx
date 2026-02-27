"use client";

import { useState, useEffect, useMemo } from 'react';
import { windmillVillageMap, getTileImage, isPassable, TileType } from '@/lib/mapData';

// Custom hook to remove violet/magenta (#FF00FF) chroma key backgrounds on the fly
function useChromaKey(srcList: string[]) {
    const [processed, setProcessed] = useState<Record<string, string>>({});

    useEffect(() => {
        srcList.forEach(src => {
            const img = new Image();
            img.crossOrigin = "Anonymous"; // Crucial to prevent tainted canvas errors in some Next.js setups
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                if (!ctx) return;

                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    
                    // Detect Violet/Magenta/Purple
                    // Red and Blue must be reasonably high and similar, and Green must be distinctly lower.
                    const isPurple = r > 100 && b > 100 && g < r - 40 && g < b - 40 && Math.abs(r - b) < 80;

                    if (isPurple) {
                        data[i + 3] = 0; // Make pixel fully transparent
                    }
                }
                ctx.putImageData(imageData, 0, 0);
                setProcessed(prev => ({ ...prev, [src]: canvas.toDataURL() }));
            };
            img.src = src;
        });
    }, [srcList.join(',')]);

    return processed;
}

export default function IslandMap() {
    // Player starting position (centered on the path in Windmill Village)
    const [playerPos, setPlayerPos] = useState({ x: 6, y: 10 });

    const spritesToProcess = useMemo(() => ['/sprites/tree.png'], []);
    const chromaSprites = useChromaKey(spritesToProcess);

    const handleMove = (dx: number, dy: number) => {
        const newX = playerPos.x + dx;
        const newY = playerPos.y + dy;

        // Check bounds
        if (newY < 0 || newY >= windmillVillageMap.length) return;
        if (newX < 0 || newX >= windmillVillageMap[newY].length) return;

        // Check collision
        const targetTile = windmillVillageMap[newY][newX];
        if (isPassable(targetTile)) {
            setPlayerPos({ x: newX, y: newY });

            // Port check interaction
            if (targetTile === TileType.PORT) {
                // Here we would trigger the 'Board Ship' UI later
                console.log("Stepped on port! Ready to set sail.");
            }
        }
    };

    // Keyboard controls
    const handleKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                handleMove(0, -1);
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                handleMove(0, 1);
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                handleMove(-1, 0);
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                handleMove(1, 0);
                break;
        }
    };

    return (
        <div
            className="flex flex-col items-center justify-center p-4 outline-none"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            autoFocus
        >
            <div className="mb-4 bg-zinc-800 p-4 rounded-lg shadow-xl text-center">
                <h2 className="text-2xl font-bold text-amber-500 mb-2">Windmill Village</h2>
                <p className="text-zinc-300 text-sm">Use WASD or Arrow Keys to move</p>
            </div>

            <div className="inline-block border-4 border-zinc-800 rounded-lg shadow-2xl overflow-hidden bg-zinc-900">
                {windmillVillageMap.map((row, y) => (
                    <div key={y} className="flex">
                        {row.map((tileType, x) => {
                            const isPlayerHere = playerPos.x === x && playerPos.y === y;
                            const isObstacle = tileType === TileType.TREE || tileType === TileType.BUILDING;
                            const baseImage = isObstacle ? getTileImage(TileType.GRASS) : getTileImage(tileType);
                            const obstacleImage = isObstacle ? getTileImage(tileType) : null;
                            const finalObstacleImage = obstacleImage && chromaSprites[obstacleImage] ? chromaSprites[obstacleImage] : obstacleImage;
                            
                            return (
                                <div
                                    key={`${x}-${y}`}
                                    className={`w-10 h-10 sm:w-12 sm:h-12 border border-black/10 relative transition-all duration-200 cursor-pointer hover:opacity-90 overflow-visible`}
                                    style={{
                                        backgroundImage: `url('${baseImage}')`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        imageRendering: 'pixelated'
                                    }}
                                    onClick={() => {
                                        const isAdjacent = Math.abs(playerPos.x - x) + Math.abs(playerPos.y - y) === 1;
                                        if (isAdjacent) {
                                            handleMove(x - playerPos.x, y - playerPos.y);
                                        }
                                    }}
                                >
                                    {/* Layer obstacle on top of grass if it's a tree/building */}
                                    {finalObstacleImage && (
                                        <div 
                                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[180%] h-[180%] z-20 pointer-events-none drop-shadow-md"
                                            style={{
                                                backgroundImage: `url('${finalObstacleImage}')`,
                                                backgroundSize: 'contain', 
                                                backgroundPosition: 'center bottom',
                                                backgroundRepeat: 'no-repeat',
                                                imageRendering: 'pixelated'
                                            }}
                                        />
                                    )}

                                    {/* Player Sprite */}
                                    {isPlayerHere && (
                                        <div className="absolute inset-0 z-10 flex items-center justify-center drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
                                            <div
                                                className="w-12 h-12 sm:w-14 sm:h-14 relative -mt-6"
                                                style={{
                                                    backgroundImage: `url('/sprites/player.png')`,
                                                    backgroundSize: 'contain',
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundPosition: 'center bottom',
                                                    transform: 'scale(0.5)',
                                                    transformOrigin: 'center bottom',
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {windmillVillageMap[playerPos.y][playerPos.x] === TileType.PORT && (
                <div className="mt-6 bg-amber-900 text-amber-100 px-6 py-3 rounded-md shadow-lg font-bold animate-pulse cursor-pointer hover:bg-amber-800">
                    ⚓ Board Ship (World Map)
                </div>
            )}
        </div>
    );
}
