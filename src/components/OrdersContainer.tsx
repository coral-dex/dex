import * as React from 'react';
import {
    IonCol,
    IonRow,
    IonText,
    IonButton
} from "@ionic/react";
import {Order} from "../types/types";
import utils from "../common/utils";
import i18n from "../i18n";

interface ContainerProps {
  list: Array<Order>;
  payCoin?: string;
  exchangeCoin?:string;
  cancel:(id:any)=>void;
}

const OrdersContainer: React.FC<ContainerProps> = ({ list,payCoin,exchangeCoin,cancel }) => {
    const items:Array<any> = [];
    if(list && list.length>0){
        for(let i = 0;i<list.length;i++){
            const d = list[i];
            items.push(
                <IonRow className={"text-center"}>
                    <IonCol size="2">
                        {d.status === "0" ?<IonButton onClick={()=>{cancel(d.id)}} size="small" mode="ios" color="danger" expand={"block"} fill="outline">{i18n.t("cancelOrder")}</IonButton>:converState(d.status)}
                    </IonCol>
                    <IonCol size="3">
                        <IonText mode="ios" className={"text-item text-center"}>{d.payCoinValue.toFixed(4)}</IonText>
                    </IonCol>
                    <IonCol size="2">
                        <IonText mode="ios" className={"text-item text-center"}>{utils.timeFormat(new Date(Math.ceil(parseInt(d.createTime)*1000)))}</IonText>
                    </IonCol>
                    <IonCol size="2">
                        <IonText mode="ios" className={"text-item text-center"}>{d.price.toFixed(utils.priceFixed())}</IonText><br/>
                        <IonText mode="ios" className={"text-item2 text-center"} color={d.orderType?"danger":"success"}>{d.orderType?i18n.t("sell"):i18n.t("buy")}</IonText>
                    </IonCol>
                    <IonCol size="3">
                        <IonText mode="ios" className={"text-item text-center"}>{d.dealValue.toFixed(4)}/{d.value.toFixed(4)}</IonText>
                    </IonCol>
                </IonRow>
            )
        }
    }
  return (
      <div>
          <IonRow className={"text-center"}>
              <IonCol size="2">
                  <IonText mode="ios" className={"text-item text-center"}>{i18n.t("operation")}</IonText>
              </IonCol>
              <IonCol size="3">
                  <IonText mode="ios" className={"text-item text-center"}>{i18n.t("exAmount")}({payCoin})</IonText>
              </IonCol>
              <IonCol size="2">
                  <IonText mode="ios" className={"text-item text-center"}>{i18n.t("createTime")}</IonText>
              </IonCol>
              <IonCol size="2">
                  <IonText mode="ios" className={"text-item text-center"}>{i18n.t("price")}({payCoin})</IonText>
              </IonCol>
              <IonCol size="3">
                  <IonText mode="ios" className={"text-item text-center"}>{i18n.t("exchangeAmount")}({exchangeCoin})</IonText>
              </IonCol>
          </IonRow>
          {items}
      </div>
  );
};

function converState(state:string) {
    if(state === "1"){
        return <IonText mode="ios" className={"text-item2"} color="success">{i18n.t("completed")}</IonText>
    }else if(state === "2"){
        return <IonText mode="ios" className={"text-item2"} color="danger">{i18n.t("canceled")}</IonText>
    }
}
export default OrdersContainer;
