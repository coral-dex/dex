import * as React from 'react';
import {
    IonButton,
    IonCol, IonGrid, IonItem, IonLabel, IonList,
    IonRow,
    IonSearchbar, IonSegment, IonSegmentButton,
} from "@ionic/react";
import {PairVolumeInfo} from "../types/types";
import {storage} from "../common/storage";
import utils from "../common/utils";
import i18n from "../i18n";

interface ContainerProps {
    list: Array<PairVolumeInfo>;
    onSearch:(text:string)=>void;
    searchText:string
    selectCoin:string
    setPayCoin:(v:string)=>void;
    coins:Array<string>
    goExchange:(data:any)=>void;

}

const renderPayCoins = (payCoins:Array<string>) => {
    const h: any = [];
    for (let coin of payCoins) {
        h.push(
            <IonSegmentButton mode="md" value={coin}>
                <IonLabel mode="md">{coin}</IonLabel>
            </IonSegmentButton>
        )
    }
    return h;
}

const MarketContainer: React.FC<ContainerProps> = ({ list,onSearch,searchText,selectCoin,setPayCoin,coins,goExchange }) => {

    let h: Array<any> = [];
    for (let i = 0; i < list.length; i++) {
        const data = list[i];
        let color = "success";
        let symbol = "";
        let percent: string = "0";
        if (data.startPrice.comparedTo(0) > 0) {
            percent = data.lastPrice.minus(data.startPrice).multipliedBy(100).dividedBy(data.startPrice).toFixed(2);
            if (data.lastPrice.minus(data.startPrice).comparedTo(0) < 0) {
                color = "danger";
                // symbol = "-";
            }
        }

        h.push(
            <IonItem mode="ios" onClick={() => goExchange(data)}>
                <IonGrid>
                    <IonRow>
                        <IonCol className="text-center text-style">
                            <div>
                                {data.exchangeCoin}/{data.payCoin}<br/>
                                <span className="text-light">Vol:{data.volume.toFixed(4)}</span>
                            </div>
                        </IonCol>
                        <IonCol className="text-center text-style">
                            <div>
                                {data.lastPrice.toFixed(utils.priceFixed())}<br/>
                                {/*<span className="text-light">¥18.10</span>*/}
                            </div>
                        </IonCol>
                        <IonCol className="text-center text-style">
                            <IonButton mode="ios" color={color}>{symbol}{percent}%</IonButton>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonItem>
        )
    }

  return (
      <>
          <IonSearchbar mode="ios" value={searchText} placeholder={"SERO"}onIonChange={e => onSearch(e.detail.value!)}/>
          <IonSegment mode="md" value={selectCoin} onIonChange={e => setPayCoin(e.detail.value!)}>
              {renderPayCoins(coins)}
          </IonSegment>
          <IonGrid>
              <IonRow>
                  <IonCol className="text-center text-style">{i18n.t("24hVol")}</IonCol>
                  <IonCol className="text-center text-style">{i18n.t("latestPrice")}</IonCol>
                  <IonCol className="text-center text-style">{i18n.t("24hPercent")}</IonCol>
              </IonRow>
          </IonGrid>
          <IonList mode="ios">
              {h}
          </IonList>
      </>
  );
};

export default MarketContainer;
