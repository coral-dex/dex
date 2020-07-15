import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonBadge,
  IonTabs
} from '@ionic/react';
import { IonReactRouter,IonReactHashRouter,IonReactMemoryRouter } from '@ionic/react-router';
import { statsChartOutline, swapHorizontalOutline, walletOutline ,timerOutline,alertOutline} from 'ionicons/icons';
import Quotes from './pages/Quotes';
import Exchange from './pages/Exchange';
import Assets from './pages/Assets';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import service from "./service/service";
import i18n from "./i18n";
import Kline from './pages/Kline'
import History from './pages/History'
import config from "./contract/config";

class App extends React.Component<any, any>{

  componentDidMount(): void {
    service.initApp().catch()
  }

  render(): React.ReactNode {
    console.log("render");



    return <IonApp>
      <IonReactHashRouter>
        <IonTabs>
          <IonRouterOutlet animated={true}>
            {/*<Switch>*/}
              <Route path="/quotes" component={Quotes} exact={true} />
              <Route path="/exchange/:payCoin/:exchangeCoin" component={Exchange} exact={true} />
              <Route path="/exchange" component={Exchange} exact={true} />
              <Route path="/assets" component={Assets}  exact={true} />
              <Route path="/kline" component={Kline} />
              <Route path="/history" component={History}  exact={true} />
              <Route path="/" render={() => <Redirect to="/quotes" />} exact={true} />
            {/*</Switch>*/}
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="quotes" href="/quotes">
              <IonIcon icon={statsChartOutline} />
              <IonLabel>{i18n.t("market")}</IonLabel>
            </IonTabButton>
            <IonTabButton tab="exchange" href="/exchange">
              <IonIcon icon={swapHorizontalOutline} />
              <IonLabel>{i18n.t("exchange")}</IonLabel>
            </IonTabButton>
            <IonTabButton tab="assets" href="/assets">
              <IonIcon icon={walletOutline} />
              <IonLabel>{i18n.t("assets")}</IonLabel>
            </IonTabButton>

              <IonTabButton tab="history" href="/history">
                {
                  config.isLatest()?"":<IonBadge color="danger">
                    <IonIcon icon={alertOutline} />
                  </IonBadge>
                }
                <IonIcon icon={timerOutline} />
                <IonLabel>{i18n.t("historyVersion")}</IonLabel>
              </IonTabButton>

          </IonTabBar>
        </IonTabs>
      </IonReactHashRouter>
    </IonApp>
  }
}

export default App;
