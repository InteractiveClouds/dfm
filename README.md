# DreamFace Manager

Manager for DreamFace's development, deployment and compiler servers, that simplifies installing, restarting and updating code of the servers.
See `HELP.txt` for details.

Dreamface installation steps:

Before installation be sure if you haven't running dreamface process and you haven't already installed dreamface (you can execute a command: 'killall node' and remove 'dreamface_sysdb'
collections from MongoDB to avoid such situations)

<pre>
1) mkdir /var/lib/dreamface or sudo mkdir /var/lib/dreamface
2) sudo chown <your_user_name>: myfolder
3) cd /var/lib/dreamface
4) git clone https://github.com/InteractiveClouds/dfm.git
5) cd dfm && npm install
6) ln -s /var/lib/dreamface/dfm/index.js /usr/local/bin/dreamface
7) dreamface install
8) dreamface update
</pre>
