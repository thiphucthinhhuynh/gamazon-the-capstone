const express = require('express');
const router = express.Router();
const { Op } = require("sequelize");
const { User, Item, ItemImage, Store } = require('../../db/models');

// --------------------------------------------------------------------------------------//
//      Get results of searching for Item or User by their name (for PostgreSQL)        //
// ------------------------------------------------------------------------------------//
router.get('/', async (req, res, next) => {
    const { type, query } = req.query;

    try {
        let results;

        if (type === 'items') {
            results = await Item.findAll({
                where: {
                    name: {
                        [Op.iLike]: `%${query}%`
                    }
                },
                include: [{ model: ItemImage }]
            });
        } else if (type === 'users') {
            results = await User.findAll({
                where: {
                    username: {
                        [Op.iLike]: `%${query}%`
                    }
                },
                include: [{ model: Store }]
            });
        }

        return res.json(results);
    } catch (error) {
        next(error);
    }
});

// --------------------------------------------------------------------------------------//
//         Get results of searching for Item or User by their name (for SQLite)         //
// ------------------------------------------------------------------------------------//
// const { User, Item, ItemImage, Store, sequelize } = require('../../db/models');

// router.get('/', async (req, res, next) => {
//     const { type, query } = req.query;

//     try {
//         let results;

//         if (type === 'items') {
//             results = await Item.findAll({
//                 where: sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), {
//                     [Op.like]: `%${query.toLowerCase()}%`
//                 }),
//                 include: [{ model: ItemImage }]
//             });
//         } else if (type === 'users') {
//             results = await User.findAll({
//                 where: sequelize.where(sequelize.fn('LOWER', sequelize.col('username')), {
//                     [Op.like]: `%${query.toLowerCase()}%`
//                 }),
//                 include: [{ model: Store }]
//             });
//         }
//         return res.json(results);
//     } catch (error) {
//         next(error);
//     }
// });

module.exports = router;
