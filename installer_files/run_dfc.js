var dfc = require('./dfc');
var path = require('path'),
    fs   = require('fs');

const
    THIS_PID = process.pid,
    PID_FILE_NAME = 'dfc.lock',
    LOCK_FILE_OPTS = { encoding : 'utf8' },
    LOCK_FILE = path.join(__dirname, '..', 'lock-files', PID_FILE_NAME);

var another_pid, kill_error;
try {
    another_pid = fs.readFileSync(LOCK_FILE, LOCK_FILE_OPTS);
} catch (e ) {}


if ( another_pid ) {
    console.log('lockfile is found, pid is ', another_pid);
    console.log('trying to send SIGINT');
    try { process.kill(another_pid, 'SIGINT'); } catch (e){ kill_error = e }
    if ( !kill_error ) console.log('old process was killed');
    else if ( /ESRCH/.test(kill_error.toString()) ) {
        console.log('no process with the pid ' + another_pid + ' was found');
    } else {
        throw(kill_error);
        process.exit();
    }
}

fs.writeFileSync(LOCK_FILE, THIS_PID, LOCK_FILE_OPTS);
console.log('my pid is : ', THIS_PID);

setTimeout(function(){
    process.env['NODE_ENV'] = 'compiler';
    //process.env['DFX_DO_NOT_RM_TEMP_DIRS'] = true; 
    dfc.init({
        target_dir : '/var/lib/dreamface/res_folders/cmpTasks',
        tmp_dir :'/var/lib/dreamface/res_folders/cmpTmp',
        server_host : '0.0.0.0',
        dfx_servers : [
            {
                name : 'dfx',
                cfg  : {
                    address : 'http://IP:3000/',
                    auth_conf_path : '/var/lib/dreamface/res_folders/.auth.conf'
                }
            }
        ]
    })
    .start();
}, 2000);