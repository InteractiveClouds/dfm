module.exports = function ( CFG ) {
    return require('q').delay(15000).then(function() {
        console.log('restarting dep ...');
        return require('../run')({
            command: 'node',
            arguments: [CFG.dfx.dep.run.path],
            log: require('../logStream').get({
                path: CFG.logs.path,
                prefix: 'DFX.DEP.LOG_'
            }),
            detachAfter: 2000
        });
    });
};
