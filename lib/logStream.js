const
    fs   = require('fs'),
    path = require('path');

/**
 * @param {Object}  o
 * @param {String}  o.path    path to log dir
 * @param {String} [o.name]   exact filename of the log file
 * @param {String} [o.prefix] if no filename was provided the prefix + time will be used
 * @returns {Number} file descriptor
 */
exports.get = function ( o ) {
    const
        DIR   = o.path,
        FNAME = o.name || ( o.prefix || '' ) + (new Date)
                    .toISOString()
                    .replace(/[-:]+/g, '.')
                    .replace('T', '_')
                    .replace('Z', '');

    return fs.openSync(path.join(DIR, FNAME), 'a');
};
