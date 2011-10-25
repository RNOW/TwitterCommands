#!/bin/bash

# patch ubuntu
sudo apt-get update -y
sudo apt-get install -y build-essential git-core --fix-missing
sudo apt-get install libssl-dev

# install node.js
mkdir $HOME/src && cd $HOME/src
wget http://nodejs.org/dist/node-v0.4.12.tar.gz
gunzip node-v0.4.12.tar.gz | tar -xvf
tar -xvf node-v0.4.12.tar
cd node-v0.4.12
./configure --prefix=$HOME/local/node
make && make install
cd $HOME/src
rm node-v0.4.12.tar

echo 'export NODE_PATH=$HOME/local/node:$HOME/local/node/lib/node_modules' >> ~/.profile
echo 'export PATH=$PATH:$HOME/local/node/bin' >> ~/.profile 

# give us permissions we need to install with npm
sudo chown -R $USER /usr/local/{share/man,bin}

# install node package manager
curl http://npmjs.org/install.sh | sh

mkdir $HOME/.node_libraries

# install modules
npm install connect@0.5.10
npm install express

cd $HOME/src
git clone https://github.com/technoweenie/twitter-node.git
cd ./twitter-node
# git checkout ec4eb261891d78a88faabea54ea1016fd884b804
ln -s $HOME/src/twitter-node $HOME/.node_libraries/twitter-node
