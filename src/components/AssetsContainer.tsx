import * as React from 'react';
import {IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonRow, IonText} from "@ionic/react";
import {BlanceOfCoin} from "../types/types";
import i18n from "../i18n";

interface ContainerProps {
  info: BlanceOfCoin;
  withdraw:(info:BlanceOfCoin)=>void;
  showBills:(info:BlanceOfCoin,pageNo:number)=>void;
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
                      <IonText mode="ios" className={"text-item"}>{i18n.t("total")}</IonText>
                  </IonCol>
                  <IonCol>
                      <IonText mode="ios" className={"text-item"}>{i18n.t("available")}</IonText>
                  </IonCol>
                  <IonCol>
                      <IonText mode="ios" className={"text-item"}>{i18n.t("locked")}</IonText>
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
                      <IonButton mode="ios" size={"small"} fill="outline" expand="block" onClick={()=>withdraw(info)}>{i18n.t("withdraw")}</IonButton>
                  </IonCol>
                  <IonCol>
                      <IonButton mode="ios" size={"small"} fill="outline" expand="block" onClick={()=>showBills(info,1)}>{i18n.t("bill")}</IonButton>
                  </IonCol>
                  <IonCol>
                      <IonButton  mode="ios"size={"small"} fill="outline" expand="block" onClick={()=>{
                          window.location.href = "#/exchange"
                      }}>{i18n.t("exchange")}</IonButton>
                  </IonCol>
              </IonRow>
          </IonCardContent>
      </IonCard>
  );
};

export default AssetsContainer;
