const
    defaultCfgPathes = [ // first valid will be used
        '/usr/local/etc/dfm.config.json',
        '~/.dfm/dfm.config.json',
        '/etc/dfm.config.json'
    ];

var config;

/**
 * @param {String} path to config ( for tests reason )
 */
module.exports = function ( pathes ) {

    if ( config ) return config;

    pathes = pathes || defaultCfgPathes;

    for ( var i = 0, l = pathes.length; i < l; i++ ) try {
        config = require(pathes[i]);
        break;
    } catch ( error ) {
        if ( error instanceof SyntaxError ) return Error(
            error.name + ' at config ' + error.message
        );
    }
    
    if ( config ) return config;
    else {
        var searchedAt = pathes.length === 1
            ? pathes[0]
            : 'neither ' + JSON.stringify(pathes, null, 4);

        return Error('can\'t find config file at ' + searchedAt);
    }
};
