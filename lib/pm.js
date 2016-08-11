const
    FS = require('fs'),
    CP = require('child_process'),
    Q  = require('q'),
    CAM = require('./continousArithmeticMean'),
    PCMU = require('./pcmu'),
    logStream = require('./logStream'),
    em = new (require('./events')),
    PID_FILE_OPTS = { encoding : 'utf8' },
    watch = {
        length : 0,
        pss : {}
    };

var currentTotalCPULevel = 0;


exports.stop = function ( o ) {

    return readPidFile(o.pidfile)
    .then(killProcess)
    .then(function(){
        if ( watch.pss.hasOwnProperty(o.name) ) {
            watch.length--;
            delete watch.pss[o.name];
        }

        console.log('WATCH : ', watch);

        return removePidFile(o.pidfile)
    })
};

exports.start = function ( o ) {

    return readPidFile(o.pidfile)
    .then(function(PID){
        if ( PID ) {
            return Q.reject('pidfile is found : ' + PID);
        }

        return run(o);
    })
    .then(function(child){
        o.pid = child.pid;
        return watchProcess(o);
    });
};

exports.health = function () {
    return {
        currentTotalCPULevel : currentTotalCPULevel,
        componentsStatus : watch.pss
    };
};

exports.on = em.subscribe.bind(em);

function readPidFile ( fpath ) {
    const D = Q.defer();

    FS.readFile(
        fpath,
        PID_FILE_OPTS,
        function ( error, pid ) {

            if ( error ) {
                if ( error.code === 'ENOENT' ) return D.resolve();
                else return D.reject(error);
            } else {
                return D.resolve(pid)
            }
        }
    );

    return D.promise;
}

function removePidFile ( fpath ) {
    const D = Q.defer();

    FS.unlink(fpath, function ( error ) {
        if ( error ) {
            if ( error.code === 'ENOENT' ) return D.resolve();
            else return D.reject(error);
        } else {
            return D.resolve()
        }
    });

    return D.promise;
}

function killProcess ( PID ) {

    if ( !PID ) return Q.resolve();
    
    try {
        process.kill(PID, 'SIGINT');
    } catch ( error ){
        if ( /ESRCH/.test(error.toString()) ) {
            return Q.resolve();
        } else {
            return Q.reject(error);
        }
    }

    return Q.resolve();
}

function run ( o ) {
    console.log('starting process : ' + o.nmodule);
    const
        D = Q.defer(),
        log = logStream.get({
                    path   : o.logPath,
                    prefix : o.logPrfx
                }),
        child = CP.spawn(
                'node',
                [o.nmodule],
                {
                    stdio    : ['ignore', log, log],
                    cwd      : o.cwd,
                    detached : true
                }
            )
            .on('error', function(error){
                console.error('ERROR : ', error);
                D.reject(error);
            })
            .on('close', function(exitCode){

                if ( exitCode !== 0 && exitCode !== 130 ) {
                    D.reject(Error(
                        'exit code is : ' + exitCode
                    ));

                    console.log(
                        'process "' + o.nmodule +
                        '" exited with code "' + exitCode +
                        '". will' + (o.respawn ? ' ' : ' not ') + 'be respawned.'
                    );

                    if ( !global.CFG && o.respawn ) {
                        removePidFile(o.pidfile).then(function(){
                            run(o);
                        });
                    }
                }
            });

    child.unref();

    FS.writeFile(
        o.pidfile,
        child.pid,
        PID_FILE_OPTS,
        function ( error ) {
            if ( error ) console.error('WRITE PID FILE ERROR : ' + exitCode);
            error ? D.reject(error) : D.resolve(child);
        }
    );

    return D.promise;
};

function watchProcess ( o ) {

    if ( !global.CFG ) return;

    watch.pss[o.name] = { respawn : o.respawn, CPU : 0 };
    watch.length++;
    
    const p = new PCMU({
            pid : o.pid
        });

    const camCPU = new CAM(o.stat.camtime * 1);

    p.on('tick', function(event, top){
        watch.pss[o.name].CPU = camCPU.next(top['%CPU']) || 0;
    });

    p.on('error', function(event, error){
        console.log('TOP ERROR : ', error);
    });

    p.on('closed', function(event){

        delete o.pid;
        delete o.state;

        if ( watch[o.name] && watch[o.name].respawn ) {
            removePidFile(o.pidfile).then(function(){
                run(o);
            });
        }
    });
    
    p.watch();
}

function inspectLevel () {

    const pnames = Object.keys(watch.pss);
    var totalCPU = 0;

    pnames.forEach(function(name){
        totalCPU += watch.pss[name].CPU;
    });

    const newTotalCPULevel = Math.floor(totalCPU/10);

    if ( currentTotalCPULevel !== newTotalCPULevel ) {
        currentTotalCPULevel = newTotalCPULevel;
        notifyTotalCPULevelChanged(currentTotalCPULevel);
    }
}

function notifyTotalCPULevelChanged ( level ) {
    em.publish('totalCPULevelChanged', {
        level : level,
        stat  : watch.pss
    });
}

if ( global.CFG ) {
    console.log('inspectEvery : ' + CFG.stat.inspectEvery);
    setInterval(inspectLevel, CFG.stat.inspectEvery*1);
}
