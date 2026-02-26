import { PrismaClient, ItemType } from '@prisma/client';
import { prisma } from './lib/db';

async function main() {
  console.log('Seeding standard items...');

  const items = [
    {
      name: 'Wooden Sword',
      description: 'A basic training sword. Better than fighting bare-handed.',
      type: ItemType.WEAPON,
      effectValue: 5,
      price: 150
    },
    {
      name: 'Flintlock Pistol',
      description: 'A standard issue marine pistol. Good for ranged attacks.',
      type: ItemType.WEAPON,
      effectValue: 12,
      price: 500
    },
    {
      name: 'Mystery Meat',
      description: 'A huge chunk of meat on a bone. Restores 50 Health.',
      type: ItemType.CONSUMABLE,
      effectValue: 50,
      price: 50
    },
    {
      name: 'Ship Log Pose',
      description: 'A compass that records the magnetic fields of islands. Essential for navigation.',
      type: ItemType.KEY_ITEM,
      effectValue: 0,
      price: 1000
    }
  ];

  for (const item of items) {
    await prisma.item.upsert({
      where: { name: item.name },
      update: {},
      create: item,
    });
  }

  console.log('Finished seeding items.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
