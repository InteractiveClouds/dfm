module.exports = function ( CFG ) {

    console.log('restarting dev ...');

    return require('../run')({
        command     : 'node',
        arguments   : [ CFG.dfx.dev.run.path ],
        log         : require('../logStream').get({
                            path   : CFG.logs.path,
                            prefix : 'DFX.DEV.LOG_'
                        }),
        detachAfter : 9000
    });
};
