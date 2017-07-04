 # ripple-recovery-tool
Make payment transaction from a Ripple account using the private key.

 
# Install node
Install [Node](https://nodejs.org/en/)

# Install GIT
Install [GIT](https://git-scm.com/).
For windows users, during installation, choose the option to install the git bash

# Download and build the project
Open a terminal (Windows users, right click and select "open git bash here")
```sh
$ git clone https://github.com/LedgerHQ/ripple-recovery-tool.git
$ cd ripple-recovery-tool/ripple-lib
$ npm install
```

# Launch the tool
Reconnect to the internet then open a terminal
```sh
$ cd ripple-recovery-tool
$ node CLI-recovery-tool.js
```

# Check the transaction
Go to [Ripple charts](https://xrpcharts.ripple.com/#/graph) and type in your qccount to check the state of the transaction.
