const
    EventManager = require('./events'),
    RGX_HAS_PLUS = /\+$/,
    spawn = require('child_process').spawn,
    mypid = process.pid,
    ps = {};

var args;

function init () {

    args = ['-b', '-p'];

    var lastTry = false,
        proc = start(mypid, cb);

    function cb ( error, top ) {

        if ( error ) {
            if ( lastTry ) {
                throw('can not init');
            }
            lastTry = true;
            args = ['-l', '0', '-pid'];
            proc = start(mypid, cb)
            return;
        }

        //console.log( 'DATA : %s    PID: %s, CPU: %s%, MEM: %s', (new Date()).toString().split(' ')[4], top['PID'], top['%CPU'], top['MEM'] );
        proc.kill();
        console.log('ARGS : ', args);
    }
}

function start ( pid, cb ) {

    proc = spawn('top', args.concat(pid));

    proc.stdout.on('data', function ( output ) {
        cb( null, m.parse(output.toString('utf8')) );
    });
    
    proc.stderr.on('data', function (error) {
        cb(error.toString('utf8'));
    });
    
    //proc.on('close', closed || function(code){}); // code --> args

    return proc;
}

init();

const m = {
    lineSeparator : '\n',
    itemsSeparator : /\s+/,
    headerLine : undefined,
    header : [],
    parseHumanReadable : (function(){
        const
            RGX_PARSE_HR = /^(\d+)([KMG]?)([+-]?)$/,
            unitsMultipliers = {
                'B'  : 1,
                'K'  : 1024,
                'KB' : 1024,
                'M'  : 1048576,
                'MB' : 1048576,
                'G'  : 1073741824,
                'GB' : 1073741824
            };
        return function ( str ) {
            const parts = RGX_PARSE_HR.exec(str);

            return {
                valueOf : function () { return this.bites },
                bites : parts[1] * unitsMultipliers[parts[2]],
                src   : {
                    value     : parts[1],
                    unit      : parts[2],
                    increased : parts[3] === '+',
                    decreased : parts[3] === '-'
                }
            };
        }
    })(),
    parse : function ( data ) {
        const
            lines = data.split(this.lineSeparator),
            headerLine = lines[lines.length - 2],
            values = lines[lines.length-1].split(this.itemsSeparator),
            parsed = {};

        if ( this.headerLine !== headerLine ) {
            this.headerLine = headerLine;
            this.header     = headerLine.split(this.itemsSeparator);
        }

        for ( var i = 0, l = this.header.length; i < l; i++ ) {
            parsed[this.header[i]] = values[i];
        };

        return parsed;
    }
};

function Proc ( o ) {

    if ( ps.hasOwnProperty(o.pid) ) return ps[o.pid];

    ps[this.pid] = this;

    this._em = new EventManager;
    this.on  = this._em.subscribe.bind(this._em);
    this.pid = o.pid;
    this._watching = false;
}

Proc.prototype.watch = function () {

    if ( this._watching ) return;

    this._watching = true;

    const theProc = this;

    theProc._proc = start(
        theProc.pid,
        function(error, top){
            if ( error ) theProc._em.publish('error', error);
            else {
                if ( !top['PID'] ) {
                    theProc._em.publish('closed');
                    theProc._proc.kill();
                    delete ps[theProc.pid];
                }
                else theProc._em.publish('tick', top);
            }
        }
    );
};


module.exports = Proc;
module.exports.isUp = function ( pid, cb ) {
    console.log('[ISUP] pid : ' + pid);
    const proc = start(
        pid,
        function ( error, top ) {
            console.log('[ISUP] top : ', top);
            proc.kill();
            // TODO remove
            return cb(null, true);
            if ( error ) return cb (error);
            if ( !top['PID'] ) cb(null, false);
            else cb(null, true);
        }
    );
};



// // ---------------------------------------
// 
// const p = new Proc({
//         pid : 15571
//     }),
//     CAM = require('./continousArithmeticMean'),
//     cam = new CAM(60);
// 
// p.on('tick', function(event, top){
//     console.log('%s \t %s', top['%CPU'], cam.next(top['%CPU']));
// });
// p.on('error', function(event, error){
//     console.log('ERROR : ', error);
// });
// p.on('closed', function(event, code){
//     console.log(p.pid + ' is closed.');
// });
// 
// p.watch();
