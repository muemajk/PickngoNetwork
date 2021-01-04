const { Gateway, Wallets } = require('fabric-network')
const fs = require('fs');
const path = require('path');
const log4js = require('log4js');
const logger = log4js.getLogger('PickNgoNetwork');
const util = require('util')

const helper = require('./helper')
const query = async (channelName, chaincodeName, args, fcn, username, org_name) => {
    try {
        const ccp = await helper.getCCP(org_name)
        const walletPath = await helper.getWalletPath(org_name)
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`wallet path: ${walletPath}`);

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
        console.log(args)
        if(args === 'null'){
            console.log("hellloooosssssssssssssss")
            if(fcn === "queryAllProducts") {
                result = await contract.evaluateTransaction(fcn); 
            }else if(fcn === "queryAllTransactions") {
                console.log("hellloooosssssssssssssss")
                console.log(args)
                result = await contract.evaluateTransaction(fcn); 
            }
        }else{
            if(fcn === "queryProduct" || fcn === "queryProductsByOwner" || fcn === 'getHistoryForAsset' || fcn === 'restrictedMethod' || fcn === "queryTransaction") {
                result = await contract.evaluateTransaction(fcn, args); 
            } else if ( fcn == "readPrivateProduct" || fcn === "qeuryPrivateDataHash" || fcn === "collectionProductPrivateDetails"){
                result = await contract.evaluateTransaction(fcn, args[0], args[1]);
            } else if ( fcn == "queryPrivateTransactionDataHash"){
                result = await contract.evaluateTransaction(fcn, args[0], args[1]);
            }
        }
        console.log(result)
        console.log(`Transaction has been evaluted, result is: ${result.toString()}`);
        result = JSON.parse(result.toString());
        return result
    } catch (error) {
        console.error(`failed to evalute transaction: ${error}`);
        return error.message
    }
}

exports.query = query