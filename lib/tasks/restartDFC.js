module.exports = function ( CFG ) {

    console.log('restarting dfc ...');

    return require('q').delay(15000).then(function(){
        return require('../run')({
            command     : 'node',
            arguments   : [ CFG.dfc.run.path ],
            log         : require('../logStream').get({
                                path   : CFG.logs.path,
                                prefix : 'DFC.LOG_'
                            }),
            detachAfter : 2000
        });
    });
};
