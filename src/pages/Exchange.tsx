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
    IonItemDivider,
    IonInput,
    IonSegmentButton,
    IonSegment,
    IonPage,
    IonCol,
    IonRow,
    IonGrid,
    IonSelect,
    IonSelectOption,
    IonText,
    IonList,
    IonItem,
    IonLabel,
    IonLoading
} from '@ionic/react';
import './quotes.css'
import OrdersContainer from "../components/OrdersContainer";
import PriceContainer from "../components/PriceContainer";
import {chevronDown, person} from 'ionicons/icons'
import service from "../service/service";
import utils from "../common/utils";
import {storage} from "../common/storage";
import {Order, PairInfo, PairVolumeInfo} from "../types/types";
import coral, {AllOrder} from "../contract/coral";
import BigNumber from "bignumber.js";
import MarketContainer from "../components/MarketContainer";



const customActionSheetOptions = {
    header: 'Accounts',
    subHeader: 'Select one account for coral exchange'
};

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
    amount:any
    price:any
    total:any
    datas:Array<PairVolumeInfo>
    list: Array<PairVolumeInfo>
    selectCoin: string
    balanceCoral:BigNumber
    disabled:boolean
    showPopover:boolean
    showLoading:boolean
    orderType:string
    orderCount:number
    pageNo:number
    pageSize:number
    loadMore:boolean
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
        balanceCoral:new BigNumber(0),
        disabled:false,
        showPopover:false,
        showLoading:false,
        orderType:"current",
        orderCount:0,
        pageNo:1,
        pageSize:10,
        loadMore:false
    }

    componentDidMount(): void {
        this.setShowLoading(true);
        this.init();
    }

    init(){
        const that = this;
        that.getAccounts().then(rest=>{
            that.setPairVolumeInfo().catch();
            // that.getBalanceCoral().catch();
        }).catch();

        that.getDatas().catch();

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

    async setPairVolumeInfo(info?:PairVolumeInfo){
        const that = this;
        const {selectAccount} = that.state;
        const payCoins = await coral.getPayCoins();
        // @ts-ignore
        // let payCoin:any = this.props.match.params.payCoin
        // @ts-ignore
        // let exchangeCoin:any = this.props.match.params.exchangeCoin
        info = storage.get(storage.keys.pairs)
        if(info){
            const detail:PairInfo = await coral.pairInfo(info.exchangeCoin,info.payCoin);
            that.setOrderType();
            that.setState({
                info:info,
                detail:detail,
                payCoins:payCoins,
                showLoading:false
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
            selectAccount:current
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
        const {price,amount} = this.state;
        this.setState({
            opType:v,
            total: "buy" === v ?new BigNumber(price?price:"0").multipliedBy(new BigNumber(amount?amount:"0")).toFixed(utils.balanceFixed(),1):price?new BigNumber(amount?amount:"0").multipliedBy(new BigNumber(price)).toFixed(utils.balanceFixed(),1):"0.0000"
        })
    }

    getBalance=()=> {
        const {selectAccount, info, opType} = this.state;
        if (info) {
            let balance = selectAccount.Balance;
            let cy = info?.payCoin
            if (opType === "sell") {
                cy = info?.exchangeCoin
            }
            const decimal = service.getDecimalCache(cy);
            if (balance && balance.has(cy)) {
                return utils.fromValue(balance.get(cy), decimal).toFixed(utils.balanceFixed())
            }
        }
        return "0.0000"
    }

    async getBalanceCoral(){
        const {selectAccount,info} = this.state;
        if(info){
            const decimal = await service.getDecimal(info.exchangeCoin);
            const rest:any = await coral.balanceOf(selectAccount.MainPKr,info.exchangeCoin)
            this.setState({
                balanceCoral:utils.fromValue(rest,decimal)
            })
        }
    }

    setPrice(v:any){
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
            total: "buy" === opType ?new BigNumber(value).multipliedBy(new BigNumber(amount?amount:"0")).toFixed(utils.priceFixed(),1):new BigNumber(amount?amount:"0").multipliedBy(new BigNumber(value)).toFixed(utils.priceFixed(),1)
        })
    }

    setAmount(v:any){
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
            total: "buy" === opType ?new BigNumber(price?price:"0").multipliedBy(new BigNumber(value)).toFixed(utils.priceFixed(),1):new BigNumber(value).multipliedBy(new BigNumber(price?price:"0")).toFixed(utils.priceFixed(),1)
        })
    }


    setRange = (v:any)=>{
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
        const {price,amount,total,info,selectAccount,opType} = this.state;
        if(!price || !amount){
            return;
        }
        if(info){
            const balance = this.getBalance();
            if(opType === "sell" && utils.compare(amount,balance)>0){
                alert("not enough balance");
                return
            }else if(opType === "buy" && utils.compare(total,balance)>0){
                alert("not enough balance");
                return
            }
            const priceValue = utils.toValue(price,service.getDecimalCache(info.payCoin));
            const amountValue = utils.toValue(amount,service.getDecimalCache(info.exchangeCoin));
            coral.sellFromWallet(selectAccount.PK,selectAccount.MainPKr,info.payCoin,priceValue,info.exchangeCoin,amountValue).then(rest=>{
                this.setAmount(0)
            }).catch()
        }
    }

    buyConfirm(){
        const {price,amount,total,info,selectAccount} = this.state;
        if(!price || !amount){
            return;
        }
        if(info){
            const balance = this.getBalance();
            if(utils.compare(total,balance)>0){
                alert("not enough balance");
                return
            }
            const priceValue = utils.toValue(price,service.getDecimalCache(info.payCoin));
            const amountValue = utils.toValue(amount,service.getDecimalCache(info.exchangeCoin));
            const totalValue = utils.toValue(total,service.getDecimalCache(info.exchangeCoin));

            coral.buyFromWallet(selectAccount.PK,selectAccount.MainPKr,info.exchangeCoin,priceValue,amountValue,totalValue,info.payCoin).then(rest=>{
                this.setAmount(0)
            }).catch()
        }
    }

    cancel = (id:any)=>{
        const {info,selectAccount} = this.state;
        if(info){
            coral.cancel(selectAccount.PK,selectAccount.MainPKr,info.exchangeCoin,info.payCoin,[id]).then()
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
        console.log("setPayCoin>>>")
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

    setOrderType(v?:any){
        const that = this;
        const {selectAccount,info,pageSize,pageNo,orderType} = this.state;
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
            }else{
                coral.allOrders(selectAccount.MainPKr,info.exchangeCoin,info.payCoin,pageSize*(pageNo-1),pageSize).then((rest:AllOrder)=>{
                    that.setState({
                        orders:rest.orders,
                        orderCount:rest.count,
                        pageNo:1,
                        loadMore:rest.orders.length >= pageSize
                    })
                });
            }
        }
    }

    orderPage(pageNo:number){
        const that = this;
        const {pageSize,selectAccount,info} = this.state;
        if(info){
            coral.allOrders(selectAccount.MainPKr,info.exchangeCoin,info.payCoin,pageSize*(pageNo-1),pageSize).then((rest:AllOrder)=>{
                that.setState({
                    orders:rest.orders,
                    orderCount:rest.count,
                    pageNo:pageNo,
                    loadMore:rest.orders.length >= pageSize
                })
            });
        }
    }

    render(): React.ReactNode {
        const {info,accounts,selectAccount,detail,opType,price,amount,rangeValue,total,orders,searchText, selectCoin,list,payCoins,showLoading,showPopover,orderType,pageNo,loadMore} = this.state;
        const options = this.renderAccountsOp(accounts)
        // const data = this.renderData();
        let latestPrice = "0.0000";
        if(info){
            latestPrice = new BigNumber(info.lastPrice).toFixed(utils.priceFixed())
        }
        let exchangeUnit = info?.payCoin
        // let volUnit = info?.exchangeCoin;
        let btn = <IonButton mode="ios" expand={"full"} size={"small"} style={{width: '100%'}} color={"success"} onClick={()=>{this.buyConfirm()}}>买入</IonButton>
        if(opType === 'sell'){
            exchangeUnit = info?.exchangeCoin;
            // volUnit = info?.payCoin
            btn = <IonButton mode="ios" expand={"full"} size={"small"} style={{width: '100%'}} color={"danger"} onClick={()=>{this.sellConfirm()}}>卖出</IonButton>
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
                                                <IonLabel mode="ios" color={"success"}>买入</IonLabel>
                                            </IonSegmentButton>
                                            <IonSegmentButton mode="ios" value="sell">
                                                <IonLabel mode="ios" color={"danger"}>卖出</IonLabel>
                                            </IonSegmentButton>
                                        </IonSegment>
                                    </IonItem>
                                </div>

                                <div style={{padding: "0 0 0 15px"}}>
                                    <div className={"text-item"}>单价({info?.payCoin})</div>
                                    <IonInput mode="ios" placeholder={"0.0000"} pattern={"/^(\\d+|\\d+\\.\\d{1,2})$/"} color={"dark"} inputmode={"decimal"} value={price} min="0" type="number"  onIonChange={e => this.setPrice(e.detail.value!)}/>
                                    <div className={"text-item"}>数量({info?.exchangeCoin})</div>
                                    <IonInput mode="ios" placeholder={"0.0000"} color={"dark"} inputmode={"decimal"} min="0" value={amount} type="number"  onIonChange={e => this.setAmount(e.detail.value !)}/>
                                    <div style={{position: "absolute", right: 0}} className={"text-item"}>{this.getBalance()} {exchangeUnit}</div>
                                    <div className={"text-item"}>可用</div>
                                    {/*<IonItem>*/}
                                    {/*    <IonLabel>From wallet</IonLabel>*/}
                                    {/*    <IonToggle value="wallet"  mode="ios"/>*/}
                                    {/*</IonItem>*/}
                                </div>
                                <div>
                                    <IonRange mode="ios" dualKnobs={false} min={0} max={100} step={25} value={rangeValue} snaps={true} onIonChange={e => this.setRange(e.detail.value as any)}/>
                                    <div className={"text-item-dark-large"}>{total} {info?.payCoin}</div>
                                    {btn}
                                </div>
                            </IonCol>
                            <IonCol size={"6"}>
                                <PriceContainer detail={detail} lastPrice={latestPrice} exchangeCoin={info?.exchangeCoin as string} payCoin={info?.payCoin as string}/>
                                {/*<IonPopover*/}
                                {/*    isOpen={showPopover}*/}
                                {/*    cssClass='my-custom-class'*/}
                                {/*    onDidDismiss={e => this.setShowPopover(false)}*/}
                                {/*>*/}
                                {/*    <div>0.000001</div>*/}
                                {/*    <div>0.00001</div>*/}
                                {/*    <div>0.0001</div>*/}
                                {/*    <div>0.001</div>*/}
                                {/*    <div>0.01</div>*/}
                                {/*    <div>0.1</div>*/}
                                {/*</IonPopover>*/}
                                {/*<div onClick={()=>{this.setShowPopover(true)}}*/}
                                {/*>0.0001<IonIcon icon={chevronDown}/></div>*/}
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                    <div className={"divider"}/>
                    <IonSegment mode="md" value={orderType} onIonChange={e => this.setOrderType(e.detail.value)}>
                        <IonSegmentButton mode="md" value="current">
                            <IonLabel mode="md">当前委托</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton mode="md" value="all">
                            <IonLabel mode="md">全部交易</IonLabel>
                        </IonSegmentButton>
                    </IonSegment>

                    <OrdersContainer list={orders} payCoin={info?.payCoin} exchangeCoin={info?.exchangeCoin} cancel={this.cancel}/>
                    {
                        loadMore && <IonButton onClick={()=>{this.orderPage(pageNo+1)}} expand="block" fill="outline" >加载更多</IonButton>
                    }
                </IonContent>
                <IonLoading  mode="ios"
                    cssClass='my-custom-class'
                    isOpen={showLoading}
                    message={'Please wait...'}
                />
            </IonPage>
        );
    }
}


export default Exchange;
