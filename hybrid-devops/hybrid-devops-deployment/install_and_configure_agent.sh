apt-get update
apt-get install -y git

curl https://vstsagentpackage.azureedge.net/agent/2.159.2/vsts-agent-linux-x64-2.159.2.tar.gz -o /agent.tar.gz

mkdir /agent && cd agent
tar xzf /agent.tar.gz

bash ./bin/installdependencies.sh

bash ./config.sh AZURE_DEVOPS_URL --auth pat --token AZURE_DEVOPS_PAT --pool POOL_NAME --agent HYBRID_AGENT_NAME --acceptTeeEula

bash ./svc.sh install

bash ./svc.sh start