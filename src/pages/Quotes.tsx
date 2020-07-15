import React from 'react';
import {
    IonContent,
    IonPage,
    IonLoading,
    IonItem,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
} from '@ionic/react';
import './quotes.css'
import coral from "../contract/coral";
import {storage} from "../common/storage";
import {PairVolumeInfo} from "../types/types";
import MarketContainer from "../components/MarketContainer";
import utils from "../common/utils";

interface State {
    searchText: string
    datas: Array<PairVolumeInfo>
    list: Array<PairVolumeInfo>
    payCoins: Array<any>
    selectCoin: string
    showLoading:boolean
}


class Quotes extends React.Component<State, any> {

    state: State = {
        searchText: '',
        datas: [],
        list: [],
        payCoins: [],
        selectCoin:  storage.get(storage.keys.coins),
        showLoading:false
    }

    componentWillReceiveProps(nextProps: Readonly<State>, nextContext: any): void {
        this.getDatas().catch()
    }

    componentDidMount(): void {
        const that = this;

        let intervalId:any = sessionStorage.getItem("intervalId2");
        if(intervalId){
            clearInterval(intervalId);
        }
        intervalId = setInterval(function () {
            that.getDatas().catch()
        },5*1000);
        sessionStorage.setItem("intervalId1",intervalId);
        this.setShowLoading(true);
        that.getDatas().catch()
    }

    setSearchText=(v: string)=>{
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

    setShowLoading(f:boolean){
        this.setState({
            showLoading:f
        })
    }

    async getDatas(payCoin?:string) {

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

    goExchange(data: any){
        storage.set(storage.keys.pairs, data)
        setTimeout(function () {
            utils.goPage("/exchange/"+data.payCoin +"/"+data.exchangeCoin)
            // window.location.href = "/exchange/"+data.payCoin +"/"+data.exchangeCoin;
            // createHashHistory().push("/exchange/"+data.payCoin +"/"+data.exchangeCoin)
        },100)
    }

    setPayCoin=(v: any)=>{
        const that = this;
        that.setState({
            selectCoin: v
        })

        that.getDatas(v).catch()
        storage.set(storage.keys.coins,v)
    }

    render(): React.ReactNode {
        const {searchText, selectCoin,payCoins,list,showLoading} = this.state;
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
                    symbol = "-";
                }
            }

            h.push(
                <IonItem mode="ios" onClick={() => this.goExchange(data)}>
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
            <IonPage>
                <IonContent scrollY={true}>
                    <MarketContainer list={list} onSearch={this.setSearchText} searchText={searchText} selectCoin={selectCoin} setPayCoin={this.setPayCoin} coins={payCoins} goExchange={this.goExchange}/>
                </IonContent>
                <IonLoading  mode="ios"
                    cssClass='my-custom-class'
                    isOpen={showLoading}
                    message={'Please wait...'}
                />
            </IonPage>
        );
    }

};


export default Quotes;
