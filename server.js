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
    };

app.use(bodyParser.json({limit:'50mb'}));

app.get('/ping', function (req, res, next){ res.end('pong') });

app.post('/start', function (req, res, next){
    const
        components = req.body.components,
        cnames     = Object.keys(components),
        tasks      = [],
        report     = {};

    cnames.forEach(function(cname){

        const config = components[cname].config;

        const
            cnt = TMPLS[cname]({
                MODULE_PATH : mapComponents[cname].modulePath,
                CONFIG : JSON.stringify(config, null, 4)
            }),
            modulePath = path.join(CFG.daemon.tmprun, cname + '.js'),
            logPrefix = mapComponents[cname].logPrefix,
            delay = cname === 'dfc' ? 10000 : 0; // TODO remove the cratch after properly starting is done

        FS.writeFileSync(modulePath, cnt);

        tasks.push(
            Q.delay(delay).then(function(){ // TODO remove the cratch after properly starting is done
                return PM.start({
                    respawn : true,
                    pidfile : mapComponents[cname].pidfilePath,
                    nmodule : modulePath,
                    cwd     : __dirname,
                    logPrfx : logPrefix,
                    logPath : CFG.logs.path,
                    name    : cname,
                    stat    : CFG.stat,
                })
                .then(
                    function(){
                        report[cname] = {
                            status : 'started'
                        }
                    },
                    function(error){
                        report[cname] = {
                            error : error
                        };
                        return Q.reject(error);
                    }
                )
            })
        );
    });

    Q.all(tasks).then(function(){ res.json(report) }).done();
});

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
    
http.createServer(app).listen(CFG.daemon.port, CFG.daemon.host);


PM.on('totalCPULevelChanged', function (event, d) {

    AR.post({
        url: CFG.stat.notifications.URL,
        headers: {'Content-Type': 'application/json; charset=utf-8'},
        body: JSON.stringify(d)
    })
    .fail(function(error){
        console.log(error);
    });

    console.log((new Date).toISOString() + ' Total CPU level is changed to ' + d.level + '\t STAT : ' + JSON.stringify(d.stat));
});
