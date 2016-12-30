# DreamFace Manager

Manager for DreamFace's development, deployment and compiler servers, that simplifies installing, restarting and updating code of the servers.
See `HELP.txt` for details.

Dreamface installation steps:
<pre>
Requirements:
1) Node >= 6.0.0
2) MongoDB >= 3.0.0
3) Npm >= 3.8.6
4) Grunt-cli >= 1.2.0
5) Grunt >= 0.4.5
6) Redis >= 3.2.1
7) Git >= 1.9.1 (<b>Important!</b> Git should be accessible via ssh without authentication)
</pre>
Also be sure if you haven't running dreamface process and you haven't already installed dreamface (you can execute a command: 'killall node' and remove 'dreamface_sysdb'collections from MongoDB to avoid such situations)
<pre>
1) mkdir /var/lib/dreamface or sudo mkdir /var/lib/dreamface
2) sudo chown "your_user_name": /var/lib/dreamface
3) cd /var/lib/dreamface
4) git clone https://github.com/InteractiveClouds/dfm.git
5) cd dfm && npm install
6) ln -s /var/lib/dreamface/dfm/index.js /usr/local/bin/dreamface
7) dreamface install 50.50.50.50 (where 50.50.50.50 is yours external server IP. If you not specify current parameter '127.0.0.1' will use but default)
8) dreamface update
</pre>
