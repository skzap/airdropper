var steem = require('steem')
const javalon = require('javalon')
const wif = process.env.PRIVATE_KEY
const creator = 'dtube'
const prefix = ''
const give_bw = 50000
const give_vt = 1000
const give_dtc = 100

steem.api.streamBlock(function(err, res) {
    if (err) throw err;
    for (let i = 0; i < res.transactions.length; i++) {
        const tx = res.transactions[i]
        for (let y = 0; y < tx.operations.length; y++) {
            const op = tx.operations[y];
            if (op[0] == 'account_update') {
                var username = op[1].account
                try {
                    var json = JSON.parse(op[1].json_metadata)
                } catch (error) {
                    return
                }
                
                if (json && json.profile && json.profile.dtube_pub) {
                    var pubKey = json.profile.dtube_pub
                    console.log('Creating '+username+' '+pubKey)
                    var txData = {
                        pub: pubKey,
                        name: prefix+username
                    }
                    var newTx = {
                        type: 0,
                        data: txData
                    }
                    newTx = javalon.sign(wif, creator, newTx)
                    javalon.sendTransaction(newTx, function(err, res) {
                        if (err) return
                        console.log('Feeding '+username)
                        setTimeout(function() {
                            if (give_vt) {
                                var newTx = {
                                    type: 14,
                                    data: {
                                        amount: give_vt,
                                        receiver: prefix+username
                                    }
                                }
                                newTx = javalon.sign(wif, creator, newTx)
                                javalon.sendTransaction(newTx, function(err, res) {})
                            }

                            if (give_bw) {
                                var newTx = {
                                    type: 15,
                                    data: {
                                        amount: give_bw,
                                        receiver: prefix+username
                                    }
                                }
                                newTx = javalon.sign(wif, creator, newTx)
                                javalon.sendTransaction(newTx, function(err, res) {})
                            }
                            
                            if (give_dtc) {
                                var newTx = {
                                    type: 3,
                                    data: {
                                        amount: give_dtc,
                                        receiver: prefix+username,
                                        memo: 'Welcome to DTube chain!'
                                    }
                                }
                                newTx = javalon.sign(wif, creator, newTx)
                                javalon.sendTransaction(newTx, function(err, res) {})
                            }
                        }, 6000)
                    })
                }
            }
        }
    }
})