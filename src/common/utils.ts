import BigNumber from 'bignumber.js'
import {storage} from "./storage";

export default {

    ellipsis: (str: string): string => {
        const splet: number = 10;
        if (str && str.length > splet) {
            str = str.substr(0, splet) + '...' + str.substr(str.length - splet);
        }
        return str;
    },

    toHex(value: string | BigNumber | number): string {
        return "0x" + new BigNumber(value).toString(16)
    },

    toValue(value: string | BigNumber | number, decimal: number): BigNumber {
        return new BigNumber(value).multipliedBy(new BigNumber(10).pow(decimal));
    },

    fromValue(value: string | BigNumber | number, decimal: number): BigNumber {
        if (!value) {
            value = 0;
        }
        return new BigNumber(value).dividedBy(new BigNumber(10).pow(decimal));
    },

    hexToString(v: string | number | BigNumber) {
        if (!v) {
            return "0";
        }
        return new BigNumber(v).toString(10)
    },

    compare(a: string | number | BigNumber,b: string | number | BigNumber){
        return new BigNumber(a).comparedTo(b)
    },

    dateFormat(fmt:string, date:Date) {
        let ret;
        const opt:any = {
            "Y+": date.getFullYear().toString(),
            "m+": (date.getMonth() + 1).toString(),
            "d+": date.getDate().toString(),
            "H+": date.getHours().toString(),
            "M+": date.getMinutes().toString(),
            "S+": date.getSeconds().toString()
        };
        for (let k in opt) {
            ret = new RegExp("(" + k + ")").exec(fmt);
            if (ret) {
                fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
            }
        }
        return fmt;
    },

    timeFormat(date:Date){
        return this.dateFormat("HH:MM:SS mm/dd",date)
    },

    convertResult(result: any) {
        const resultArray: any = [];
        result.forEach(function (res: any, i: any) {
            if (isFinite(i))
                resultArray.push(res);
        });
        const convert = function (resultArray: any) {
            return resultArray.map(function (res: any) {
                if (res.constructor.name === 'BN') {
                    res = res.toString(10);
                } else if (res instanceof Array) {
                    res = convert(res);
                }
                return res;
            });
        };
        return convert(resultArray);
    },

    priceFixed(){
        const fixed:number = storage.get(storage.keys.fixed.price) as number;
        return fixed?fixed:4
    },

    amountFixed(){
        const fixed:number = storage.get(storage.keys.fixed.amount) as number;
        return fixed?fixed:4
    },

    balanceFixed(){
        const fixed:number = storage.get(storage.keys.fixed.balance) as number;
        return fixed?fixed:6
    }


}

