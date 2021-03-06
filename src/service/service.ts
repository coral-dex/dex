import axios from 'axios'
import BigNumber from "bignumber.js";
// @ts-ignore
import seropp from 'sero-pp'
import i18n from "../i18n";
import {storage} from "../common/storage";

export interface Tx {
    from:string
    mainPKr:string
    value:BigNumber
    poolId?:string
}

class Service {

    id: number

    constructor() {
        this.id = 0;
    }

    async jsonRpc(method: string, args: any) {
        let host = localStorage.getItem("rpcHost");
        if(!host){
            await this.initApp();
            host = localStorage.getItem("rpcHost");
        }
        const data: any = {
            id: this.id++,
            method: method,
            params: args
        }
        return new Promise((resolve, reject) => {
            if(!host){
                reject(new Error("rpc host undefined!"))
            }else{
                axios.post(host, data).then((resp: any) => {
                    if(resp.data && resp.data.error){
                        reject(resp.data.error.message)
                    }else if(resp.data && resp.data.result){
                        resolve(resp.data.result)
                    }
                }).catch(e => {
                    reject(e)
                })
            }
        })
    }

    async commitTx(tx:Tx){
        await this.initApp()
        return new Promise<any>((resolve, reject) => {
            let executeData = {
                from: tx.from,
                value: "0x" + tx.value.toString(16),
                gasPrice: '0x' + new BigNumber('1000000000').toString(16),
                cy: "SERO",
                gas:'0x' + new BigNumber('25000').toString(16),
                BuyShare: {
                    Vote: tx.mainPKr,
                    Value: '0x' + tx.value.toString(16),
                    Pool: tx.poolId
                }
            }
            seropp.executeContract(executeData, function (rest:any,err:any) {
                if(err){
                    reject(err)
                }else{
                    resolve(rest)
                }
            })
        })
    }

    async getDecimal(currency: string): Promise<any> {
        if (currency == 'SERO') {
            return new Promise(resolve => resolve(18));
        }
        const cache: any = storage.get(storage.keys.decimal(currency));
        if (cache) {
            return new Promise(resolve => resolve(cache));
        } else {
            const data:any = await this.jsonRpc('sero_getDecimal', [currency]);
            const decimal = new BigNumber(data, 16).toNumber();
            storage.set(storage.keys.decimal(currency), decimal);
            return new Promise(resolve => resolve(decimal));
        }
    }

    getDecimalCache(currency: string): any {
        if (currency == 'SERO') {
            return 18;
        }
        const cache: any = storage.get(storage.keys.decimal(currency));
        return cache;
    }

    async initApp(){
        return new Promise(resolve=>{
            const dapp = {
                name: "Coral DEX",
                contractAddress: "Coral DEX",
                github: "https://github.com/coral-dex/dex",
                author: "Coral DEX",
                url: window.location.origin+window.location.pathname,
                logo: window.location.origin+window.location.pathname +"assets/icon/icon.png",
            }

            seropp.init(dapp,function (rest:any) {

                seropp.getInfo(function (data:any) {
                    if(data){
                        localStorage.setItem("language",data.language);
                        localStorage.setItem("rpcHost",data.rpc)
                        i18n.changeLanguage(data.language).then(() => {
                            // document.location.href = 'http://' + document.location.host;
                        });
                    }
                    resolve()
                })
            })
        })
    }

    async getAccounts(){
        await this.initApp()
        return new Promise((resolve,reject) => {
            seropp.getAccountList((data:any,err:any)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(data)
                }
            })
        })
    }

    async getAccount(pk:string){
        await this.initApp()

        return new Promise((resolve,reject) => {
            seropp.getAccountDetail(pk,(data:any,err:any)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(data)
                }
            })
        })
    }

}

const service:Service = new Service()
export default service