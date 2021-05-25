# Template Micro Service Node Express

	Node application with a modular approach for running multiple services.
	Just clone and start working on your business logic.
	It also implements logger using Pino.js (advanced logger for node js with the separate process). https://www.npmjs.com/package/pino
	It also implements a module for env variables.
	It also implements an event processor class for registring events for each API endpoint defined in the config file of each service.
	It also includes swagger documentation for APIs (given a few as an example).
	Well-documented code with comments to understand the logic.
	Streams can be piped to the response stream.

---
## Requirements

For development, you will only need Node.js (node version: v14.16.0) and a node global package (npm --version 6.14.11), installed in your environement.

#### Node installation on Ubuntu

You can install nodejs and npm easily with the apt install, just run the following commands.

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
    $ npm postinstall  

Note: postinstall script will run npm install command in each of the sub folders where package.json file exists.

## Configure app

	$ cd micro-service-node-express-template
	$ cd template-service
	$ mkdir logs


## Running the project

    $ cd template-service
    $ npm start
