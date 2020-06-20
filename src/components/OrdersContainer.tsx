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
                    <IonCol>
                        {d.status === "0" ?<IonButton onClick={()=>{cancel(d.id)}} size="small" mode="ios" color="danger" expand={"block"} fill="outline">{i18n.t("cancelOrder")}</IonButton>:""}
                    </IonCol>
                    <IonCol>
                        <IonText mode="ios" className={"text-item2"} color={d.orderType?"danger":"success"}>{d.orderType?i18n.t("sell"):i18n.t("buy")}</IonText><br/>
                    </IonCol>
                    <IonCol>
                        <IonText mode="ios" className={"text-item"}>{utils.timeFormat(new Date(Math.ceil(parseInt(d.createTime)*1000)))}</IonText>
                    </IonCol>
                    <IonCol>
                        <IonText mode="ios" className={"text-item"}>{d.price.toFixed(utils.priceFixed())}</IonText>
                    </IonCol>
                    <IonCol>
                        <IonText mode="ios" className={"text-item"}>{d.dealValue.toString(10)}/{d.value.toString(10)}</IonText>
                    </IonCol>
                </IonRow>
            )
        }
    }
  return (
      <div>
          <IonRow className={"text-center"}>
              <IonCol>
                  <IonText mode="ios" className={"text-item"}>{i18n.t("operation")}</IonText>
              </IonCol>
              <IonCol>
                  <IonText mode="ios" className={"text-item"}>{i18n.t("opType")}</IonText>
              </IonCol>
              <IonCol>
                  <IonText mode="ios" className={"text-item"}>{i18n.t("createTime")}</IonText>
              </IonCol>
              <IonCol>
                  <IonText mode="ios" className={"text-item"}>{i18n.t("price")}({payCoin})</IonText>
              </IonCol>
              <IonCol>
                  <IonText mode="ios" className={"text-item"}>{i18n.t("exchangeAmount")}({exchangeCoin})</IonText>
              </IonCol>
          </IonRow>
          {items}
      </div>
  );
};

export default OrdersContainer;
