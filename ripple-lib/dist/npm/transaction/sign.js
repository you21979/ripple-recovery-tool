'use strict'; // eslint-disable-line strict

var utils = require('./utils');
var keypairs = require('ripple-keypairs');
var binary = require('ripple-binary-codec');

var _require = require('ripple-hashes'),
    computeBinaryTransactionHash = _require.computeBinaryTransactionHash;

var validate = utils.common.validate;

function computeSignature(tx, privateKey, signAs) {
  var signingData = signAs ? binary.encodeForMultisigning(tx, signAs) : binary.encodeForSigning(tx);
  return keypairs.sign(signingData, privateKey);
}

function signWithKeypair(txJSON, keypair) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  validate.sign({ txJSON: txJSON, keypair: keypair });

  var tx = JSON.parse(txJSON);
  if (tx.TxnSignature || tx.Signers) {
    throw new utils.common.errors.ValidationError('txJSON must not contain "TxnSignature" or "Signers" properties');
  }

  tx.SigningPubKey = options.signAs ? '' : keypair.publicKey;

  if (options.signAs) {
    var signer = {
      Account: options.signAs,
      SigningPubKey: keypair.publicKey,
      TxnSignature: computeSignature(tx, keypair.privateKey, options.signAs)
    };
    tx.Signers = [{ Signer: signer }];
  } else {
    tx.TxnSignature = computeSignature(tx, keypair.privateKey);
  }

  var serialized = binary.encode(tx);
  return {
    signedTransaction: serialized,
    id: computeBinaryTransactionHash(serialized)
  };
}

function sign(txJSON, secret, options, keypair) {
  if (typeof secret === 'string') {
    // we can't validate that the secret matches the account because
    // the secret could correspond to the regular key
    validate.sign({ txJSON: txJSON, secret: secret });
    return signWithKeypair(txJSON, keypairs.deriveKeypair(secret), options);
  } else {
    return signWithKeypair(txJSON, keypair ? keypair : secret, options);
  }
}

module.exports = sign;