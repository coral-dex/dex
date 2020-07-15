import * as React from 'react';
import {
    IonButton,
    IonCol, IonItem, IonLabel,
    IonRow,
    IonText
} from "@ionic/react";
import {Order, PairInfo} from "../types/types";
import BigNumber from "bignumber.js";
import utils from "../common/utils";
import mapSort from "mapsort";
import i18n from "../i18n";
import { createChart } from 'lightweight-charts';

interface ContainerProps {

}

const KlineContainer: React.FC<ContainerProps> = () => {

    const chart = createChart(document.body, { width: 400, height: 300 });
    const lineSeries = chart.addLineSeries();
    lineSeries.setData([
        { time: '2019-04-11', value: 80.01 },
        { time: '2019-04-12', value: 96.63 },
        { time: '2019-04-13', value: 76.64 },
        { time: '2019-04-14', value: 81.89 },
        { time: '2019-04-15', value: 74.43 },
        { time: '2019-04-16', value: 80.01 },
        { time: '2019-04-17', value: 96.63 },
        { time: '2019-04-18', value: 76.64 },
        { time: '2019-04-19', value: 81.89 },
        { time: '2019-04-20', value: 74.43 },
    ]);
    return (
        <div id="kline">

        </div>
    );
};

export default KlineContainer;
