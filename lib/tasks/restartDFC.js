module.exports = function ( CFG ) {

    return require('q').delay(15000).then(function(){
        console.log('restarting dfc ...');
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
