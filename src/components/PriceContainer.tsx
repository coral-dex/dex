import * as React from 'react';
import {
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
    lastPrice?:any;
    payCoin:string
    exchangeCoin:string
}

const PriceContainer: React.FC<ContainerProps> = ({detail,lastPrice,payCoin,exchangeCoin}) => {
    const height: number = document.documentElement.clientHeight * 0.5;
    //(421-44)/421*11/421*5

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
                const key = d.price.toFixed(utils.priceFixed())
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
                buyList.push(
                    <IonRow>
                        <IonCol size="1">
                            <IonText mode="ios" className={"text-item-buy"}>{++i}</IonText>
                        </IonCol>
                        <IonCol size="11">
                            <IonText mode="ios" className={"text-item-buy"}>{price}</IonText>
                            <IonText mode="ios" className={"text-item-amount"}>{amount.toFixed(utils.amountFixed())}</IonText>
                            <span className="dynamic_changes_b bg-buy-color" style={{width: itemTotal.multipliedBy(100).dividedBy(total).toFixed(6)+"%"}}/>
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
                const key = d.price.toFixed(utils.priceFixed())
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
                sellList.push(
                    <IonRow>
                        <IonCol size="1">
                            <IonText mode="ios" className={"text-item-sell"}>{i+1}</IonText>
                        </IonCol>
                        <IonCol size="11">
                            <IonText mode="ios" className={"text-item-sell"}>{price}</IonText>
                            <IonText mode="ios" className={"text-item-amount"}>{amount.toFixed(utils.amountFixed())}</IonText>
                            <span className="dynamic_changes bg-dec-color" style={{width: itemTotal.multipliedBy(100).dividedBy(total).toFixed(6)+"%"}}/>
                        </IonCol>
                    </IonRow>
                )
                itemTotal = itemTotal.minus(amount)
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
            <div style={{overflowY: "scroll", height: (height - 44) / 11 * 5}}>
                {sellList}
            </div>
            <div style={{overflowY: "scroll", height: (height - 44) / 11 * 1}}>
                <IonRow>
                    <IonCol size="6">
                        <IonText mode="ios" className={"text-item-current"}>{lastPrice}</IonText>
                    </IonCol>
                    <IonCol size="1">
                        <IonText mode="ios" className={"text-item"}>≈</IonText>
                    </IonCol>
                    <IonCol size="5">
                        <IonText mode="ios" className={"text-item"}>¥0.0000</IonText>
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
