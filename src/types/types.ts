import BigNumber from "bignumber.js";

export interface PairVolumeInfo {
    exchangeCoin: string;
    payCoin: string;
    decimals: string;
    startPrice: BigNumber;
    lastPrice: BigNumber;
    volume: BigNumber;
    offline: boolean
}

export interface Deal {
    val: BigNumber;
    price: BigNumber;
    timestamp: string;
    opType: number; //0 : sell ,1 : buy
}

export interface Minute {
    time: string;
    len: string;
    deals: Array<Deal>;
}

export interface Order {
    id: number;
    owner: string;
    receiverAddr: string;
    opData:string;
    price: BigNumber;
    value: BigNumber;
    dealValue: BigNumber;
    createTime: string;
    status: string;
    orderType: boolean; //true : sell ,false : buy.
}

export interface PairInfo {
    buyOrders: Array<Order>;
    sellOrders: Array<Order>;
}

export interface Bill {
    value: BigNumber;
    timestamp: string;
    type: string; //0: recharge, 1: withdraw, 2: buy, 3: sell
}

export interface BlanceOfCoin {
    amount: BigNumber;
    lockedAmount: BigNumber;
    coin:string
}