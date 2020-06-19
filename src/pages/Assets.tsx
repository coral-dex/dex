import React from 'react';
import {
    IonContent,
    IonPage,
    IonButton,
    IonModal,
    IonSearchbar,
    IonList,
    IonItem,
    IonInput,
    IonLabel,
    IonText,
    IonGrid,
    IonRow,
    IonCol,
    IonAlert,
    IonIcon,
    IonToolbar,
    IonButtons,
    IonMenuButton, IonPopover,
    IonTitle, IonSelect, IonHeader, IonSelectOption, IonLoading
} from '@ionic/react';
import './quotes.css'
import AssetsContainer from "../components/AssetsContainer";
import coral from "../contract/coral";
import service from "../service/service";
import {storage} from "../common/storage";
import {person} from 'ionicons/icons'
import {Bill, BlanceOfCoin, PairVolumeInfo} from "../types/types";
import utils from "../common/utils";

const customActionSheetOptions = {
    header: 'Accounts',
    subHeader: 'Select one account for coral exchange'
};

interface State {
    accounts:any
    selectAccount:any
    searchText:string
    assets:Array<BlanceOfCoin>
    list:Array<BlanceOfCoin>
    showModal:boolean
    value:string,
    info?:BlanceOfCoin
    showPopover:boolean
    showLoading:boolean
    showAlert:boolean
    bills:Array<Bill>
}

class Assets extends React.Component<State, any>{

    state:State = {
        accounts:[],
        selectAccount:{},
        searchText:'',
        assets:[],
        list:[],
        showModal:false,
        value:'',
        showPopover:false,
        showLoading:false,
        showAlert:false,
        bills:[]
    }

    componentDidMount(): void {
        const that = this;
        this.getAccounts().then(rest=>{
            that.getAssets();
        }).catch(e=>{

        })
    }

    getAssets(){
        const that = this;
        const {selectAccount} = this.state;
        that.setState({
            showLoading:true
        })
        coral.balanceOf(selectAccount.MainPKr,"").then((rest:any)=>{
            that.setState({
                assets:rest,
                list:rest,
                showLoading:false
            })
        })
    }

    async getAccounts(){
        const rest:any = await service.getAccounts();
        let current = rest[0];
        const pk:string = storage.get(storage.keys.account.current);
        if(pk){
            current = await service.getAccount(pk);
        }

        this.setState({
            accounts:rest,
            selectAccount:current
        })
    }

    async setAccount (pk:any){
        const that = this;
        const rest:any = await service.getAccount(pk);
        storage.set(storage.keys.account.current,pk)
        that.setState({
            selectAccount:rest,
            showPopover:false
        })
        that.getAssets()
    }

    onSearch(v:any){
        const {assets} = this.state;
        const list:Array<BlanceOfCoin> = [];
        for(let d of assets){
            if(d.coin.indexOf(v.toUpperCase())>-1){
                list.push(d)
            }
        }
        this.setState({
            list:list
        })
    }

    withdraw =(info:BlanceOfCoin)=>{
        this.setState({
            info:info,
            showAlert:true
        })
    }

    renderAssets = ()=>{
        const {list} = this.state;
        const h:Array<any> = [];
        for(let d of list){
            h.push(<AssetsContainer info={d} withdraw={this.withdraw} showBills={this.showBill}/>)
        }
        return h;
    }

    showBill =(info:BlanceOfCoin)=>{
        const that = this;
        const {selectAccount} = this.state;
        that.setState({
            showLoading:true,
            showModal:true
        })
        coral.getBills(selectAccount.MainPKr,info.coin).then((rest:any)=>{
            console.log("getBills>> ",rest)

            that.setState({
                bills:rest,
                showLoading:false,
            })
        }).catch(e=>{
            console.log(e)
        })
    }

    withdrawConfirm(o:any){
        const that = this;
        if(o && o["amount"]){
            const value:any = o["amount"];
            const {info,selectAccount} = this.state;
            if(info){
                const decimal = service.getDecimalCache(info.coin);
                const amount = utils.toValue(value,decimal);
                if(amount.comparedTo(info.amount.minus(info.lockedAmount)) === -1){
                    alert("余额不够")
                    return
                }
                coral.withdraw(selectAccount.PK,selectAccount.MainPKr,info.coin,amount).then(hash=>{
                    console.log(hash)
                })
            }
        }

    }

    setShowModal(f:boolean){
        this.setState({
            showModal:f
        })
    }

    setValue(v:any){
        this.setState({
            value:v
        })
    }

    renderAccountsOp(accounts:any){
        let ops = [];
        const that = this;
        if(accounts && accounts.length>0){
            for(let i=0;i<accounts.length;i++){
                const act = accounts[i];
                ops.push(<IonItem onClick={()=>{that.setAccount(act.PK).catch()}}>{act.Name}</IonItem>)
            }
        }
        return ops
    }
    setShowPopover(f:boolean){
        this.setState({
            showPopover:f
        })
    }

    setShowAlert(f:boolean){
        this.setState({
            showAlert:f
        })
    }

    renderBill = ()=>{
        const {bills} = this.state;
        const h:Array<any> = [];
        h.push(
            <IonRow>
                <IonCol className={"text-item text-center"}>时间</IonCol>
                <IonCol className={"text-item text-center"}>类型</IonCol>
                <IonCol className={"text-item text-center"}>金额</IonCol>
            </IonRow>
        )
        if(bills && bills.length>0){
            for (let d of bills){
                h.push(
                    <IonRow>
                        <IonCol className={"text-item-dark text-center"}>{utils.timeFormat(new Date(Math.ceil(parseInt(d.timestamp) * 1000)))}</IonCol>
                        <IonCol className={"text-item-dark text-center"}>{d.type}</IonCol>
                        <IonCol className={"text-item-dark text-center"}>{d.value.toString(10)}</IonCol>
                    </IonRow>
                )
            }
        }
        return h
    }

    render(): React.ReactNode {
        const {searchText,showModal,value,selectAccount,accounts,showPopover,showLoading,info,showAlert} = this.state;
        const options = this.renderAccountsOp(accounts)
        const billsInfo:any = this.renderBill();
        return (
            <IonPage>
                <IonContent>
                    <IonHeader mode="ios">
                        <IonToolbar mode="ios">
                            <IonTitle>
                                资产
                            </IonTitle>
                            <IonButtons slot="end" onClick={()=>{this.setShowPopover(true)}}>
                                <div className="popover-content sc-ion-popover-ios popover-cst">
                                    <IonPopover mode="ios"
                                        isOpen={showPopover}
                                        cssClass='my-custom-class'
                                        onDidDismiss={()=>this.setShowPopover(false)}
                                    >
                                        <IonList>
                                            {options}
                                        </IonList>

                                    </IonPopover>
                                </div>

                                <IonIcon icon={person} />{selectAccount.Name}
                            </IonButtons>
                        </IonToolbar>
                    </IonHeader>

                    <IonSearchbar mode="ios" value={searchText} placeholder={"SERO"} onIonChange={e => this.onSearch(e.detail.value!)}/>
                    {this.renderAssets()}

                    <IonModal isOpen={showModal}>
                        <IonList>
                            {billsInfo}
                        </IonList>
                        <IonButton onClick={() => this.setShowModal(false)}>Close</IonButton>
                    </IonModal>

                    <IonAlert
                        isOpen={showAlert}
                        onDidDismiss={() => this.setShowAlert(false)}
                        cssClass='my-custom-class'
                        header={'Withdraw!'}
                        inputs={[
                            {
                                name: 'amount',
                                type: 'number',
                                placeholder: '0.0000',
                                value: info?.amount.toString(10),
                            }
                        ]}
                        buttons={[
                            {
                                text: 'Cancel',
                                role: 'cancel',
                                cssClass: 'secondary',
                                handler: () => {
                                    console.log('Confirm Cancel');
                                }
                            },
                            {
                                text: 'Ok',
                                handler: (o:any) => {
                                   this.withdrawConfirm(o)
                                }
                            }
                        ]}
                    />
                </IonContent>

                <IonLoading mode="ios"
                    cssClass='my-custom-class'
                    isOpen={showLoading}
                    message={'Please wait...'}
                />
            </IonPage>
        )
    }
}



export default Assets;
