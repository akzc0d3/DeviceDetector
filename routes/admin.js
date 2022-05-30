const passport = require("passport");
const { ifNotLoggedIn, ifLoggedIn, ifUserNotExist } = require("../middleware/middleware");
const { body, validationResult } = require('express-validator');
const { TargetProvider, UserProvider, DbProvider } = require('../db');
const router = require("express").Router();
const bcrypt = require('bcrypt');
const fs = require('fs')
const path = require('path')
router.route('/login').all(ifNotLoggedIn).
    get((request, response) => {
        response.render('admin-login', {
            notification: {
                error: request.flash('error')
            }
        });
    }).
    post(passport.authenticate('local', {
        failureRedirect: '/login', successRedirect: '/',
        failureFlash: true,
    }))


router.route('/signup').all(ifNotLoggedIn).
    get((request, response) => {
        response.render('admin-register', {
            notification: {
                info: request.flash('info'),
                error: request.flash('error')
            }
        });
    }).
    post(async (request, response) => {

        try {
            

            
                const username = request.body.username;
                const password = request.body.password;
                const email =  request.body.email;

                bcrypt.genSalt(function (err, salt) {
                    bcrypt.hash(password, salt, async function (err, hash) {
                        if (err) {
                            console.log(error);
                        }
                        await UserProvider.insert({ username, hash, email });
                        request.flash('info', 'User created sucessfully')
                        response.redirect('/login')
                    });
                });
            
        } catch (error) {
            console.log(error)
        }

    })

router.get('/', ifLoggedIn, async (request, response) => {
    const targets = await (await TargetProvider.aggregate([{ $match: {admin_id:request.user._id} }, { $project: { _id: 0, name: 1, nTrackLinks: { $size: "$data" } } }])).toArray()
    username = request.user.username;
    console.log(targets);
    response.render('dashboard', {
        notification: {
            error: request.flash('error'),
            info: request.flash('info')
        }, targets, username
    })

})

router.get('/logout', ifLoggedIn, function (request, response) {
    request.logout();
    response.redirect('/login');
});

router.post('/create-track-link', ifLoggedIn, body('target', 'Target field cannot be empty').trim().notEmpty().escape(),
    body('targetLink', 'Empty or Invalid Target link').isURL({ require_tld: false, require_valid_protocol: false, require_host: false }),
    body('redirectLink').optional().notEmpty().withMessage('Empty Target link').isURL().withMessage('Invalid Redirect link'),
    async (request, response) => {

        const errors = validationResult(request);

        if (!errors.isEmpty()) {
            errors.array().forEach(element => {
                request.flash('error', element.msg)
            })
        } else {

            const newTarget = {
                name: request.body.target,
                admin_id:request.user._id,
                data: [{
                    link: `${request.get('host')}/l/${request.body.targetLink}`,
                    redirect: request.body.redirectLink,

                }]
            };
                
            try {
                const filter = { name: { $regex: new RegExp(`^${newTarget.name}$`, 'i') } }
                const target = await TargetProvider.get(filter);

                if (target) {
                    await TargetProvider.update(filter, { $push: { data: newTarget.data[0] } });
                } else {
                    await TargetProvider.insert(newTarget);
                }
                request.flash('info', 'Tracking link sucessfully created')
            } catch (error) {
                console.log('[Error] Failed to add TrackLink to DB\n', error)
                request.flash('error', 'Error creating TrackLink')
            }



        }
        response.redirect('/');

    })

router.post('/upload-client-page', ifLoggedIn, (request, response) => {
    const fileContent = request.body;

    fs.writeFile(path.join(__dirname,"..", "views", "partials", "client_content.handlebars"), fileContent, error => {
        if (error) {
            response.send({ ok: false, error })
        } else {
            response.send({ ok: true })
        }

    })

})

router.route('/q/:query').all(ifLoggedIn)
    .get(async (request, response) => {
        try {
            const query = request.params.query;

            if (query === '*') {

                const targets = await (await TargetProvider.getAll({}, { _id: 0 })).toArray();
                response.json(targets);
            } else {

                const target = await TargetProvider.get({ name: { $regex: new RegExp(`^${query}$`, 'i') } });
                delete target._id;
                if (target) {
                    response.json(target);
                } else {
                    response.status(404);
                    response.end();
                }
            }
        } catch (error) {
            console.log(error)
            response.json({ error })
        }
    }).delete(async function (request, response) {
        const query = request.params.query;
        try {

            if (query === '*') {
                const result = await TargetProvider.removeCollection(process.env.Coll_Target);
                response.json({ result: result });
            }
            else {
                const deletedTarget = await TargetProvider.remove({ name: { $regex: new RegExp(`^${query}$`, 'i') } })
                if (deletedTarget.value) {
                    request.flash('info', deletedTarget.value.name + ' deleted sucessfully')
                    response.redirect('/');
                } else {

                    response.status(404);
                    response.end();
                }
            }
        } catch (error) {
            console.log(error)
            response.json({ error })
        }
    })

router.delete('/clearDb', ifLoggedIn, async function (request, response) {
    try {
        const result = await DbProvider.clearDb();
        response.json({ result });
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;

