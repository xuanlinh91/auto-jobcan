#!/bin/bash
sudo su
yum update -y
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install 14
node -v
wget https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm
yum install ./google-chrome-stable_current_x86_64.rpm -y
ln -s /usr/bin/google-chrome-stable /usr/bin/chromium
yum install git -y
exit
ssh-keygen -t ed25519 -C "xuanlinh91@ec2"