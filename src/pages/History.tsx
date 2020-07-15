import * as React from 'react';
import {
    IonList,
    IonItem,
    IonLabel,
    IonText,
    IonItemDivider,
    IonRow,
    IonCol,
    IonButton,
    IonContent,
    IonPage
} from '@ionic/react'

import utils from '../common/utils'
import {storage} from "../common/storage";
import coral from "../contract/coral";
import config from "../contract/config";
import i18n from '../i18n'

class History extends React.Component<any, any>{

    state:any = {
        currentVersion: "v1.0.0"
    }

    componentDidMount(): void {
        this.setState({
            currentVersion: storage.get(storage.keys.currentContract)?storage.get(storage.keys.currentContract).version:""
        })
    }

    setVersion(v:any){

        storage.set(storage.keys.currentContract,v);
        setTimeout(function () {
            coral.init();
            window.location.href = "#/quotes"
        },500)
    }

    render(): React.ReactNode {
        const {currentVersion} = this.state;
        const versions = config.versions;

        return <IonPage>
            <IonContent>
                <p style={{padding:"0 20px",fontSize:"12px",color:"#92949c"}}>
                    {i18n.t("versionDescription")}
                </p>

                <IonItemDivider mode={"ios"}>
                    <IonLabel>
                        {i18n.t("currentVersion")}
                    </IonLabel>
                </IonItemDivider>

                <div style={{padding:'0 20px'}} >
                    <h3>{currentVersion}</h3>
                </div>

                <IonItemDivider mode={"ios"}>
                    <IonLabel>
                        {i18n.t("historyVersion")}
                    </IonLabel>
                </IonItemDivider>

                <IonRow>
                    <IonCol className="text-item-version">{i18n.t("version")}</IonCol>
                    <IonCol className="text-item-version">{i18n.t("releaseDate")}</IonCol>
                    <IonCol className="text-item-version">{i18n.t("state")}</IonCol>
                    <IonCol className="text-item-version">{i18n.t("operation")}</IonCol>
                </IonRow>

                <div style={{height:document.documentElement.clientHeight*0.65,overflowY:"scroll"}}>
                    {
                        versions.map((v:any)=>{
                            return <IonRow>
                                <IonCol className="text-item-version">
                                    <IonText style={{fontWeight:"600"}}>
                                        {v.version}<br/>
                                        {v.latest?<IonText color="success">Latest</IonText>:""}
                                    </IonText>
                                </IonCol>
                                <IonCol className="text-item-version">
                                    <IonText>
                                        {utils.timeFormat(new Date(v.date))}
                                    </IonText>
                                </IonCol>
                                <IonCol className="text-item-version">
                                    <IonText color={v.state===0?"success":"danger"} style={{fontWeight:"600"}}>
                                        {v.state ===0?i18n.t("state_0"):i18n.t("state_1")}
                                    </IonText></IonCol>
                                <IonCol className="text-item-version">
                                    {
                                        currentVersion === v.version?"":<IonButton mode={"ios"} size={"small"} fill="outline" onClick={()=>{
                                            this.setVersion(v)
                                        }}>{i18n.t("switch")}</IonButton>
                                    }

                                </IonCol>
                            </IonRow>
                        })
                    }
                </div>
            </IonContent>
        </IonPage>

    }
}

export default History