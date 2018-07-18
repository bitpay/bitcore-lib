const Transaction = require('./transaction');
const SpecialTransactions = require('./specialtransactions');
const RegisteredTypes = require('./specialtransactions/registeredtypes');

/**
 * Returns special transaction based on transaction payload
 * @param {Transaction} transaction
 * @return {Transaction|SpecialTransactions.SubTxRegister}
 */
function getSpecialTransaction(transaction) {
  if (!transaction.isSpecialTransaction()) {
    return transaction;
  }
  switch (transaction.type) {
    case RegisteredTypes.TRANSACTION_SUBTX_REGISTER:
      return new SpecialTransactions.SubTxRegister(transaction);
  }
}

module.exports = {
  parseTransaction: function parseTranasction(serializedTransaction) {
    var transaction = new Transaction(serializedTransaction);
    return getSpecialTransaction(transaction);
  }
};