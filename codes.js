var codes = module.exports = {
    websockets: 'sk',
    canvas: '2d',
    webgl: '3d'
};

// create the reverse lookup
codes.reverse = {};
for (var key in codes) {
    codes.reverse[codes[key]] = key;
}

