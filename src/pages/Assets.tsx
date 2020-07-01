import React from 'react';
import {
    IonContent,
    IonPage,
    IonButton,
    IonModal,
    IonSearchbar,
    IonList,
    IonItem,
    IonAlert,
    IonIcon,
    IonToolbar,
    IonButtons,
    IonPopover,
    IonTitle, IonHeader, IonLoading
} from '@ionic/react';
import './quotes.css'
import AssetsContainer from "../components/AssetsContainer";
import coral from "../contract/coral";
import service from "../service/service";
import {storage} from "../common/storage";
import {person} from 'ionicons/icons'
import {Bill, BlanceOfCoin} from "../types/types";
import utils from "../common/utils";
import BillsContainer from "../components/BillsContainer";
import i18n from '../i18n'

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
    pageNo:number
    pageSize:number
    showMore:boolean
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
        bills:[],
        pageNo:1,
        pageSize:10,
        showMore:false,
    }

    componentDidMount(): void {
        const that = this;

        let intervalId:any = sessionStorage.getItem("intervalId3");
        if(intervalId){
            clearInterval(intervalId);
        }
        intervalId = setInterval(function () {
            that.getAccounts().then(rest=>{
                that.getAssets();
            }).catch(e=>{

            })
        },5*1000);
        sessionStorage.setItem("intervalId3",intervalId);

        that.setState({
            showLoading:true
        })

        that.getAccounts().then(rest=>{
            that.getAssets();
        }).catch(e=>{

        })
    }

    getAssets(){
        const that = this;
        const {selectAccount} = this.state;
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
            list:list,
            searchText:v
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
            if(d.coin === "PFID"){
                continue
            }
            h.push(<AssetsContainer info={d} withdraw={this.withdraw} showBills={this.showBill}/>)
        }
        return h;
    }

    showBill =(info:BlanceOfCoin,pageNo?:number)=>{
        const that = this;
        const {selectAccount,pageSize,bills} = this.state;
        that.setState({
            showLoading:true,
            showModal:true
        })
        coral.getBills(selectAccount.MainPKr,info.coin,(pageNo?pageNo-1:1)*pageSize,pageSize).then((rest:any)=>{
            let showMore = false;
            if(rest && rest.length>=pageSize){
                showMore = true
            }
            that.setState({
                bills: pageNo===1?rest:bills.concat(rest),
                showLoading:false,
                pageNo:pageNo,
                info:info,
                showMore:showMore
            })
        }).catch(e=>{
            console.log(e)
        })
    }

    withdrawConfirm(o:any){
        const that = this;
        if(o && o["amount"]){
            if(parseFloat(o["amount"]) === 0){
                return;
            }
            const value:any = o["amount"];
            const {info,selectAccount} = this.state;
            if(info){
                const decimal = service.getDecimalCache(info.coin);
                const amount = utils.toValue(value,decimal);
                if(amount.comparedTo(info.amount.minus(info.lockedAmount)) === -1){
                    alert("not enough balance")
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

    render(): React.ReactNode {
        const {searchText,showModal,bills,selectAccount,accounts,showPopover,showLoading,showAlert,showMore,info,pageNo} = this.state;
        const options = this.renderAccountsOp(accounts)
        return (
            <IonPage>
                <IonContent>
                    <IonHeader mode="ios">
                        <IonToolbar mode="ios">
                            <IonTitle>
                                {i18n.t("assets")}
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
                        <BillsContainer bills={bills} showMore={showMore} info={info} pageNo={pageNo} showBill={this.showBill}/>
                        <IonButton onClick={() => this.setShowModal(false)}>{i18n.t("close")}</IonButton>
                    </IonModal>

                    <IonAlert
                        isOpen={showAlert}
                        onDidDismiss={() => this.setShowAlert(false)}
                        cssClass='my-custom-class'
                        header={i18n.t('withdraw')}
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
                                text: i18n.t('cancel'),
                                role: 'cancel',
                                cssClass: 'secondary',
                                handler: () => {
                                    console.log('Confirm Cancel');
                                }
                            },
                            {
                                text: i18n.t('ok'),
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
