const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../utils/auth.js');
const { Item, Store } = require('../../db/models');

// --------------------------------------------------------------------------------------//
//                                  View all Items                                      //
// ------------------------------------------------------------------------------------//
router.get('/', async (req, res, next) => {
    try {
        const items = await Item.findAll();
        return res.status(200).json(items);
    } catch (error) {
        next(error);
    }
});

// --------------------------------------------------------------------------------------//
//                                   Update an Item                                     //
// ------------------------------------------------------------------------------------//
router.put('/:itemId', requireAuth, async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const { name, description, category, price } = req.body;

        let item = await Item.findByPk(itemId);

        if (!item) {
            return res.status(404).json({ message: "Item not found." });
        }

        // Check if the item belongs to a store owned by the current user
        const store = await Store.findByPk(item.storeId);
        if (store.ownerId !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized. Item doesn't belong to a store owned by the current user." })
        }

        await item.update({ name, description, category, price });
        return res.status(200).json(item);
    } catch (error) {
        next(error);
    }
});



// --------------------------------------------------------------------------------------//
//                                 Delete an Item                                       //
// ------------------------------------------------------------------------------------//
router.delete('/:itemId', requireAuth, async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const item = await Item.findByPk(itemId);

        if (!item) {
            return res.status(404).json({ message: "Item not found." });
        }

        // Check if the item belongs to a store owned by the current user
        const store = await Store.findByPk(item.storeId);
        if (store.ownerId !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized. Item doesn't belong to a store owned by the current user." });
        }

        await item.destroy();
        return res.status(200).json({ message: 'Item deleted successfully.' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
