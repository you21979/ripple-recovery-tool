const {RippleAPI} = require('./ripple-lib/dist/npm/index.js');
const $ = require('jquery');
var DOM = {};
    DOM.node = $("#node");
    DOM.account = $("#account");
    DOM.amount = $("#amount");
    DOM.privateKey = $("#privateKey");
    DOM.publicKey = $("#publicKey");
    DOM.fees = $("#fees");
    DOM.tag = $("#tag");
    DOM.recipient = $("#recipient");
    DOM.connect = $("#connect");
    DOM.send = $("#send");
    DOM.getBalance = $("#getBalance");
    DOM.balance = $("#balance");
    DOM.display = $("#display");
// Events
DOM.getBalance.on("click", getBalance);
DOM.send.on("click", send);
DOM.connect.on("click", connect);


function display(val) {
    DOM.display.text(val);
}
var api = {}
function connect() {
    api = new RippleAPI({
    server: DOM.node.val()
    });
    api.on('error', (errorCode, errorMessage) => {
        display(errorCode + ': ' + errorMessage);
    });
    api.on('connected', () => {
        display('connected');
    });
    api.on('disconnected', (code) => {
        // code - [close code](https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent) sent by the server
        // will be 1000 if this was normal closure
        display('disconnected, code:', code);
    });
    api.connect().then(() => {
        /* insert code here */
        }).then(() => {
            return api.disconnect();
    }).catch((error) => {display(error)});

}

function getBalance() {
    api.getBalances(DOM.account.val()).then((val) => {
        display(val)
        document.getElementById("balance").innerHTML=JSON.parse(val)[0].value})
}

function send() {
    api.preparePayment(
        DOM.account.val(),
        {
            source: {
                address: DOM.account.val(),
                amount: DOM.amount.val(),
                tag: DOM.tag.val()
            },
            destination: {
                address: DOM.recipient.val(),
                minAmount: DOM.amount.val(),
                tag: DOM.tag.val()
            },
            instructions: {
                fee: DOM.fees.val()
            }
        }).then((val) => {
            api.submit(
                api.signWithKeypairs(val, {publicKey: DOM.publicKey.val(), privateKey: DOM.privateKey.val()}).signedTransaction
            ).then((val) => {
                display(val)
            })
        })

}