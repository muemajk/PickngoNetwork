'use strict'
var util = require('util');
var axios = require('axios').default
var helper = require('./helper.js');
var logger = helper.getLogger('invoke-chaincode');

var invokeChaincode = async function (peerNames, channelName, chaincodeName, fcn, args, username, org_name) {
    logger.debug(util.format('\n===== invoke transaction on channel %s =====\n', channelName));
    var error_message = null;
    var tx_id_string = null;

    try {
        var client = await helper.getClientForOrg(org_name, username);
        logger.debug('Successfully got the fabric client for the organisation "%s"', org_name);
        var channel = client.getChannel(channelName);
        if (!channel) {
            let message = util.format('Channel %s was not defined in the connection profile', channelName);
            logger.error(message);
            throw new Error(message);
        }
        var tx_id = client.newTransactionID();
        tx_id_string = tx_id.getTransactionID();

        console.log(`args are .........: ${args.length}`)

        var request = {
            targets: peerNames,
            chaincodeId: chaincodeName,
            fcn: fcn,
            args: args,
            chainId: channelName,
            txId: tx_id
        };

        let results = await channel.sendTransactionProposal(request);
        var proposalResponses = results[0];
        var proposal = results[1];

        var all_good = true;
        for (var i in proposalResponses) {
            let one_good = false;
            logger.debug("Logging proposal Responses", proposalResponses[i]);
            if(proposalResponses && proposalResponses[i].response &&
                proposalResponses[i].response.status === 200) {
                    one_good = true;
                    logger.info('invoke chaincode proposal was good');
                } else {
                    logger.error('invoke chaincode proposal was bad');
                }
                all_good = all_good && one_good;
        }
        if (all_good) {
            logger.info(util.format(
                'Succesfully sent Proposal and received ProposalResponse: Status - %s, message - "%s",  metadata - "%s", endorsment signature: %s',
                proposalResponses[0].response.status, proposalResponses[0].response.message,
                proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature
            ));

            var promises = [];
            let event_hubs = channel.getChannelEventHubsForOrg();
            event_hubs.foreach((eh) => {
                logger.debug('invokeEventPromise - setting up event');
                let invokeEventPromise = new Promise((resolve, reject) => {
                    let event_timeout = setTimeout(() => {
                        let message = 'REQUEST_TIMEOUT:' + eh.getPeerAddr();
                        logger.error(message);
                        eh.disconnect();
                    }, 50000);
                    eh.registerTxEvent(tx_id_string, async (tx, code, block_num) => {
                        logger.info('The chaincode invoke chaincode trandsaction has been committed on peer %s', eh.getPeerAddr());
                        logger.info('Transaction %s has status of %s in block %s', tx, code, block_num);
                        logger.debug('Getting transaction for transaction id %s', tx)

                        clearTimeout(event_timeout);

                        if (code !== 'VALID') {
                            let message = util.format('The invoke chaincode transaction was invalid, code:%s', code);
                            logger.error(message);
                            reject(new Error(message));
                        } else {
                            let message = "The invoke chaincode transaction was valid.";
                            logger.info(message);
                            resolve(message);
                        }

                    },
                    (err) => {
                        clearTimeout(event_timeout);
                        logger.error(err);
                        reject(err)
                    },
                    { unregister: true, disconnect: true }
                    );
                    eh.connect();
                });
                promises.push(invokeEventPromise);
            });

            var orderer_request = {
                txId: tx_id,
                proposalResponses: proposalResponses,
                proposal: proposal
            };

            var sendPromise = channel.sendTransaction(orderer_request);
            promises.push(sendPromise);
            let results = await Promise.all(promises)
            logger.debug(util.fomart('---->>> RESPONSE : %j', results));
            let response = results.pop();
            if( response.status == 'SUCCESS') {
                logger.info('Successfully sent transaction to the orderer.');
            } else {
                error_message = util.format('Failed to order the transaction. Error code: %s', response.status);
                logger.debug(error_message);
            }

            for (let i in results ) {
                let event_hub_results = results[i];
                let event_hub = event_hubs[i];
                logger.debug('Event results for event hub : %s', event_hub.getPeerAddr());
                if (typeof event_hub_results === 'string') {
                    logger.debug(event_hub_results);
                } else {
                    if (!error_message) error_message = event_hub_results.toString();
                    logger.debug(event_hub_results.toString());
                }
             }
            
        }else{
            error_message = util.format('Failed to send proposal and received all good proposalResponse');
            logger.debug(error_message);
        }
    }catch (error) {
        logger.error('Failed to invoke due to error: ' + error.stack ? error.stack : error);
        error_message = error.toString();
    } 
    if (!error_message) {
        let message = util.format(
            'Successfully invoked the chaincode %s to the channel \'%s\' for transaction ID: %s',
            org_name, channelName, tx_id_string);
        logger.info(message);
        return { "tx_id": tx_id_string };
    } else {
		let message = util.format('Failed to invoke chaincode. cause:%s', error_message);
		logger.error(message);
		throw new Error(message);
	}
};



exports.invokeChaincode = invokeChaincode;
