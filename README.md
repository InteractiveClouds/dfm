# DreamFace Manager

Manager for DreamFace's development, deployment and compiler servers, that simplifies restarting and updating code of the servers.

Install dreamface steps:
<pre>
1) mkdir /var/lib/dreamface or sudo mkdir /var/lib/dreamface
2) sudo chown "your_user_name": /var/lib/dreamface (for example sudo chown john: /var/lib/dreamface)
3) cd /var/lib/dreamface
4) git clone https://github.com/InteractiveClouds/dfm.git
5) cd dfm
6) npm install
7) ln -s /var/lib/dreamface/dfm/index.js /usr/local/bin/dreamface
8) dreamface install
9) dreamface update
</pre>
See `HELP.txt` for details.
