export enum TileType {
    DEEP_WATER = 0,
    WATER = 1,
    SAND = 2,
    GRASS = 3,
    TREE = 4,
    PATH = 5,
    BUILDING = 6,
    PORT = 7,
}

// 0: Deep Water (impassable)
// 1: Water (impassable)
// 2: Sand (passable)
// 3: Grass (passable)
// 4: Tree (impassable)
// 5: Path (passable)
// 6: Building (impassable)
// 7: Port (special passable - leads to world map)

// A simple 15x15 map for Windmill Village
export const windmillVillageMap: number[][] = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 0],
    [0, 1, 2, 2, 4, 3, 3, 4, 3, 2, 2, 1, 1, 1, 0],
    [0, 1, 2, 3, 4, 4, 3, 4, 4, 3, 2, 1, 1, 1, 0],
    [0, 1, 2, 3, 3, 3, 5, 3, 3, 3, 2, 2, 1, 1, 0],
    [0, 1, 2, 4, 3, 3, 5, 3, 3, 4, 3, 2, 1, 1, 0],
    [0, 1, 2, 4, 3, 3, 5, 3, 3, 4, 3, 2, 1, 1, 0],
    [0, 1, 2, 3, 3, 3, 5, 3, 3, 3, 3, 2, 1, 1, 0],
    [0, 1, 2, 2, 3, 4, 5, 4, 3, 3, 2, 2, 1, 1, 0],
    [0, 1, 1, 2, 2, 4, 5, 4, 2, 2, 2, 1, 1, 1, 0],
    [0, 1, 1, 1, 2, 2, 5, 2, 2, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 7, 1, 1, 1, 1, 1, 1, 1, 0], // Port tile is 7 at the bottom pier
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

export const getTileImage = (type: number): string => {
    switch (type) {
        case TileType.DEEP_WATER: return '/sprites/deep_water.png';
        case TileType.WATER: return '/sprites/water.png';
        case TileType.SAND: return '/sprites/sand.png';
        case TileType.GRASS: return '/sprites/grass.png';
        case TileType.TREE: return '/sprites/tree.png';
        case TileType.PATH: return '/sprites/path.png';
        case TileType.BUILDING: return '/sprites/building.png';
        case TileType.PORT: return '/sprites/port.png';
        default: return '';
    }
};

export const isPassable = (type: number): boolean => {
    return [TileType.SAND, TileType.GRASS, TileType.PATH, TileType.PORT].includes(type);
};
