import * as React from 'react';
import {
    IonButton,
    IonCol, IonItem, IonLabel,
    IonRow,
    IonText
} from "@ionic/react";
import {Order, PairInfo} from "../types/types";
import BigNumber from "bignumber.js";
import utils from "../common/utils";
import mapSort from "mapsort";
import i18n from "../i18n";

interface ContainerProps {
    detail?: PairInfo;
    vol24:Array<BigNumber>
    payCoin:string;
    exchangeCoin:string;
    setAmountAndPrice:(price:any,amount?:any)=>void;
}

const PriceContainer: React.FC<ContainerProps> = ({detail,vol24,payCoin,exchangeCoin,setAmountAndPrice}) => {
    const height: number = document.documentElement.clientHeight * 0.5;
    //(421-44)/421*11/421*5

    let latestPrice = "0.0000";
    if(vol24.length >= 3){
        latestPrice = vol24[1].toFixed(4,1)
    }

    const buyList:Array<any> = [];
    const sellList:Array<any> = [];
    if(detail){
        if(detail.buyOrders && detail.buyOrders.length>0){
            let i:number = 0 ;
            let total:BigNumber = new BigNumber(0) ;

            // key = price ,value = amount
            const sortMap:Map<string,BigNumber> = new Map();
            const sortArr:Array<string> = [];
            for(let d of detail.buyOrders){
                const key = d.price.toFixed(utils.priceFixed(),1);
                const amount = d.value.minus(d.dealValue);
                if(sortMap.has(key)){
                    let value:any = sortMap.get(key);
                    value = value.plus(amount)
                    sortMap.set(key,value)
                }else {
                    sortMap.set(key,amount)
                }
                if(sortArr.indexOf(key) === -1){
                    sortArr.push(key)
                }
                total = total.plus(amount)
            }
            let itemTotal:BigNumber = new BigNumber(0) ;

            const sortedArray = mapSort(
                sortArr,
                parseFloat,
                (a, b) => b - a
            );

            for(let price of sortedArray){
                const amount:any = sortMap.get(price);
                itemTotal = itemTotal.plus(amount)
                const tmp = itemTotal.toFixed(utils.amountFixed(),2);
                buyList.push(
                    <IonRow onClick={()=>{setAmountAndPrice(price,tmp)}}>
                        <IonCol size="2">
                            <IonText mode="ios" className={"text-item-buy"}>{++i}</IonText>
                        </IonCol>
                        <IonCol size="10">
                            <IonText mode="ios" className={"text-item-buy"}>{price}</IonText>
                            <IonText mode="ios" className={"text-item-amount"}>{amount.toFixed(utils.amountFixed(),2)}</IonText>
                            <span className="dynamic_changes bg-buy-color" style={{width: itemTotal.multipliedBy(100).dividedBy(total).toFixed(6)+"%"}}/>
                        </IonCol>
                    </IonRow>
                )
            }
        }
        if(detail.sellOrders && detail.sellOrders.length>0){
            let total:BigNumber = new BigNumber(0) ;

            // key = price ,value = amount
            const sortMap:Map<string,BigNumber> = new Map();
            const sortArr:Array<string> = [];
            for(let d of detail.sellOrders){
                const key = d.price.toFixed(utils.priceFixed(),1)
                const amount = d.value.minus(d.dealValue);
                if(sortMap.has(key)){
                    let value:any = sortMap.get(key);
                    value = value.plus(amount)
                    sortMap.set(key,value)
                }else {
                    sortMap.set(key,amount)
                }
                if(sortArr.indexOf(key) === -1){
                    sortArr.push(key)
                }
                total = total.plus(amount)
            }

            const sortedArray = mapSort(
                sortArr,
                parseFloat,
                (a, b) => a -b
            );

            let itemTotal:BigNumber = total ;
            for(let i=sortedArray.length-1;i>=0;i--){
                const price = sortedArray[i];
                const amount:any = sortMap.get(price)
                const tmp = itemTotal.toFixed(utils.amountFixed(),2);
                sellList.push(
                    <IonRow onClick={()=>{setAmountAndPrice(price,tmp)}}>
                        <IonCol size="2">
                            <IonText mode="ios" className={"text-item-sell"}>{i+1}</IonText>
                        </IonCol>
                        <IonCol size="10">
                            <IonText mode="ios" className={"text-item-sell"}>{price}</IonText>
                            <IonText mode="ios" className={"text-item-amount"}>{amount.toFixed(utils.amountFixed(),2)}</IonText>
                            <span className="dynamic_changes bg-dec-color" style={{width: itemTotal.multipliedBy(100).dividedBy(total).toFixed(6)+"%"}}/>
                        </IonCol>
                    </IonRow>
                )
                itemTotal = itemTotal.minus(amount)
            }
        }
    }

    let color = "success";
    let symbol = "+";
    let percent: string = "0";
    if(vol24 && vol24.length>=3){
        const startPrice= vol24[0];
        const lastPrice= vol24[1];
        if (startPrice.comparedTo(0) > 0) {
            percent = lastPrice.minus(startPrice).multipliedBy(100).dividedBy(startPrice).toFixed(2);
            if (lastPrice.minus(startPrice).comparedTo(0) < 0) {
                color = "danger";
                symbol = "";
            }
        }
    }

    return (
        <>
            <div>
                <IonItem lines="none">
                    <IonLabel><IonText className={"text-item"}>{i18n.t("price")}({payCoin})</IonText></IonLabel>
                    <IonText className={"text-item"}>{i18n.t("amount")}({exchangeCoin})</IonText>
                </IonItem>
            </div>
            <div style={{overflowY: "scroll", height: (height - 44) / 11 * 5}} id="sellScroll">
                {sellList}
            </div>
            <div style={{overflowY: "scroll", height: (height - 44) / 11 * 1}}>
                <IonRow onClick={()=>{setAmountAndPrice(latestPrice)}}>
                    <IonCol size="6" >
                        <IonText mode="ios" className={"text-style"} style={{fontWeight:800}} color={color}>{latestPrice}</IonText>
                    </IonCol>
                    <IonCol size="6">
                        <IonText mode="ios" className={"text-style"} style={{fontWeight:800}} color={color}>{symbol}{percent}%</IonText>
                    </IonCol>
                </IonRow>
            </div>

            <div style={{overflowY: "scroll", height: (height - 44) / 11 * 5}}>
                {buyList}
            </div>
        </>
    );
};

export default PriceContainer;
