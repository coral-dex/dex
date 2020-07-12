import React from 'react';

import {
    IonContent,
    IonButtons,
    IonButton,
    IonHeader,
    IonPopover,
    IonToggle,
    IonTitle,
    IonToolbar,
    IonMenuButton,
    IonMenu,
    IonIcon,
    IonRange,
    IonInput,
    IonSegmentButton,
    IonSegment,
    IonPage,
    IonCol,
    IonRow,
    IonGrid,
    IonText,
    IonList,
    IonItem,
    IonLabel,
    IonLoading,
    IonActionSheet,
    IonToast
} from '@ionic/react';
import './quotes.css'
import OrdersContainer from "../components/OrdersContainer";
import PriceContainer from "../components/PriceContainer";
import {person,chevronDown, ellipsisVerticalOutline,trashOutline,close} from 'ionicons/icons'
import service from "../service/service";
import utils from "../common/utils";
import {storage} from "../common/storage";
import {Bill, BlanceOfCoin, Order, PairInfo, PairVolumeInfo} from "../types/types";
import coral, {AllOrder} from "../contract/coral";
import BigNumber from "bignumber.js";
import MarketContainer from "../components/MarketContainer";
import BillsContainer from "../components/BillsContainer";
import i18n from "../i18n";

interface State {
    rangeValue:0
    accounts:any
    selectAccount:any
    searchText:string
    info?:PairVolumeInfo
    detail?:PairInfo
    payCoins: Array<any>
    orders: Array<Order>
    opType:string
    useCoralBalance:boolean
    amount:any
    price:any
    total:any
    datas:Array<PairVolumeInfo>
    list: Array<PairVolumeInfo>
    selectCoin: string
    balanceCoral:Array<BlanceOfCoin>
    disabled:boolean
    showPopover:boolean
    showLoading:boolean
    orderType:string
    orderCount:number
    pageNo:number
    pageSize:number
    loadMore:boolean
    showActionSheet:boolean
    bills:Array<Bill>
    vol24:Array<BigNumber>
    ulDisplay:string
    showToast:boolean
    toastMsg:string
}

let latestPath = '';
function scrollBottom() {
    let id:any = null;
    id = setInterval(function () {
        const div = document.getElementById("sellScroll");
        if(div) {
            setTimeout(function () {
                div.scrollTop = div.scrollHeight;
            },1000)
            clearInterval(id)
        }
    },100)
}

class Exchange extends React.Component<State, any>{

    state:State = {
        rangeValue:0,
        accounts:[],
        selectAccount:{},
        searchText:'',
        payCoins:[],
        opType:'buy',
        amount:"",
        price:"",
        total:"0.0000",
        orders:[],
        datas:[],
        list:[],
        selectCoin: storage.get(storage.keys.coins),
        balanceCoral:[],
        disabled:false,
        showPopover:false,
        showLoading:false,
        orderType:"current",
        orderCount:0,
        pageNo:1,
        pageSize:10,
        loadMore:false,
        useCoralBalance:false,
        showActionSheet:false,
        bills:[],
        vol24:[],
        ulDisplay:"none",
        showToast:false,
        toastMsg:''
    }

    componentDidMount(): void {
        this.setShowLoading(true);
        this.init();
    }

    componentWillReceiveProps(nextProps: Readonly<State>, nextContext: any): void {
        //@ts-ignore
        if(nextProps.history.action === "POP" && latestPath !== nextProps.location.pathname){
            // @ts-ignore
            latestPath = nextProps.location.pathname
            this.setPairVolumeInfo().catch();
        }
    }

    init(){
        const that = this;
        that.getAccounts().then(rest=>{
            that.setPairVolumeInfo().then(()=>{
                scrollBottom();
            }).catch();

        }).catch();
        that.getDatas().catch();
        that.timeOrders();

        let intervalId:any = sessionStorage.getItem("intervalId");
        if(intervalId){
            clearInterval(intervalId);
        }
        intervalId = setInterval(function () {
            that.setPairVolumeInfo().catch();
        },5*1000);
        sessionStorage.setItem("intervalId",intervalId);

    }

    setShowLoading(f:boolean){
        this.setState({
            showLoading:f
        })
    }

    async setPairVolumeInfo(infoParam?:PairVolumeInfo){
        const that = this;
        const {selectAccount, info} = that.state;
        const payCoins = await coral.getPayCoins();
        // @ts-ignore
        // let payCoin:any = this.props.match.params.payCoin
        // @ts-ignore
        // let exchangeCoin:any = this.props.match.params.exchangeCoin
        infoParam = storage.get(storage.keys.pairs)
        if(info && infoParam){
            if(info.payCoin != infoParam.payCoin){
                that.setState({
                    amount:'',
                    price:''
                })
            }
        }
        that.setState({
            info:infoParam,
        })
        if(infoParam){
            const vol24:Array<BigNumber> = await coral.pairVolumeOf24H(selectAccount.MainPKr,infoParam.exchangeCoin,infoParam.payCoin);
            const detail:PairInfo = await coral.pairInfo(infoParam.exchangeCoin,infoParam.payCoin);
            const balanceEx = await coral.balanceOf(selectAccount.MainPKr,infoParam.exchangeCoin)
            const balanceCoin = await coral.balanceOf(selectAccount.MainPKr,infoParam.payCoin)
            that.timeOrders();
            that.setState({
                vol24:vol24,
                detail:detail,
                payCoins:payCoins,
                showLoading:false,
                balanceCoral:balanceEx.concat(balanceCoin)
            })
        }
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
            selectAccount:current,

        })
    }

    async setAccount (pk:any){
        const that = this;
        const rest:any = await service.getAccount(pk);
        storage.set(storage.keys.account.current,pk)
        that.setState({
            selectAccount:rest,
            showPopover:false,
            showLoading:true
        })
        that.setPairVolumeInfo().catch();
    }

    goExchange = (data: any)=> {
        const that = this;
        that.closeMenu()
        storage.set(storage.keys.pairs, data)
        that.init();
    }

    openMenu(){
        const menus = document.querySelector("ion-menu");
        if(menus){
            menus.open(true)
        }
    }

    closeMenu(){
        const menus = document.querySelector("ion-menu");
        if(menus){
            menus.close(true)
        }
    }

    setSearchText = (v: string) => {
        const {datas} = this.state;
        const list:Array<PairVolumeInfo> = [];
        for(let d of datas){
            if(d.exchangeCoin.indexOf(v.toUpperCase())>-1){
                list.push(d)
            }
        }
        this.setState({
            searchText: v,
            list:list
        })
    }

    setOpType =(v:any)=>{
        const that = this;
        const {price,amount} = this.state;
        this.setState({
            opType:v,
            total: that.calTotal(v,price,amount).toFixed(utils.amountFixed(),1),
        })
    }

    getBalance=()=> {
        const {selectAccount, info, opType,useCoralBalance} = this.state;
        if (info) {
            let balance = selectAccount.Balance;
            let cy = info?.payCoin
            if (opType === "sell") {
                cy = info?.exchangeCoin
            }
            if(useCoralBalance){
                return this.getBalanceCoral(cy)
            }else{
                const decimal = service.getDecimalCache(cy);
                if (balance && balance.has(cy)) {
                    return utils.fromValue(balance.get(cy), decimal).toFixed(utils.balanceFixed())
                }
            }

        }
        return "0.0000"
    }

    getBalanceCoral(coin:string){
        const {balanceCoral} = this.state;
        for(let d of balanceCoral){
            if(coin === d.coin){
                return d.amount.toFixed(utils.balanceFixed(),1)
            }
        }
        return "0.0000"
    }

    setPrice(v:any){
        const that = this;
        const v4 = /^([1-9]\d{0,15}|0)(\.\d{1,4})?$/;
        if(!v4.test(v)){
            return
        }
        const {opType} = this.state;
        let value = v;
        if(!value){
            value="0"
        }else{
            // v = parseFloat(value);
        }
        const {amount} = this.state;

        this.setState({
            price:v,
            total: that.calTotal(opType,value,amount).toFixed(utils.amountFixed(),1),

        })
    }

    setAmount(v:any){
        const that = this;
        const v4 = /^([1-9]\d{0,15}|0)(\.\d{1,4})?$/;
        if(!v4.test(v)){
            return
        }
        const {opType} = this.state;
        let value = v;
        if(!value){
            value="0"
        }else{
            // v = parseFloat(value);
        }
        const {price} = this.state;
        this.setState({
            amount:v,
            total:that.calTotal(opType,price,value).toFixed(utils.amountFixed(),1),
        })
    }


    setRange(v:any){
        const balance = this.getBalance()
        const {price,opType} = this.state;
        const amount = new BigNumber(v).multipliedBy(balance).div(100);
        this.setState({
            rangeValue:v,
            amount: "buy" === opType ? amount.dividedBy(price).toFixed(utils.amountFixed(),1):amount.toFixed(utils.amountFixed(),1),
            total: amount.toFixed(utils.balanceFixed(),1)
        })
    }

    sellConfirm(){
        const {price,amount,total,info,selectAccount,opType,useCoralBalance,detail} = this.state;
        if(!price || !amount || parseFloat(price)===0 || parseFloat(amount) ===0 ){
            return;
        }
        if(info && detail){
            const balance = this.getBalance();
            if(opType === "sell" && utils.compare(amount,balance)>0){
                this.setShowToast(true,i18n.t("lessBalance"));
                return
            }else if(opType === "buy" && utils.compare(total,balance)>0){
                this.setShowToast(true,i18n.t("lessBalance"));
                return
            }

            if(new BigNumber(amount).comparedTo(detail?.minExchangeCoinValue)<0){
                this.setShowToast(true,i18n.t("minTradeAmount")+detail?.minExchangeCoinValue + info.exchangeCoin);
                return
            }

            const priceValue = utils.toValue(price,service.getDecimalCache(info.payCoin));
            const amountValue = utils.toValue(amount,service.getDecimalCache(info.exchangeCoin));
            if(useCoralBalance){
                coral.sell(selectAccount.PK,selectAccount.MainPKr,info.exchangeCoin,info.payCoin,priceValue,amountValue).then(rest=>{
                    this.setAmount(0)
                }).catch()
            }else{
                coral.sellFromWallet(selectAccount.PK,selectAccount.MainPKr,info.payCoin,priceValue,info.exchangeCoin,amountValue).then(rest=>{
                    this.setAmount(0)
                }).catch(e=>{
                    const err = typeof e == 'string'?e:e.message;
                    this.setShowToast(true,err)
                })
            }
        }
    }

    buyConfirm(){
        const {price,amount,total,info,selectAccount,useCoralBalance,opType,detail} = this.state;
        if(!price || !amount || parseFloat(price)===0 || parseFloat(amount) ===0 ){
            return;
        }
        if(info && detail){
            const balance = this.getBalance();
            if(utils.compare(total,balance)>0){
                this.setShowToast(true,i18n.t("lessBalance"));
                return
            }
            const priceValue = utils.toValue(price,service.getDecimalCache(info.payCoin));
            const amountValue = utils.toValue(amount,service.getDecimalCache(info.exchangeCoin));
            const totalValue =  utils.toValue(this.calTotal(opType,price,amount),service.getDecimalCache(info.payCoin));

            console.log(priceValue.toString(10));
            console.log(amountValue.toString(10));
            console.log(totalValue.toString(10));


            if(new BigNumber(amount).comparedTo(detail?.minExchangeCoinValue)<0){
                this.setShowToast(true,i18n.t("minTradeAmount")+detail?.minExchangeCoinValue + info.exchangeCoin);
                return
            }

            if(useCoralBalance){
                coral.buy(selectAccount.PK,selectAccount.MainPKr,info.exchangeCoin,info.payCoin,priceValue,amountValue).then(rest=>{
                    this.setAmount(0)
                }).catch()
            }else{
                coral.buyFromWallet(selectAccount.PK,selectAccount.MainPKr,info.exchangeCoin,priceValue,amountValue,totalValue,info.payCoin).then(rest=>{
                    this.setAmount(0)
                }).catch(e=>{
                    const err = typeof e == 'string'?e:e.message;
                    this.setShowToast(true,err)
                })
            }
        }
    }

    calTotal(opType:string,price:any,amount:any):BigNumber{
        return new BigNumber(price?price:"0").multipliedBy(new BigNumber(amount?amount:"0"));
    }

    cancel = (id:any)=>{
        const {info,selectAccount} = this.state;
        if(info){
            coral.cancel(selectAccount.PK,selectAccount.MainPKr,info.exchangeCoin,info.payCoin,[id]).then()
        }
    }

    cancelAll(){
        const {info,selectAccount,orders} = this.state;
        const ids:Array<number> = [];
        for(let d of orders){
            if(d.status === "0"){
                ids.push(d.id)
            }
        }
        if(info){
            coral.cancel(selectAccount.PK,selectAccount.MainPKr,info.exchangeCoin,info.payCoin,ids).then()
        }
    }

    async getDatas(payCoin?:string) {
        this.setShowLoading(true);
        const payCoins: any = await coral.getPayCoins();
        let datas: Array<PairVolumeInfo> = [];
        let selectCoin: any = '';
        if(payCoin){
            selectCoin = payCoin;
        }else {
            const cache = storage.get(storage.keys.coins);
            if(cache){
                selectCoin = cache
            }
        }
        if (payCoins && payCoins.length > 0) {
            if(!selectCoin){
                selectCoin = payCoins[0];
                storage.set(storage.keys.coins,selectCoin);
            }

            datas = await coral.tokenList(selectCoin);
            const info:PairVolumeInfo = storage.get(storage.keys.pairs)
            if(!info && datas){
                storage.set(storage.keys.pairs,datas[0])
            }
        }
        this.setState({
            datas: datas,
            list:datas,
            payCoins: payCoins,
            showLoading:false
        })
    }

    setPayCoin=(v: any)=>{
        const that = this;
        that.setState({
            selectCoin: v
        })

        that.getDatas(v).catch()
        storage.set(storage.keys.coins,v)
    }

    setShowPopover(f:boolean){
        this.setState({
            showPopover:f
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

    timeOrders(){
        const that = this;
        const {selectAccount,info,orderType} = this.state;
        if(info && orderType === "current"){
            coral.orders(selectAccount.MainPKr,info.exchangeCoin,info.payCoin).then((rest:any)=>{
                that.setState({
                    orders:rest,
                    orderCount:0,
                    pageNo:1,
                    loadMore:false
                })
            });
        }
    }

    setOrderType(v?:any){
        const that = this;
        const {selectAccount,info,pageSize,pageNo,orderType,orders} = this.state;
        if(v){
            this.setState({
                orderType:v,
            })
        }else{
            v = orderType
        }

        if(info){
            if(v === "current"){
                coral.orders(selectAccount.MainPKr,info.exchangeCoin,info.payCoin).then((rest:any)=>{
                    that.setState({
                        orders:rest,
                        orderCount:0,
                        pageNo:1,
                        loadMore:false
                    })
                });
            }else if(v === "myBill"){
                coral.getExBills(selectAccount.MainPKr,info.exchangeCoin).then((rest:any)=>{
                    that.setState({
                        bills:rest ,
                        loadMore:false
                    })
                });
            }else{
                coral.allOrders(selectAccount.MainPKr,info.exchangeCoin,info.payCoin,pageSize*(pageNo-1),pageSize).then((rest:AllOrder)=>{
                    that.setState({
                        orders:pageNo===1?rest.orders:orders.concat(rest.orders),
                        orderCount:rest.count,
                        loadMore:rest.orders.length >= pageSize
                    })
                });
            }
        }

    }

    orderPage(pageNo:number){
        const that = this;
        const {pageSize,selectAccount,info,orders} = this.state;
        if(info){
            coral.allOrders(selectAccount.MainPKr,info.exchangeCoin,info.payCoin,pageSize*(pageNo-1),pageSize).then((rest:AllOrder)=>{
                that.setState({
                    orders:pageNo===1?rest.orders:orders.concat(rest.orders),
                    orderCount:rest.count,
                    pageNo:pageNo,
                    loadMore:rest.orders.length >= pageSize
                })
            });
        }
    }

    setUserCoralBalance(){
        const {useCoralBalance} = this.state;
        this.setState({
            useCoralBalance:!useCoralBalance
        })
    }

    setShowActionSheet(f:boolean){
        this.setState({
            showActionSheet:f
        })
    }

    showBill =(info:BlanceOfCoin)=>{
        const that = this;
        const {selectAccount} = this.state;
        coral.getExBills(selectAccount.MainPKr,info.coin).then((rest:any)=>{
            that.setState({
                bills: rest,
            })
        }).catch(e=>{
            console.log(e)
        })
    }

    setAmountAndPrice=(price:any,amount?:any)=>{
        const that = this;
        if(!price){
            return;
        }else{
            that.setPrice(price)
        }
        if(amount){
            that.setAmount(amount)
        }
    }

    showSelect = ()=>{
        const that = this;
        const {ulDisplay} = this.state;
        that.setState({
            ulDisplay: ulDisplay === "block"?"none":"block"
        })
    }

    setFixed(v:any){
        storage.set(storage.keys.fixed.price,v)
        this.setState({
            ulDisplay:"none"
        })
    }

    setShowToast(f:boolean,msg:string){
        this.setState({
            showToast:f,
            toastMsg:msg
        })
    }

    closeToast(){
        this.setState({
            showToast:false,
            toastMsg:''
        })
    }

    render(): React.ReactNode {
        const {info,accounts,selectAccount,detail,opType,
            price,amount,rangeValue,total,orders,searchText,
            selectCoin,list,payCoins,showLoading,showPopover,vol24,ulDisplay,
            orderType,pageNo,loadMore,useCoralBalance,showActionSheet,bills,showToast,toastMsg} = this.state;

        const options = this.renderAccountsOp(accounts)
        // const data = this.renderData();

        let exchangeUnit = info?.payCoin
        // let volUnit = info?.exchangeCoin;
        let btn = <IonButton mode="ios" expand={"full"} size={"small"} style={{width: '100%'}} color={"success"} onClick={()=>{this.buyConfirm()}}>{i18n.t("buy")}</IonButton>
        if(opType === 'sell'){
            exchangeUnit = info?.exchangeCoin;
            // volUnit = info?.payCoin
            btn = <IonButton mode="ios" expand={"full"} size={"small"} style={{width: '100%'}} color={"danger"} onClick={()=>{this.sellConfirm()}}>{i18n.t("sell")}</IonButton>
        }

        let fixed = storage.get(storage.keys.fixed.price);
        if(fixed){
            fixed = new BigNumber(1).div(new BigNumber(10).pow(new BigNumber(fixed))).toString(10);
        }
        return (
            <IonPage>
                <IonContent>
                    <IonHeader mode="ios">
                        <IonToolbar mode="ios">
                            <IonButtons slot="start">
                                <IonMenuButton autoHide={false} menu={"first"} onClick={()=>{this.openMenu()}}/>
                            </IonButtons>
                            <IonTitle>{info?.exchangeCoin}/{info?.payCoin}</IonTitle>
                            <IonButtons slot="end">
                                <IonButtons slot="end" onClick={()=>{this.setShowPopover(true)}}>
                                    <IonPopover  mode="ios"
                                        isOpen={showPopover}
                                        cssClass='my-custom-class'
                                        onDidDismiss={()=>this.setShowPopover(false)}
                                    >
                                        <IonList>
                                            {options}
                                        </IonList>

                                    </IonPopover>
                                    <IonIcon icon={person} />{selectAccount.Name}
                                </IonButtons>
                            </IonButtons>

                        </IonToolbar>
                    </IonHeader>

                    <IonMenu side="start" menuId="first">
                       <IonContent>

                           <MarketContainer list={list} onSearch={this.setSearchText} searchText={searchText} selectCoin={selectCoin} setPayCoin={this.setPayCoin} coins={payCoins} goExchange={this.goExchange}/>
                       </IonContent>
                    </IonMenu>

                    <IonGrid >
                        <IonRow>
                            <IonCol size={"6"}>
                                <div>
                                    <IonItem lines="none" mode="ios">
                                        <IonSegment mode="ios" value={opType} onIonChange={e => this.setOpType(e.detail.value)}>
                                            <IonSegmentButton mode="ios" value="buy">
                                                <IonLabel mode="ios" color={"success"}>{i18n.t("buy")}</IonLabel>
                                            </IonSegmentButton>
                                            <IonSegmentButton mode="ios" value="sell">
                                                <IonLabel mode="ios" color={"danger"}>{i18n.t("sell")}</IonLabel>
                                            </IonSegmentButton>
                                        </IonSegment>
                                    </IonItem>
                                </div>

                                <div style={{padding: "0 0 0 15px"}}>
                                    <div className={"text-item"}>{i18n.t("price")}({info?.payCoin})</div>
                                    <IonInput mode="ios" placeholder={"0.0000"} color={"dark"} inputmode={"decimal"} min={"0"} value={price} type="number"  onIonChange={e => this.setPrice(e.detail.value!)}/>
                                    <div className={"text-item"}>{i18n.t("amount")}({info?.exchangeCoin})</div>
                                    <IonInput mode="ios" placeholder={"0.0000"} color={"dark"} inputmode={"decimal"} min={detail?.minExchangeCoinValue.toFixed(utils.amountFixed())} value={amount} type="number" onIonChange={e => this.setAmount(e.detail.value !)}/>
                                    <div style={{position: "absolute", right: 0}} className={"text-item"}>{this.getBalance()} {exchangeUnit}</div>
                                    <div className={"text-item"}>{i18n.t("available")}</div>
                                    <IonRow>
                                        <IonCol size="4"><IonToggle mode="ios" checked={useCoralBalance} onIonChange={()=>{this.setUserCoralBalance()}}/></IonCol>
                                        <IonCol size="8"><IonText className={"text-item-dark"}>{i18n.t("useExchangeBalance")}</IonText></IonCol>
                                    </IonRow>
                                </div>
                                <div>
                                    <IonRange mode="ios" dualKnobs={false} min={0} max={100} step={25} value={rangeValue} snaps={true} onIonChange={e => this.setRange(e.detail.value as any)}/>
                                    <div className={"text-item-dark-large"}>{total} {info?.payCoin}</div>
                                    {btn}
                                </div>
                            </IonCol>
                            <IonCol size={"6"}>
                                <PriceContainer detail={detail} vol24={vol24} exchangeCoin={info?.exchangeCoin as string} payCoin={info?.payCoin as string} setAmountAndPrice={this.setAmountAndPrice}/>
                                <div style={{marginTop:"5px"}}>
                                    <IonRow className="fixed-select" onClick={this.showSelect}>
                                        <IonCol size={"10"} >{i18n.t("depth")} {fixed}</IonCol>
                                        <IonCol size={"2"} style={{float:"right"}}><IonIcon icon={chevronDown}/></IonCol>
                                    </IonRow>
                                    <ul className="fixed" style={{display:ulDisplay}}>
                                        <li onClick={()=>{this.setFixed(4)}}>0.0001</li>
                                        <li onClick={()=>{this.setFixed(3)}}>0.001</li>
                                        <li onClick={()=>{this.setFixed(2)}}>0.01</li>
                                        <li onClick={()=>{this.setFixed(1)}}>0.1</li>
                                    </ul>
                                </div>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                    <div className={"divider"}/>
                    <IonRow>
                        <IonCol size="10">
                            <IonSegment value={orderType} onIonChange={e => this.setOrderType(e.detail.value)}>
                                <IonSegmentButton mode="md" value="current">
                                    <IonLabel mode="md">{i18n.t("currentOrders")}</IonLabel>
                                </IonSegmentButton>
                                <IonSegmentButton mode="md" value="all">
                                    <IonLabel mode="md">{i18n.t("allOrders")}</IonLabel>
                                </IonSegmentButton>
                                {/*<IonSegmentButton mode="md" value="myBill">*/}
                                {/*    <IonLabel mode="md">{i18n.t("myBills")}</IonLabel>*/}
                                {/*</IonSegmentButton>*/}
                            </IonSegment>
                        </IonCol>
                        <IonCol size="2" className="order-ellipse" onClick={()=>{
                            this.setShowActionSheet(true)
                        }}>
                            <IonIcon mode="ios" icon={ellipsisVerticalOutline}/>
                        </IonCol>
                    </IonRow>

                    {orderType === "myBill"?<BillsContainer bills={bills} info={{coin:info?info.exchangeCoin:"",amount:new BigNumber(0),lockedAmount:new BigNumber(0)}} pageNo={pageNo} showMore={false} showBill={this.showBill}/>:<OrdersContainer list={orders} payCoin={info?.payCoin} exchangeCoin={info?.exchangeCoin} cancel={this.cancel}/>}
                    {
                        loadMore && <IonButton onClick={()=>{this.orderPage(pageNo+1)}} mode="ios" size="small" expand="block" fill="outline" >{i18n.t("Load More")}</IonButton>
                    }
                </IonContent>
                <IonLoading  mode="ios"
                    cssClass='my-custom-class'
                    isOpen={showLoading}
                    message={'Please wait...'}
                />
                <IonActionSheet
                    mode="ios"
                    isOpen={showActionSheet}
                    onDidDismiss={() => this.setShowActionSheet(false)}
                    cssClass='my-custom-class'
                    buttons={[{
                        text: i18n.t("cancelAllOrder"),
                        role: 'destructive',
                        icon: trashOutline,
                        handler: () => {
                            this.cancelAll();
                        }
                    }, {
                        text: i18n.t("cancel"),
                        role: 'cancel',
                        handler: () => {
                            console.log('Cancel clicked');
                        }
                    }]}
                >
                </IonActionSheet>

                <IonToast
                    position="top"
                    isOpen={showToast}
                    onDidDismiss={() => this.closeToast()}
                    message={toastMsg}
                    duration={1500}
                />

            </IonPage>
        );
    }
}


export default Exchange;
