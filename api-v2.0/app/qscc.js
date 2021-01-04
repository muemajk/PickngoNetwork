const { Gateway, Wallets } = require('fabric-network');

const fs = require('fs');
const path = require('path');
const log4js = require("log4js");
const logger = log4js.getLogger('PickNgoNetwork');
const util = require('util')

const helper = require('./helper')
const qscc = async (channelName, chaincodeName, args, fcn, username, org_name) => {
    try {
        const ccp = await helper.getCCP(org_name)
        const walletPath = await helper.getWalletPath(org_name);
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        let identity = await wallet.get(username);
        if(!identity) {
            console.log(`An identity for the user ${username} does not exist in the wallet, so registering user`);
            await helper.getRegisteredUser(username, org_name, true)
            identity = await wallet.get(username);
            console.log('Run the registerUser.js application before retrying');
            return;
        } 

        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet, identity: username, discovery: { enable: true, asLocalhost: true}
        });
        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);
        let result;

        if (fcn == 'GetBlockByNumber') {
            result = await contract.evaluateTransaction(fcn, channelName, args[0]);
            const fs = require('fs')
            fs.writeFileSync('./app/data/blockData.block', result)
            let runScript = () => new Promise((resolve, reject) => {
                const { exec } = require('child_process');
                exec('sh ./app/block-decoder.sh',
                (error, stdout, stderr) => {
                    console.log(stdout);
                    console.log(stderr);
                    if (error !== null) {
                        console.log(`exec error: ${error}`);
                        reject(false)
                    }else {
                        resolve(true)
                    }
                });
            });

            result = await runScript()
            result = fs.readFileSync('./app/data/block.json')
            result = JSON.parse(result.tostring('utf-8'));
        } else if (fcn = "GetTransactionByID") {
            result = await contract.evaluateTransaction(fcn, channelName, args[0]);
            const fs = require('fs');
            fs.writeFileSync('./app/data/transactionData.block', result)
            let runScript = () => new Promise((resolve, reject) => {
                const { exec } = require('child_process');
                exec('sh ./app/transaction-decoder.sh',
                (error, stdout, stderr) =>{
                    console.log(stdout)
                    console.log(stderr)
                    if ( error !== null ) {
                        console.lg(`exec error: ${error}`)
                        reject(false)
                    }else {
                        resolve(true)
                    }
                });
            })
            result = await runScript()
            result = fs.readFileSync('./app/data/transaction.json')
            result = JSON.parse(result)

            console.log("Decoder block is :", result)
        }
        return result;
    }catch(err){
        console.error(`Failed to evaluted transaction: ${error}`);
        return error.message;
    }
}

exports.qscc = qscc