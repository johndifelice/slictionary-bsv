"use strict";

//GOOGLE_APPLICATION_CREDENTIALS
const axios = require("axios");
const bsv = require("bsv");
const {Forge} = require("txforge");
const https = require("https");

const exchangeApiUrl = "https://api.whatsonchain.com/v1/bsv/main/exchangerate";
const _privKey = "L1FJLDZWMrBR7JmXKPCfzrUZahBWqLdPaGnDjWQJLJFXAKmvp67V";

const privKey = new bsv.PrivKey().fromString(_privKey);
const keyPair = new bsv.KeyPair().fromPrivKey(privKey);

    //const addBounty = async(
    const getBSVexchangeRate = async() => {
        let rate = 0;
        let jsonRate = "";

        try{
            jsonRate = await axios.get(exchangeApiUrl);
            rate = Number(jsonRate["data"]["rate"]);
        } catch (error){
            console.log(error);
        }

        return rate;
    }


    const getUtxoBalance = async(fromAddress) => {
        return new Promise(resolve => {
            setTimeout(() => {
                https.get(`https://api.mattercloud.net/api/v3/main/address/${fromAddress.toString()}/utxo`, (res) => {
                    let data = '';
                    res.on("data", (chunk) => {
                        data += chunk;
                    });
        
                    res.on("end", () => {
                        let resp = JSON.parse(data);
                        resolve(resp[0].satoshis);
                    });
                });

            },2000);
        });
    }


    const getUTXOs = async(address) => {
        return new Promise(resolve => {
            setTimeout(() => {
                let utxos;
                const fromAddress = "1AMzdZFfkJC7PnxXQndCPKp2q2v8TZSW9E"
                https.get(`https://api.mattercloud.net/api/v3/main/address/${fromAddress.toString()}/utxo`, (res) => {
                    let data = '';
                    res.on('data',(chunk) => {
                        data += chunk;
                    });

                    res.on('end', () => {
                        utxos = JSON.parse(data);
                        resolve(utxos);
                    });    

                    res.on('error', error => {
                        console.error(error)
                    })
                });    
            },2000);
        });
    }


    const sendPayment = async(_toAddress, _satAmount, _opReturn) => {
        var opReturn = _opReturn;
        var toAddress = _toAddress;
        var satAmount = _satAmount;
        
        return new Promise(resolve => {
            setTimeout(() => {
                const fromAddress = "1AMzdZFfkJC7PnxXQndCPKp2q2v8TZSW9E";

                https.get(`https://api.mattercloud.net/api/v3/main/address/1AMzdZFfkJC7PnxXQndCPKp2q2v8TZSW9E/utxo`, (res) => {
                    let data = '';
                    res.on('data',(chunk) => {
                        data += chunk;
                    });

                    res.on('end', () => {
                        let utxos = JSON.parse(data); // these are the utxos
                        let rawTx = buildForge(utxos, toAddress, satAmount, opReturn);

                        postRawTx(rawTx); //UNCOMMENT TO PROCESS PAYMENT
                        resolve('SUCCESS');
                    });    

                    res.on('error', error => {
                        console.error(error)
                    })
                })
            },2000);    
        })
    }

    const getRawTx = async(_fromAddress, _toAddress, _satAmount, _opReturn) => {
        //var opReturn = _opReturn;
        //var toAddress = _toAddress;
        //var satAmount = _satAmount;
        
        return new Promise(resolve => {
            setTimeout(() => {
                //const fromAddress = "1AMzdZFfkJC7PnxXQndCPKp2q2v8TZSW9E";

                https.get(`https://api.mattercloud.net/api/v3/main/address/${_fromAddress}/utxo`, (res) => {
                    let data = '';
                    res.on('data',(chunk) => {
                        data += chunk;
                    });

                    res.on('end', () => {
                        let utxos = JSON.parse(data); // these are the utxos
                        let rawTx = buildForge(utxos, _toAddress, _satAmount, _opReturn);
                        resolve(rawTx);
                    });    

                    res.on('error', error => {
                        console.error(error)
                    })
                });
                
            },2000);    
        })
    }

    const getAddress = async(walletUserName) => {
        let jsonAddress = await axios.get('https://api.polynym.io/getAddress/' + walletUserName);
    
        return jsonAddress["address"];
    }


    const postRawTx = async(rawTx) => {
        // Send rawTransaction to WhatsOnChain
        const https = require('https');

        const data = JSON.stringify({
            txhex: rawTx
        });

        const options = {
            hostname: 'api.whatsonchain.com',
            port: 443,
            path: '/v1/bsv/main/tx/raw',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }

        const req = https.request(options, res => {
            console.log(`statusCode: ${res.statusCode}`)

            res.on('data', d => {
                //process.stdout.write(d)
                console.log('Post data: ', d);
            })
        })

        req.on('error', error => {
            console.error(error)
        })

        req.write(data)
        req.end()
    }

    const buildForge = async(_utxo, _toAddress, _satAmount, _opReturn) => {
        const opReturnKey = "19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut";
        const privKey = new bsv.PrivKey().fromString(_privKey);
        const keyPair = new bsv.KeyPair().fromPrivKey(privKey);

        const forge  = new Forge ({
            inputs: [_utxo],
            outputs: [
                {
                    to: _toAddress,
                    satoshis: _satAmount
                },
                {
                    data: [opReturnKey,_opReturn,'utf-8']
                }
            ],
            changeTo: _utxo[0].address
        });

        forge.build().sign({keyPair});
        
        return forge.tx.toHex();
}

export{getAddress, sendPayment, getUTXOs, getUtxoBalance, getBSVexchangeRate,
        getRawTx}