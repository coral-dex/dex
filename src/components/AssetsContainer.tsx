import * as React from 'react';
import {IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonRow, IonText} from "@ionic/react";
import {BlanceOfCoin} from "../types/types";

interface ContainerProps {
  info: BlanceOfCoin;
  withdraw:(info:BlanceOfCoin)=>void;
  showBills:(info:BlanceOfCoin)=>void;
}

const AssetsContainer: React.FC<ContainerProps> = ({ info,withdraw,showBills }) => {
  return (
      <IonCard>
          <IonCardHeader mode="ios">
              <IonCardTitle mode="ios">
                  <IonText mode="ios" className={"text-font-lg"}>{info.coin}</IonText> <IonText color={"medium"} className={"text-font-sm"}></IonText></IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
              <IonRow className={"text-center"}>
                  <IonCol>
                      <IonText mode="ios" className={"text-item"}>持有数量</IonText>
                  </IonCol>
                  <IonCol>
                      <IonText mode="ios" className={"text-item"}>可用数量</IonText>
                  </IonCol>
                  <IonCol>
                      <IonText mode="ios" className={"text-item"}>锁定数量</IonText>
                  </IonCol>
              </IonRow>
              <IonRow className={"text-center"}>
                  <IonCol>
                      <IonText mode="ios" className={"text-item-dark"}>{info.amount.plus(info.lockedAmount).toString(10)}</IonText>
                  </IonCol>
                  <IonCol>
                      <IonText mode="ios" className={"text-item-dark"}>{info.amount.toString(10)}</IonText>
                  </IonCol>
                  <IonCol>
                      <IonText mode="ios" className={"text-item-dark"}>{info.lockedAmount.toString(10)}</IonText>
                  </IonCol>
              </IonRow>

              <IonRow className={"text-center"}>
                  <IonCol>
                      <IonButton mode="ios" size={"small"} fill="outline" expand="block" onClick={()=>withdraw(info)}>提现</IonButton>
                  </IonCol>
                  <IonCol>
                      <IonButton mode="ios" size={"small"} fill="outline" expand="block" onClick={()=>showBills(info)}>账单</IonButton>
                  </IonCol>
                  <IonCol>
                      <IonButton  mode="ios"size={"small"} fill="outline" expand="block" onClick={()=>{
                          window.location.href = "#/exchange"
                      }}>交易</IonButton>
                  </IonCol>
              </IonRow>
          </IonCardContent>
      </IonCard>
  );
};

export default AssetsContainer;
