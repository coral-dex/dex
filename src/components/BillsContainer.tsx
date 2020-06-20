import * as React from 'react';
import {
    IonCol,
    IonRow,
    IonText,
    IonButton, IonList
} from "@ionic/react";
import {Bill, BlanceOfCoin} from "../types/types";
import utils from "../common/utils";
import i18n from "../i18n";

interface ContainerProps {

    bills: Array<Bill>
    showMore: boolean
    info?: BlanceOfCoin
    pageNo: number

    showBill?: (info: BlanceOfCoin, pageNo?: number) => void;
}

const BillsContainer: React.FC<ContainerProps> = ({bills, showMore, info, pageNo, showBill}) => {
    const h: Array<any> = [];
    h.push(
        <IonRow>
            <IonCol className={"text-item text-center"}>{i18n.t("createTime")}</IonCol>
            <IonCol className={"text-item text-center"}>{i18n.t("opType")}</IonCol>
            <IonCol className={"text-item text-center"}>{i18n.t("amount")}({info?.coin})</IonCol>
        </IonRow>
    )
    if (bills && bills.length > 0) {
        for (let d of bills) {
            h.push(
                <IonRow>
                    <IonCol
                        className={"text-item-dark text-center"}>{utils.timeFormat(new Date(Math.ceil(parseInt(d.timestamp) * 1000)))}</IonCol>
                    <IonCol className={"text-item-dark text-center"}>{d.type}</IonCol>
                    <IonCol className={"text-item-dark text-center"}>{d.value.toString(10)}</IonCol>
                </IonRow>
            )
        }
    }
    if (showMore && info) {
        h.push(
            <IonRow>
                <IonCol>
                    <IonButton fill="outline" mode="ios" size="small" expand="block" onClick={() => {
                        showBill&&showBill(info, pageNo + 1)
                    }}>{i18n.t("loadMore")}</IonButton>
                </IonCol>
            </IonRow>
        )
    }
    return (
        <div>
            <IonList>
                {h}
            </IonList>
        </div>
    );
};

export default BillsContainer;
