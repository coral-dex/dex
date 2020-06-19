import * as React from 'react';
import {
    IonCol,
    IonRow,
    IonText,
    IonButton
} from "@ionic/react";
import {Order} from "../types/types";
import utils from "../common/utils";

interface ContainerProps {
  list: Array<Order>;
  payCoin?: string;
  exchangeCoin?:string;
  cancel:(id:any)=>void;
}

const OrdersContainer: React.FC<ContainerProps> = ({ list,payCoin,exchangeCoin,cancel }) => {
    const items:Array<any> = [];
    if(list && list.length>0){
        for(let i = list.length -1 ; i>=0;i--){
            const d = list[i];
            items.push(
                <IonRow className={"text-center"}>
                    <IonCol>
                        {d.status === "0" ?<IonButton onClick={()=>{cancel(d.id)}} size="small" mode="ios" color="danger" expand={"block"} fill="outline">撤销</IonButton>:""}
                    </IonCol>
                    <IonCol>
                        <IonText mode="ios" className={"text-item2"} color={d.orderType?"danger":"success"}>{d.orderType?"卖出":"买入"}</IonText><br/>
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
                  <IonText mode="ios" className={"text-item"}>操作</IonText>
              </IonCol>
              <IonCol>
                  <IonText mode="ios" className={"text-item"}>类型</IonText>
              </IonCol>
              <IonCol>
                  <IonText mode="ios" className={"text-item"}>时间</IonText>
              </IonCol>
              <IonCol>
                  <IonText mode="ios" className={"text-item"}>价格({payCoin})</IonText>
              </IonCol>
              <IonCol>
                  <IonText mode="ios" className={"text-item"}>交易量({exchangeCoin})</IonText>
              </IonCol>
          </IonRow>
          {items}
      </div>
  );
};

export default OrdersContainer;
