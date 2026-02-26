"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const db_1 = require("../lib/db");
const router = (0, express_1.Router)();
// GET /api/character/
// Fetch the character of the currently logged-in user
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized.' });
        }
        const character = await db_1.prisma.character.findUnique({
            where: { userId },
            include: {
                devilFruit: true,
                crew: true
            }
        });
        if (!character) {
            // 404 is technically correct, but the client will use this to know they need to create a character
            return res.status(404).json({ message: 'No character found for this user.' });
        }
        res.status(200).json({ character });
    }
    catch (error) {
        console.error('Fetch character error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
// POST /api/character/create
// Create a new character for the currently logged-in user
router.post('/create', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { name, faction } = req.body;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized.' });
        }
        if (!name || !faction) {
            return res.status(400).json({ error: 'Name and faction are required.' });
        }
        // Validate faction Enum
        if (!Object.values(client_1.Faction).includes(faction)) {
            return res.status(400).json({ error: 'Invalid faction provided.' });
        }
        // Check if the user already has a character
        const existingCharacter = await db_1.prisma.character.findUnique({
            where: { userId }
        });
        if (existingCharacter) {
            return res.status(400).json({ error: 'User already has a character.' });
        }
        // Default starting stats can be fine-tuned later
        const newCharacter = await db_1.prisma.character.create({
            data: {
                userId,
                name,
                faction: faction,
                level: 1,
                exp: 0,
                berries: 500, // starting money
                health: 100,
                stamina: 100,
                mapRegion: 'East Blue',
                x_coord: 6, // Starting coordinates in Windmill Village
                y_coord: 10,
            }
        });
        res.status(201).json({
            message: 'Character created successfully',
            character: newCharacter
        });
    }
    catch (error) {
        console.error('Create character error:', error);
        res.status(500).json({ error: 'Internal server error during character creation.' });
    }
});
exports.default = router;
//# sourceMappingURL=character.js.map