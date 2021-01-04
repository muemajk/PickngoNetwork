const {Gateway, Wallets, TxEventHandler, GatewaOptions, DefaultEventHandlerStrategies, TxEventHandlerFactory } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const log4js = require('log4js');
const logger = log4js.getLogger('BasicNetwork');
const util = require('util');

const helper = require('./helper')

const invokeTransaction = async (channelName, chaincodeName, fcn, args, username, org_name, transientData) => {
    try {
        logger.debug(util.format('\n==================== invoke transaction on channel %s ==========\n', channelName));
        const ccp = await helper.getCCP(org_name)
        const walletPath = await helper.getWalletPath(org_name) //path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path hapa: ${walletPath}`);
        let identity = await wallet.get(username);
        if (!identity) {
            console.log(`An identity for the user ${username} does not exist in the wallet. Registering user`);
            await helper.getRegisteredUser(username, org_name, true);
            identity = await wallet.get(username);
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        console.log("hahahahahapaaaaaapapapapapapa", fcn)
        const connectOptions = {
            wallet, identity: username, discovery: { enabled: true, asLocalhost: true },
            eventHandlerOptions: {
                commitTimeout: 100,
                strategy: DefaultEventHandlerStrategies.NETWORK_SCOPE_ALLFORTX
            }
        }
        const gateway = new Gateway();
        
        await gateway.connect(ccp, connectOptions);
        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);

        let result;
        let message;
        
        if (fcn === "createProduct" || fcn === 'createPrivateProductImpicitForOrg1' || fcn === "createPrivateProductForOrg2" ){
            result = await contract.submitTransaction( fcn, args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9])
            message = `Successfully added the product with key ${args[0]}`;

        }else if (fcn === "changeProductOwner") {
            result = await contract.submitTransaction(fcn, args[0],args[1]);
            message = `Succesfully changged product owner with key ${args[0]}`;
        }else if (fcn === "createPrivateProduct" || fcn === "updatePrivateData") {
            console.log(`Transient data is 45 : ${transientData}`)
            let productData = JSON.parse(transientData)
            let key = Object.keys(productData)[0]
            const transientDataBuffer = {}
            transientDataBuffer[key] = Buffer.from(JSON.stringify(productData.product));
            result = await contract.createTransaction(fcn).setTransient(transientDataBuffer).submit() 
            message = `Successfully submitted transient data`;
        }else if (fcn === "createTransactionAction") {
            result = await contract.submitTransaction( fcn, args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8])
            message = `Successfully added the Transaction with key ${args[0]}`;
        }else if (fcn === "updateTransactionPickedData"){
            result = await contract.submitTransaction(fcn, args[0],args[1],args[2]);
            message =`Successfully updated the Transaction with key ${args[0]}`;
        }
         else {
            return `Invocation require either createProduct or changeProductOwner  but got ${fcn}`;
        }

        await gateway.disconnect();
        result = JSON.parse(result.toString());

        let response = {
            message: message,
            result
        }

        return response;
    } catch (error) {
        console.log(`Getting error: ${error}`)
        return error.message;
    }

}
exports.invokeTransaction = invokeTransaction;