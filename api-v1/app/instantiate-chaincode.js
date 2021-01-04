'use strict'
var util = require('util');
var helper = require('./helper.js')
var logger = helper.getLogger('instantiate-chaincode');

var instantiateChaincode = async function (peers, channelName, 
    chaincodeName, chaincodeVersion, 
    functionName, chaincodeType, args, username, org_name) {
        logger.debug('\n\n========= Instantiate chaincode on channel ' +  channelName +
        '===============\n');
        var error_message = null;
        try {
            var client = await helper.getClientForOrg(arg_name, username);
            logger.debug('Successfully got the fabric cleint for the organisation "%s"', org_name);
            var channel = client.getChannel(channelName);
            if(!channel) {
                let message = util.format('Channel %s was not defined in the connection profile', channelName);
                logger.error(message);
                throw new Error(message);
            }
            var tx_id = client.newTransactionID(true);
            var deployId = tx_id.getTransactionID();
            var request = {
                targets : peers,
                chaincodeId : chaincodeName,
                chaincodeType : chaincodeType,
                chaincodeVersion: chaincodeVersion,
                args: args,
                txId: tx_id,
                'endorsment-policy' : {
                    indentities: [
                        {role: { name:'member', mspID: 'Org1MSP'}},
                        {role: { name: 'member', mspId: 'Org1MSP'}}
                    ],
                    policy: {
                        '2-of':[{ 'signed-by': 0 }, {'signed-by': 1 }]
                    }
                }
            };
            if (functionName){
                request.fcn = functionName;
            }

            let results = await channel.sendInstantiateProposal(request, 60000);
            var proposalResponses = results[0];
            var proposal = result[1];
            var all_good = true;
            for ( var i in proposalResponses){
                let one_good = false;
                if(proposalResponses && proposalResponses[i].response 
                && proposalResponses[i].response.status === 200) {
                    one_good = true;
                    logger.info('instantiate proposal was good');
                }else {
                    logger.error('Instantiate proposal was bad');
                }
                all_good = all_good && one_good;
            }

            if(all_good) {
                logger.info(util.format(
                    'Successfully sent proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
                    proposalResponses[0].response.status, proposalResponses[0].response.message,
                    proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature
                ));

                var promises = [];
                let event_hubs = channel.getChannelEventHubsForOrg();
                logger.debug('found %s eventhubs for this organisation %s', event_hubs.length, org_name);
                event_hubs.forEach((eh) => {
                    let instantiateEventPromise = new Promise((resolve, reject) => {
                        logger.debug('instantiateEventPromise - setting up event');
                        let event_timeout = setTimeout(() => {
                            let message = 'REQUEST_TIMEOUT:' + eh.getPeerAddr();
                            logger.error(message);
                            eh.disconnect();
                        }, 60000);
                        eh.registerTxEvent(deployId, (tx, code, block_num) => {
                            logger.info('The chaincode instantiate transaction has been committed on peer %s', eh.getPeerAddr());
                            logger.info('Transaction %s has status of %s  in block %s', tx, code, block_num);
                            clearTimeout(event_timeout);

                            if (code !== 'VALID'){
                                let message = util.format('The chaincode instantiate transaction was invalid, code:%s', code);
                                logger.error(message);
                                reject(new Error(message));
                            } else {
                                let message = 'The chaincode instantiate transaction was valid.';
                                logger.info(message);
                                resolve(message);
                            }
                        }, (err) => {
                            clearTimeout(event_timeout);
                            logger.error(err);
                            reject(err);
                        },
                            {unregister: true, disconnect: true}
                        );
                        eh.connect();
                    });
                    promises.push(instantiateEventPromise);
                });

                var orderer_request = {
                    txId: tx_id,
                    proposalResponses: proposalResponses,
                    proposal: proposal
                };
                var sendPromise = channel.sendTransaction(orderer_request);
                promises.push(sendPromise);
                let results = await Promise.all(promises);
                logger.debug(util.format('---->> RESPONSE: %j', results));
                let response = results.pop();
                if (response.status === 'SUCCESS') {
                    logger.info('Successfully sent transaction to orderer.');
                } else {
                    error_message = util.format('Failed to order the transaction. Error code: %s', response.status);
                    logger.debug(error_message);
                }

                for (let i in results) {
                    let event_hub_result = result[i];
                    let event_hub = event_hub[i];
                    logger.debug('Event results for event hub :%s', event_hub.getPeerAddr());
                    if(typeof event_hub_result === 'string') {
                        logger.debug(event_hub_result);
                    } else {
                        if(!error_message) error_message = event_hub_result.toString();
                        logger.debug(event_hub_result.toString());
                    }
                }

            } else {
                error_message = util.format('Failed to send Proposal and receive all good ProposalResponse');
                logger.debug(error_message);
            }
        } catch (error) {
            logger.error('Failed to send instantiate due to error: ' + error.stack ? error.stack : error);
            error_message = error.toString();
        }

        if (!error_message) {
            let message = util.format(
                'Successfully instantiate chaincode in organisation %s to the channel \'%s\'',
                org_name, channelName);
            logger.info(message);

            let response = {
                succes: true,
                message: message
            };
            return response;
        } else {
            let message = util.format('Failed to instantiate. cause: %s', error_message);
            logger.error(message);
            throw new Error(message);
        }
};

exports.instantiateChaincode = instantiateChaincode;