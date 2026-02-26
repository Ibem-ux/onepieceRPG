import { Router, Response } from 'express';
import { prisma } from '../lib/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/inventory/
// Get the authenticated character's inventory
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const character = await prisma.character.findUnique({
      where: { userId },
      include: {
        inventory: {
          include: {
            item: true // Fetch the details of each item
          }
        }
      }
    });

    if (!character) {
      return res.status(404).json({ error: 'Character not found.' });
    }

    res.status(200).json({ inventory: character.inventory, berries: character.berries });
  } catch (error) {
    console.error('Fetch inventory error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/inventory/shop
// Get all available items in the game that can be bought
router.get('/shop', async (req, res) => {
    try {
        const items = await prisma.item.findMany();
        res.status(200).json({ items });
    } catch (error) {
        console.error('Fetch shop error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// POST /api/inventory/buy
// Buy an item from the shop
router.post('/buy', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { itemId, quantity = 1 } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    if (!itemId || quantity <= 0) {
      return res.status(400).json({ error: 'Valid Item ID and quantity are required.' });
    }

    // Wrap in a transaction to ensure berries and inventory update securely together
    const result = await prisma.$transaction(async (tx) => {
        const character = await tx.character.findUnique({
            where: { userId }
        });

        if (!character) throw new Error("Character not found");

        const itemToBuy = await tx.item.findUnique({
            where: { id: itemId }
        });

        if (!itemToBuy) throw new Error("Item not found");

        const totalCost = itemToBuy.price * quantity;

        if (character.berries < totalCost) {
            throw new Error("Not enough berries");
        }

        // Deduct berries
        const updatedCharacter = await tx.character.update({
            where: { id: character.id },
            data: { berries: { decrement: totalCost } }
        });

        // Add or update inventory item
        const existingInventoryItem = await tx.inventoryItem.findUnique({
            where: {
                characterId_itemId: {
                    characterId: character.id,
                    itemId: itemToBuy.id
                }
            }
        });

        let newInventoryItem;
        if (existingInventoryItem) {
            newInventoryItem = await tx.inventoryItem.update({
                where: { id: existingInventoryItem.id },
                data: { quantity: { increment: quantity } },
                include: { item: true }
            });
        } else {
            newInventoryItem = await tx.inventoryItem.create({
                data: {
                    characterId: character.id,
                    itemId: itemToBuy.id,
                    quantity: quantity
                },
                include: { item: true }
            });
        }

        return { character: updatedCharacter, inventoryItem: newInventoryItem };
    });

    res.status(200).json({
        message: 'Purchase successful',
        berries: result.character.berries,
        inventoryItem: result.inventoryItem
    });

  } catch (error: any) {
    console.error('Buy item error:', error);
    // Send 400 for business logic errors (not enough berries, etc.)
    if (error.message === 'Not enough berries' || error.message === 'Item not found') {
        return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
