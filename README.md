# Template Micro Service Node Express

Node application with modular approach for running multiple services. 
It also implements logger using Pino.js (advanced logger for node js with seprate process).
It also implements module for env variables.
It also implements event processor class for registring events for each API endpoint defined in config file of each service.

---
## Requirements

For development, you will only need Node.js (node version: v14.16.0) and a node global package (npm --version 6.14.11), installed in your environement.

### Node

- #### Node installation on Ubuntu

  You can install nodejs and npm easily with apt install, just run the following commands.

      $ sudo apt install nodejs
      $ sudo apt install npm

If the installation was successful, you should be able to run the following command.

    $ node --version
    v14.16.0

    $ npm --version
    6.14.11

---

## Install

    $ git clone https://github.com/yousafhanif6186/micro-service-node-express-template.git
    $ cd micro-service-node-express-template
		- $ $ npm install

## Configure app

	$ cd micro-service-node-express-template
		- $ cd template-service and run $ mkdir logs


## Running the project

    $ cd template-service
    $ npm start
