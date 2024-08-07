const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../utils/auth.js');
const { validateItem } = require('../../utils/validation');
const { Item, ItemImage, Store, Like, User } = require('../../db/models');

// --------------------------------------------------------------------------------------//
//                                  View all Items                                      //
// ------------------------------------------------------------------------------------//
router.get('/', async (req, res, next) => {
    try {
        const items = await Item.findAll({
            include: [{ model: ItemImage }]
        });
        return res.status(200).json(items);
    } catch (error) {
        next(error);
    }
});

// --------------------------------------------------------------------------------------//
//                    Get all Items which are Liked by Current User                     //
// ------------------------------------------------------------------------------------//
router.get('/liked-items', requireAuth, async (req, res, next) => {
    try {
        const userId = req.user.id;
        console.log(`Fetching liked items for user ID: ${userId}`);

        const likedItems = await Item.findAll({
            include: [
                {
                    model: Like,
                    where: { userId },
                    attributes: []
                },
                { model: ItemImage }
            ]
        });

        return res.status(200).json(likedItems);
    } catch (error) {
        next(error);
    }
});

// --------------------------------------------------------------------------------------//
//                       Get details of an Item from an Item id                         //
// ------------------------------------------------------------------------------------//
router.get('/:itemId', async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const item = await Item.findByPk(itemId, { include: [{ model: ItemImage }] });

        if (!item) {
            return res.status(404).json({ message: "Item not found." });
        }

        return res.status(200).json(item);
    } catch (error) {
        next(error);
    }
});

// --------------------------------------------------------------------------------------//
//                                   Update an Item                                     //
// ------------------------------------------------------------------------------------//
router.put('/:itemId', requireAuth, validateItem, async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const { name, description, price, quantity, category } = req.body;

        let item = await Item.findByPk(itemId);

        if (!item) {
            return res.status(404).json({ message: "Item not found." });
        }

        // Check if the item belongs to a store owned by the current user
        const store = await Store.findByPk(item.storeId);
        if (store.ownerId !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized. Item doesn't belong to a store owned by the current user." })
        }

        await item.update({ name, description, price, quantity, category });
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

/*  ─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───  ‧₊˚❀༉‧₊˚.  ─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───  ‧₊˚❀༉‧₊˚.  ─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ─── */
// --------------------------------------------------------------------------------------//
//                              Get all Likes for an Item                               //
// ------------------------------------------------------------------------------------//
router.get('/:itemId/likes', async (req, res, next) => {
    try {
        const { itemId } = req.params;

        const likes = await Like.findAll({
            where: { itemId },
            include: [{ model: User, attributes: ['id', 'username'] }]
        });

        return res.status(200).json(likes);
    } catch (error) {
        next(error)
    }
});

// --------------------------------------------------------------------------------------//
//                                     Like an Item                                     //
// ------------------------------------------------------------------------------------//
router.post('/:itemId/likes', requireAuth, async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const userId = req.user.id;

        const like = await Like.create({ userId, itemId });

        return res.status(201).json(like);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
