const CFG = global.CFG = require('./lib/parseConfig')();

if ( process.env.hasOwnProperty('DFM_notifications_URL') ) {
    CFG.stat.notifications.URL = process.env['DFM_notifications_URL'];
}

if ( process.env.hasOwnProperty('DFM_camtime') ) {
    CFG.stat.camtime = process.env['DFM_camtime'];
}

if ( process.env.hasOwnProperty('DFM_inspectEvery') ) {
    CFG.stat.inspectEvery = process.env['DFM_inspectEvery'];
}

const
    Q = require('q'),
    FS   = require('fs'),
    PM  = require('./lib/pm'),
    TMPL = require('./lib/simpleTemplator'),
    app  = require('express')(),
    bodyParser = require('body-parser'),
    http = require('http'),
    path = require('path'),
    AR = require('./lib/authRequest').getRequestInstance({}),

    TMPLS = {
        dev : TMPL.compileFile(path.join(__dirname, 'templates', 'dev.js.tmpl')),
        dep : TMPL.compileFile(path.join(__dirname, 'templates', 'dep.js.tmpl')),
        dfc : TMPL.compileFile(path.join(__dirname, 'templates', 'dfc.js.tmpl'))
    },

    mapComponents = {
        'dev' : {
                pidfilePath : CFG.dfx.dev.lock.path,
                modulePath  : CFG.dfx.code.path,
                logPrefix   : 'DEV.LOG_'
            },
        'dep' : {
                pidfilePath : CFG.dfx.dep.lock.path,
                modulePath  : CFG.dfx.code.path,
                logPrefix   : 'DEP.LOG_'
            },
        'dfc' : {
                pidfilePath : CFG.dfc.lock.path,
                modulePath  : CFG.dfc.code.path,
                logPrefix   : 'DFC.LOG_'
            }
    },
    startupProgress = {
        isInProgress : false,
        promises : {}
    },
    STARTUP_TIMEOUTS = {
        dev : 20000,
        dep : 20000,
        dfc : 20000
    };

app.use(bodyParser.json({limit:'50mb'}));

app.get('/ping', function (req, res, next){ res.end('pong') });

app.post('/start', function (req, res, next){

    if ( startupProgress.isInProgress ) res.status(409).json({error : 'starting is in progress'});

    startupProgress.isInProgress = true;

    const
        components = req.body.components,
        cnames     = Object.keys(components),
        report     = {};

    if ( components.hasOwnProperty('dev') ) {
        startupProgress.promises['dev'] = startComponent('dev', components['dev'].config)
    }

    if ( components.hasOwnProperty('dep') ) {
        startupProgress.promises['dep'] = startComponent('dep', components['dep'].config)
    }

    if ( components.hasOwnProperty('dfc') ) {
        startupProgress.promises['dfc'] = (
                startupProgress.promises['dev'] || Q(1)
            )
            .then(function(){
                return startComponent('dfc', components['dfc'].config);
        });
    }

    res.status(202).json({status : 'starting is in progress'});

    const promises = Object.keys(startupProgress.promises)
            .map(function(cname){return startupProgress.promises[cname]});

    Q.allSettled(promises)
    .then(function(results){

        var isFailed = false;

        results.forEach(function (result) {
            if (result.state !== "fulfilled") {
                isFailed = true;
                console.error(result.reason);
            }
        });

        if ( CFG.stat.notifications.URL ) {
            const _status = isFailed ? 'failed' : 'done';

                AR.post({
                    url : CFG.stat.notifications.URL,
                    headers: {'Content-Type': 'application/json; charset=utf-8'},
                    body: JSON.stringify({
                        type   : 'CUP',
                        status : _status,
                        report : report
                    })
                })
                .then(function(){
                    console.log('notifications sent', report);
                })
                .fail(function(error){
                    console.log('could not notify after start. error : ', error);
                });
        }
        startupProgress.isInProgress = false;
        delete startupProgress.promises;
        startupProgress.promises = {};
    })
    .done();
});

function startComponent ( cname, config ) {

    config.notify_on_start = {
        url : 'http://localhost' + ':' + CFG.daemon.port + '/startup/notification/',
        id  : cname
    };

    config.isup = {
        waitForNotification : true,
        timeout : STARTUP_TIMEOUTS[cname]
    };
    
    const
        cnt = TMPLS[cname]({
            MODULE_PATH : mapComponents[cname].modulePath,
            CONFIG : JSON.stringify(config, null, 4)
        }),
        modulePath = path.join(CFG.daemon.tmprun, cname + '.js'),
        logPrefix = mapComponents[cname].logPrefix;
    
    FS.writeFileSync(modulePath, cnt);

    return PM.start({
        respawn : true,
        pidfile : mapComponents[cname].pidfilePath,
        nmodule : modulePath,
        cwd     : __dirname,
        logPrfx : logPrefix,
        logPath : CFG.logs.path,
        name    : cname,
        stat    : CFG.stat,
        isup    : config.isup
    })
}

app.post('/stop', function (req, res, next){

    const
        components = req.body.components,
        tasks = [],
        report = {};

    components.forEach(function(cname){
        tasks.push(
            PM.stop({
                pidfile : mapComponents[cname].pidfilePath,
                name : cname
            })
            .then(
                function(){
                    report[cname] = {
                        status : 'stopped'
                    }
                },
                function(error){
                    report[cname] = {
                        error : error
                    }
                }
            )
        );
    });

    Q.all(tasks).then(function(){ res.json(report) }).done();

});

app.get('/health', function (req, res, next){
    res.json(PM.health());
});

app.get('/settings', function (req, res, next){
    res.json(CFG);
});

app.get('/startup/notification/', function (req, res, next){
    console.log('GOT NOTIFICATION : ', req.query);
    PM.upNotification({name : req.query.notifyid})
    res.end();
});
    
http.createServer(app).listen(CFG.daemon.port, CFG.daemon.host, function(){

    if ( !CFG.stat.notifications.URL ) return;

    AR.post({
        url: CFG.stat.notifications.URL,
        headers: {'Content-Type': 'application/json; charset=utf-8'},
        body: JSON.stringify({
            type : 'DFMUP'
        })
    })
    .fail(function(error){
        console.log(error);
    });
});


PM.on('totalCPULevelChanged', function (event, d) {

    d.type = 'CPU';

    console.log((new Date).toISOString() + ' Total CPU level is changed to ' + d.level + '\t STAT : ' + JSON.stringify(d.stat));

    if ( !CFG.stat.notifications.URL ) return;

    AR.post({
        url: CFG.stat.notifications.URL,
        headers: {'Content-Type': 'application/json; charset=utf-8'},
        body: JSON.stringify(d)
    })
    .fail(function(error){
        console.log(error);
    });
});
