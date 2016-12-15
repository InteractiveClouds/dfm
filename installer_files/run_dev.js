
var dfx = require('./dfx');
var path = require('path'),
    fs   = require('fs');

const
    THIS_PID = process.pid,
    PID_FILE_NAME = 'dev.lock',
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
    process.env['NODE_ENV'] = 'development';
    //process.env['DFX_DO_NOT_RM_TEMP_DIRS'] = true;
    dfx.init({
        studio_version: 3,
        edition: 'development',
        storage: 'mongod',
        deployment_server_host: 'IP',
        deployment_server_port: 3300,
        external_server_host: 'IP',
        external_server_port:  3000,
        server_host: '0.0.0.0',
        server_port: 3000,
        resources_development_path: '/var/lib/dreamface/res_folders/resources',
        auth_conf_path : '/var/lib/dreamface/res_folders/.auth.conf',
        tempDirForTemplates : '/var/lib/dreamface/res_folders/devTemp',
        tempDir : '/var/lib/dreamface/res_folders/devTmp',
        app_build_path: '/var/lib/dreamface/res_folders/app_builds',
        public_dir_path: '/var/lib/dreamface/dfx/public',
        docker_daemon : {
            useDefaultSettings: true
        },
        enableGracefulShutdown : false

    })
        .start()
}, 2000);


