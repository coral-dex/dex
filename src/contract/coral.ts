
import BigNumber from 'bignumber.js'
import utils from "../common/utils";
import {Bill, BlanceOfCoin, Deal, Order, PairInfo, PairVolumeInfo} from "../types/types";
import service from "../service/service";
import config from "./config";
import {rejects} from "assert";

const seropp = require('sero-pp');
const serojs = require('serojs');

export interface AllOrder {
    orders:Array<Order>
    count:number
}

class Coral {

    exchange:any;

    constructor() {
        this.exchange = serojs.callContract(config.exchange.abi, config.exchange.address);
    }

    async getFee(mainPKr:string,coin:string){
        return this.callExchangeBase("getFeeRate",mainPKr,[mainPKr,coin])
    }

    async getPayCoins():Promise<Array<string>>{
        const rest:any = await this.callExchangeBase("getPayCoins","",[]);
        return new Promise((resolve) => {
            resolve(rest[0])
        })
    }

    async tokenList(payCoin:string):Promise<Array<PairVolumeInfo>>{
        const decimal = await service.getDecimal(payCoin);
        const rest:any = await this.callExchangeBase("tokenList","",[payCoin]);
        const data:any = utils.convertResult(rest[0]);
        const ret:Array<PairVolumeInfo> = [];
        for(let d of data){
            const decimalEx = await service.getDecimal(d[0]);
            const pvi:any = {}
            pvi.exchangeCoin = d[0];
            pvi.payCoin = d[1];
            pvi.decimals = d[2];
            pvi.startPrice = utils.fromValue(d[3],decimal);
            pvi.lastPrice = utils.fromValue(d[4],decimal);
            pvi.volume = utils.fromValue(d[5],decimalEx);
            pvi.offline = d[6];
            ret.push(pvi)
        }
        return new Promise((resolve) => {
            resolve(ret)
        })
    }

    async pairInfo(exchangeCoin:string,coin:string):Promise<PairInfo>{
        const rest:any = await this.callExchange("pairInfo","",[exchangeCoin,coin])
        console.log("pairInfo>>> ",rest);
        return new Promise((resolve) => {
            try{
                const data:any = utils.convertResult(rest[0]);
                const buyOrdersArr = data[0]
                const sellOrdersArr = data[1]
                const decimal = service.getDecimalCache(coin);
                const decimal2 = service.getDecimalCache(exchangeCoin);
                const ret:PairInfo = {
                    buyOrders:buildOrders(buyOrdersArr,decimal,false),
                    sellOrders:buildOrders(sellOrdersArr,decimal,false),
                    minExchangeCoinValue:utils.fromValue(data[2],decimal2)
                };
                resolve(ret)
            }catch (e) {
                rejects(e)
            }
        })
    }

    async orders(mainPKr:string,exchangeCoin:string,coin:string):Promise<Array<Order>>{
        const decimal = await service.getDecimal(coin);
        const rest:any = await this.callExchangeBase("pendingOrders",mainPKr,[exchangeCoin,coin])
        return new Promise((resolve) => {
            const orderArr = utils.convertResult(rest[0]);
            resolve(buildOrders(orderArr,decimal,true))
        })
    }

    async pairVolumeOf24H(mainPKr:string,exchangeCoin:string,coin:string):Promise<Array<any>>{
        const decimalEx = await service.getDecimal(coin);
        const decimalCoin = await service.getDecimal(coin);
        const rest:any = await this.callExchangeBase("pairVolumeOf24H",mainPKr,[exchangeCoin,coin])
        return new Promise((resolve) => {
            const retArr:Array<BigNumber> = [];
            retArr.push(utils.fromValue(rest[0],decimalCoin))
            retArr.push(utils.fromValue(rest[1],decimalCoin))
            retArr.push(utils.fromValue(rest[2],decimalEx))
            resolve(retArr)
        })
    }


    async allOrders(mainPKr:string,exchangeCoin:string,coin:string,offset:number,limit:number):Promise<AllOrder>{
        const decimal = await service.getDecimal(coin);
        const rest:any = await this.callExchangeBase("pageOrders",mainPKr,[exchangeCoin,coin,offset,limit])

        return new Promise((resolve) => {
            const orderArr = utils.convertResult(rest[0]);
            resolve({orders:buildOrders(orderArr,decimal,true),count:parseInt(rest[1])})
        })
    }

    async getBills(mainPKr:string,coin:string,offset:number,limit:number):Promise<Array<Bill>>{
        const rest:any =  await this.callExchange("getBills",mainPKr,[coin,offset,limit])
        // const amount:any = rest[1];
        const data = utils.convertResult(rest[0])
        const decimal = await service.getDecimal(coin);
        let h:Array<Bill> = [];
        for(let d of data){
            h.push({
                value:utils.fromValue(d[0],decimal),
                timestamp:d[1],
                type: converState(d[2])
            })
        }
        return new Promise((resolve) => {
            resolve(h)
        })
    }

    async getExBills(mainPKr:string,coin:string):Promise<Array<Bill>>{
        const rest:any =  await this.callExchange("getExBills",mainPKr,[coin])

        const data = utils.convertResult(rest[0])
        const decimal = await service.getDecimal(coin);
        let h:Array<Bill> = [];
        for(let d of data){
            h.push({
                value:utils.fromValue(d[0],decimal),
                timestamp:d[1],
                type: converState(d[2])
            })
        }
        return new Promise((resolve) => {
            resolve(h)
        })
    }

    async balanceOf(mainPKr:string,coin:string):Promise<Array<BlanceOfCoin>>{
        const rest:any = await this.callExchange("balanceOf",mainPKr,[coin])
        const balances:Array<BlanceOfCoin> = []
        const arr:Array<any> = utils.convertResult(rest[0])
        if(arr){
            for(let d of arr){
                const decimal = await service.getDecimal(d[2]);
                balances.push({
                    amount:utils.fromValue(d[0],decimal),
                    lockedAmount: utils.fromValue(d[1],decimal),
                    coin:d[2]
                })
            }
        }
        return new Promise((resolve) => {
            resolve(balances)
        })
    }

    async withdraw(pk:string,mainPKr:string,tokenStr:string,value:BigNumber){
        return this.executeExchange("withdraw",pk,mainPKr,[tokenStr,utils.toHex(value)],"SERO",utils.toValue(0,0))
    }

    async cancel(pk:string,mainPKr:string,exchangeCoin:string,payCoin:string,orderIds:Array<number>){
        return this.executeExchange("cancel",pk,mainPKr,[exchangeCoin,payCoin,orderIds],"SERO",utils.toValue(0,0))
    }

    async buyFromWallet(pk:string,mainPKr:string,exchangeCoin:string,price:BigNumber,value:BigNumber,amount:BigNumber,cy:string){
        return this.executeExchange("buyFromWallet",pk,mainPKr,[exchangeCoin,utils.toHex(price),utils.toHex(value)],cy,amount)
    }

    async buy(pk:string,mainPKr:string,exchangeCoin:string,payCoin:string,price:BigNumber,value:BigNumber){
        return this.executeExchange("buy",pk,mainPKr,[exchangeCoin,payCoin,utils.toHex(price),utils.toHex(value)],"SERO",utils.toValue(0,0))
    }

    async sell(pk:string,mainPKr:string,exchangeCoin:string,payCoin:string,price:BigNumber,value:BigNumber){
        return this.executeExchange("sell",pk,mainPKr,[exchangeCoin,payCoin,utils.toHex(price),utils.toHex(value)],"SERO",utils.toValue(0,0))
    }

    async sellFromWallet(pk:string,mainPKr:string,payCoin:string,price:BigNumber,cy:string,value:BigNumber){
        return this.executeExchange("sellFromWallet",pk,mainPKr,[payCoin,utils.toHex(price)],cy,value)
    }

    // === base

    callExchange(method:string, from:string, args:any) {
        return this.callMethod(this.exchange,method, from, args)
    }

    callExchangeBase(method:string, from:string, args:any) {
        return this.callMethod(this.exchange,method, from, args)
    }

    executeExchange(method:string, pk:string, mainPKr:string, args:any, cy:string, value:BigNumber) {
        return this.executeMethod(this.exchange,method, pk,mainPKr,args,cy,value)
    }

    async callMethod(contract:any,method:string, from:string, args:any) {
        let packData = contract.packData(method, args,true);
        let callParams:any = {
            to: contract.address,
            data: packData
        };
        if(from){
            callParams["from"] = from;
        }
        return new Promise((resolve, reject) => {
            service.jsonRpc("sero_call",[callParams,"latest"]).then((callData:any)=>{
                if (callData !== "0x") {
                    const res = contract.unPackDataEx(method, callData);
                    resolve(res);
                } else {
                    resolve("");
                }
            }).catch(e=>{
                reject(e)
            })
        })
    }

    async executeMethod(contract:any,method:string, pk:string, mainPKr:string, args:any, cy:string, value:BigNumber) {
        let packData = contract.packData(method, args,true);
        let executeData:any = {
            from: pk,
            to: contract.address,
            value: "0x" + value.toString(16),
            data: packData,
            gasPrice: "0x" + new BigNumber("1000000000").toString(16),
            cy: cy,
        };
        let estimateParam:any = {
            from: mainPKr,
            to: contract.address,
            value: "0x" + value.toString(16),
            data: packData,
            gasPrice: "0x" + new BigNumber("1000000000").toString(16),
            cy: cy,
        };

        return new Promise((resolve, reject) => {
            service.jsonRpc("sero_estimateGas",[estimateParam]).then((gas:any)=>{
                executeData["gas"] = gas;
                seropp.executeContract(executeData, function (res:any, error:any) {
                    if(error){
                        reject(error)
                    }else {
                        resolve(res)
                    }
                })
            }).catch(e=>{
                reject(e)
            })
        });

    }
}

function buildOrders(arr:Array<any>,decimal:number,showAll?:boolean):Array<Order>{
    try{
        const orders:Array<Order> = [];
        if(arr){
            for(let d of arr){
                if(d[5] === "0" || showAll){
                    orders.push({
                        id:d[0],
                        // owner:d[1],
                        // receiverAddr:d[2],
                        // opData:d[3],
                        price:utils.fromValue(d[1],decimal),
                        value:utils.fromValue(d[2],18),
                        dealValue:utils.fromValue(d[3],18),
                        createTime:d[4],
                        status:d[5],
                        orderType:d[6],
                        payCoinValue:utils.fromValue(d[7],decimal)
                    })
                }
            }
        }
        return orders;
    }catch (e) {
        throw e
    }
}

function converState(v:any) {
    if(v === "0"){
        return "充值"
    }else if(v === "1"){
        return "提现"
    }else if(v === "2"){
        return "买入"
    }else if(v === "3"){
        return "卖出"
    }else{
        return ""
    }
}

const coral = new Coral();
export default coral