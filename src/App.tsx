import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs
} from '@ionic/react';
import { IonReactRouter,IonReactHashRouter } from '@ionic/react-router';
import { podiumOutline,statsChartOutline, swapHorizontalOutline, walletOutline } from 'ionicons/icons';
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

class App extends React.Component<any, any>{

  componentDidMount(): void {
    service.initApp().catch()
  }

  render(): React.ReactNode {
    return <IonApp>
      <IonReactHashRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route path="/quotes" component={Quotes} exact={true} />
            <Route path="/exchange/:payCoin/:exchangeCoin" component={Exchange} exact={true} />
            <Route path="/exchange" component={Exchange} exact={true} />
            <Route path="/assets" component={Assets} />
            <Route path="/" render={() => <Redirect to="/quotes" />} exact={true} />
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="quotes" href="/quotes">
              <IonIcon icon={statsChartOutline} />
              <IonLabel>行情</IonLabel>
            </IonTabButton>
            <IonTabButton tab="exchange" href="/exchange">
              <IonIcon icon={swapHorizontalOutline} />
              <IonLabel>交易</IonLabel>
            </IonTabButton>
            <IonTabButton tab="assets" href="/assets">
              <IonIcon icon={walletOutline} />
              <IonLabel>资产</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactHashRouter>
    </IonApp>
  }
}

export default App;
