"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const db_1 = require("./lib/db");
async function main() {
    console.log('Seeding standard items...');
    const items = [
        {
            name: 'Wooden Sword',
            description: 'A basic training sword. Better than fighting bare-handed.',
            type: client_1.ItemType.WEAPON,
            effectValue: 5,
            price: 150
        },
        {
            name: 'Flintlock Pistol',
            description: 'A standard issue marine pistol. Good for ranged attacks.',
            type: client_1.ItemType.WEAPON,
            effectValue: 12,
            price: 500
        },
        {
            name: 'Mystery Meat',
            description: 'A huge chunk of meat on a bone. Restores 50 Health.',
            type: client_1.ItemType.CONSUMABLE,
            effectValue: 50,
            price: 50
        },
        {
            name: 'Ship Log Pose',
            description: 'A compass that records the magnetic fields of islands. Essential for navigation.',
            type: client_1.ItemType.KEY_ITEM,
            effectValue: 0,
            price: 1000
        }
    ];
    for (const item of items) {
        await db_1.prisma.item.upsert({
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
    await db_1.prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map