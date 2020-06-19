import * as React from 'react';
import {
    IonButton,
    IonCol, IonInput, IonItem, IonLabel, IonRange,
    IonRow, IonSegment, IonSegmentButton, IonSelect, IonSelectOption,
    IonText, IonToolbar
} from "@ionic/react";
import i18n from "../i18n";

interface ContainerProps {
    list: any;
    setRange: (v: any) => void;
    opType:string;
}


const ExchangeContainer: React.FC<ContainerProps> = ({list, setRange,opType}) => {

    if(opType === 'buy'){

    }else {

    }

    return (
        <>
            <div style={{padding: "0 0 0 15px"}}>
                <div className={"text-item"}>单价(USDT)</div>
                <IonInput mode="ios" placeholder={"0.0000"} color={"dark"} inputmode={"decimal"} min="0" type="number"/>
                <div className={"text-item"}>数量(BTC)</div>
                <IonInput mode="ios" placeholder={"100"} color={"dark"} inputmode={"decimal"} min="0" type="number"/>
                <div style={{position: "absolute", right: 0}} className={"text-item"}>50.000 USDT</div>
                <div className={"text-item"}>可用</div>
            </div>
            <div>
                <IonRange mode="ios" dualKnobs={false} min={0} max={100} step={25} value={0} snaps={true}
                          onIonChange={e => setRange(e.detail.value as any)}/>
                <div className={"text-item-dark-large"}>0 USDT</div>

                <div>
                    <IonButton mode="ios" expand={"full"} size={"small"} style={{width: '100%'}} color={"danger"}>
                        卖出
                    </IonButton>
                </div>
            </div>
        </>
    );
};

export default ExchangeContainer;
