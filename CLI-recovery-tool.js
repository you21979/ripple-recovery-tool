const {RippleAPI} = require('ripple-lib');
const sign = require('ripple-sign-keypairs');
const bip32 = require('ripple-bip32');
const bip39 = require('bip39');
var prompt = require('prompt');

var schema = {
    properties: {
      node: {
            description: "Enter the rippled node you want to connect to",
            default: "wss://s1.ripple.com",
            required: true
      },
      account: {
            description: "Enter your ripple address",
            required: true
       }
    }
};

function mnemonic2keypairs (mnemonic) {
    return bip32.fromSeedBuffer(bip39.mnemonicToSeed(mnemonic)).derivePath("m/44'/144'/0'/0/0").keyPair.getKeyPairs()
}

function log(str) {console.log(JSON.stringify(str))}
function main() {
    prompt.start();
    prompt.get(schema, function (err, result) {
        connect(result.node).then((val) => {
            var balance = getBalance(result.account).then((bal) => {
                console.log("There are "+bal+" XRP on this address")
                schema = {
                    properties: {
                        keyPairs: {
                            description: "Enter the BIP39 Mnemonic 24 words",
                            type: 'string',
                            required: true,
                            before: function(value) {return JSON.stringify(mnemonic2keypairs(value))}
                        },
                        fees: {
                            description: "Enter the fees for the transaction in drops",
                            pattern: /^[0-9]+(.[0-9]+)?$/,
                            type: 'string',
                            message: 'The fees have to be more than 10 drops',
                            default: '0.000010',
                            required: true
                        },
                        amount: {
                            description: "Enter the amount to send (remember 20XRP must stay on the account after fees and payment)",
                            pattern: /^[0-9]+(.[0-9]+)?$/,
                            type: 'string',
                            required: true
                        },
                        recipient: {
                            description: "Enter the address of the recipient account",
                            type: 'string',
                            required: true
                        },
                        tag: {
                            description: "Enter a destination tag if you want",
                            type: 'number',
                            required: false,
                            default: 0
                        }
                    }
                };
                prompt.get(schema, function (err, result2) {
                    var keyPairs = JSON.parse(result2.keyPairs)
                    send(
                    result2.amount,
                    result.account,
                    result2.recipient,
                    result2.fees,
                    result2.tag,
                    keyPairs.publicKey,
                    keyPairs.privateKey).then(() => {
                    console.log("End of transaction, close this window and double check the state of the transaction online : https://xrpcharts.ripple.com/#/graph")
                    })
                })
            })
        }).catch(function (error) {console.log("error", error)})
    })
}

var api = {}
function connect(node) {
    api = new RippleAPI({
            server: node
            });
    api.on('error', (errorCode, errorMessage) => {
        console.log(errorCode + ': ' + errorMessage);
    });
    api.on('connected', () => {
        console.log('connected');
    });
    api.on('disconnected', (code) => {
        console.log('disconnected, code:', code);
        exit();
    });
    return api.connect();
}

function getBalance(account) {
    return api.getBalances(account, {currency: "XRP"}).then((val) => {
        return val[0].value
    })
}

function send(amount, account, recipient, fees, tag, publicKey, privateKey) {
    return api.preparePayment(
        account,
        {
            source: {
                address: account,
                maxAmount: {
                    value: amount,
                    currency: "XRP"
                }
            },
            destination: {
                address: recipient,
                amount: {
                    value: amount,
                    currency: "XRP"
                },
                tag: tag
            }
        },
        {
            fee: fees
        }
        ).then((val) => {
            /*var tmp = JSON.parse(val.txJSON)
            tmp.LastLedgerSequence = 30180597;
            val.txJSON = JSON.stringify(tmp);
            log(val);*/
            //log({publicKey: publicKey, privateKey: privateKey});
            var signed = sign(val.txJSON, {privateKey: privateKey, publicKey: publicKey})
            //log(signed);
            return api.submit(
                signed.signedTransaction
            ).then((val) => {
                log(val.resultMessage)
                return true
            })
        })
}
console.log("Starting Ripple recovery")
main()
