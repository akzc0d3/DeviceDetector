const deviceDetector = new (require('device-detector-js'))();


module.exports = {

    detect: function (request) {
        const device = deviceDetector.parse(request.get('user-agent'));
        const ip = request.clientIp;

        const deviceInfo = {device,ip};
        return deviceInfo;
    }


}

