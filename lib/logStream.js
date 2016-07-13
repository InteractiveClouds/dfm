const
    fs   = require('fs'),
    path = require('path');

exports.get = function ( o ) {
    const 
        TIME = (new Date)
                .toISOString()
                .replace(/[-:]+/g, '.')
                .replace('T', '_')
                .replace('Z', '');
    return fs.openSync(path.join(o.path, o.prefix + TIME), 'a');
};
