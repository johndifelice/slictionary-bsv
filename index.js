"use strict";

const axios = require('axios');
const bsv = require('bsv');
const {Forge} = require('txforge');
const https = require('https');
const { exception } = require('console');
const exchangeApiUrl = "https://api.whatsonchain.com/v1/bsv/main/exchangerate";

module.exports = { 
    
    getBSVexchangeRate:async function(){
        let rate = 0;
        let jsonRate = "";

        try{
            jsonRate = await axios.get(exchangeApiUrl);
            rate = Number(jsonRate["data"]["rate"]);
        } catch (error){
            console.log(error);
        }

        return rate;
    },


    getUtxoBalance:async function(fromAddress) {
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
    },


    getUTXOs:async function(address){
        return new Promise(resolve => {
            setTimeout(() => {
                let utxos;
                https.get(`https://api.mattercloud.net/api/v3/main/address/${address.toString()}/utxo`, (res) => {
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
}