apt-get update
curl -sL https://deb.nodesource.com/setup_13.x | bash -
apt-get install -y nodejs git

cd /relay

git clone https://github.com/Azure-Samples/azure-intelligent-edge-patterns.git

cp -r ./azure-intelligent-edge-patterns/hybrid-relay/hybrid-relay-sample .

cd /relay/hybrid-relay-sample

npm install


