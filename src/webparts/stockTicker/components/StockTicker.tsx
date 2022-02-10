import * as React from 'react';
import styles from './StockTicker.module.scss';
import { IStockTickerProps } from './IStockTickerProps';
import { IStockTickerState } from './IStockTickerState';
import { escape } from '@microsoft/sp-lodash-subset';

// import strings from localized resources
import * as strings from 'StockTickerWebPartStrings';

// import supporting types
import { IStockTickerData, IStockData } from './IStockTickerData';
import { IAVResults, IAVResultsMetadata, IAVResultsSeries, MarketStackResults, MarketStackIntraday } from './AlphaVantageResults';

// import additional controls/components
import { Placeholder } from "@pnp/spfx-controls-react/lib/Placeholder";
import {
  Spinner,
  SpinnerSize
} from 'office-ui-fabric-react/lib/Spinner';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { HttpClientResponse, HttpClient } from '@microsoft/sp-http';
import * as lodash from '@microsoft/sp-lodash-subset';

export default class StockTicker extends React.Component<IStockTickerProps, IStockTickerState> {
  constructor(props: IStockTickerProps) {
    super(props);

    // set initial state for the component: not loading, no stock information
    this.state = {
      loading: false,
      stockInfo: null
    };
  }

  // on componentDidMount refresh data
  public componentDidMount(): void {
    if (!this.props.needsConfiguration) {
      this.loadStockInformation(this.props.stockSymbol, this.props.stockFullName, this.props.demo);
    }
  }

  // on componentWillReceiveProps refresh data
  public componentWillReceiveProps(nextProps: IStockTickerProps): void {
    if (nextProps.stockSymbol || nextProps.demo) {
      this.loadStockInformation(nextProps.stockSymbol, nextProps.stockFullName, nextProps.demo);
    }
  }

  private _GetStockData(): Promise<any> {
    //`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${escape(stockSymbol)}&apikey=${this.props.apiKey}`,
    const serviceDailyEndpoint: string =
          `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=$MSFT&apikey=${this.props.apiKey}`;

    return this.context.httpClient
    .get(serviceDailyEndpoint, HttpClient.configurations.v1)
    .then((response: HttpClientResponse) => {
      return response.json();
    })
    .then( jsonResponse => {
      return jsonResponse;
    }) as Promise<any>;
  }

  // method to load stock information from external REST API
  private loadStockInformation(stockSymbol: string, stockFullName: string, demo: boolean): void {
    if (demo || !demo) {
      this.setState({
        loading: false,
        stockInfo: {
          symbol: 'CMA',
          fullName: 'Comerica Incorporated',
          lastRefreshed: new Date(),
          lastData: {
            open: 101.08,
            high: 101.08,
            low: 101.08,
            close: 101.08,
            volume: 1330000
          },
          previousClose: 99.36
        }
      });
      return;
    }

    // this._GetStockData()
    //   .then(response => {
    //     var test = response.collection.items[0];
    //     var test2 = test.href
    //     var test3 = test.data.Title;
    //   })

    // double-check to have the API Key
    if (!this.props.apiKey) {

      // if we don't have the API Key, stop the Spinner
      this.setState({
        loading: false,
        stockInfo: null
      });
      // and show a specific error
      this.props.errorHandler(strings.NoAPIKeyInTenantProperties);
    } else {

      // show the Spinner control
      this.setState({
        loading: true
      });

      // get the current date and time
      const now: Date = new Date();

      // determine the date of the last work day
      const lastDay: Date = new Date(now.getTime() - (24 * ((now.getDay() === 0) ? 2 : (now.getDay() === 1) ? 3 : 1)) * 60 * 60000);
      const lastDayName: string = lastDay.toISOString().substring(0, 10);

      // get yesterday's closing price if it is not already in the local storage cache
      const dailyCloseKeyName: string = `PnP-Portal-AlphaVantage-Close-${escape(stockSymbol)}-${lastDayName}`;

      // try to get the close price from the local session storage
      let closeValue: number = Number(sessionStorage.getItem(dailyCloseKeyName));

      // if it is not there, load it from the API and store its value in the session storage
      if (!closeValue) {

        const serviceDailyEndpoint: string =
          `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${escape(stockSymbol)}&apikey=${this.props.apiKey}`;

        // request stock information to the REST API
        this.props.httpClient
        .get(serviceDailyEndpoint, HttpClient.configurations.v1)
        .then((response: HttpClientResponse): Promise<IAVResults> => {
          return response.json();
        })
        .then((data: IAVResults): void => {

          // if there are no errors and we have data
          if (!data["Error Message"] && data["Meta Data"] && data["Time Series (Daily)"]) {

            // get yesterday date and time
            const yesterdayData: IAVResultsSeries = data["Time Series (Daily)"][lastDayName];
            closeValue = yesterdayData["4. close"];

            if (closeValue > 0) {
              sessionStorage.setItem(dailyCloseKeyName, closeValue.toString());
            }
          }
        });
      }

      console.log("Before JP API Call 1");
      this.props.httpClient
      .get('https://jsonplaceholder.typicode.com/todos/1', HttpClient.configurations.v1)
      .then((res: HttpClientResponse): Promise<any> => {
        return res.json();
      })
      .then((response: any): void => {
        console.log(response);
      });

      console.log("Before Market Stack API Call 1");
      const serviceIntradayEndpointMarketStack: string = `http://api.marketstack.com/v1/intraday?access_key=d7cb51ec6900d1877d219e0254064c49&symbols=${escape(stockSymbol)}`;

      this.context.httpClient
        .get(serviceIntradayEndpointMarketStack, HttpClient.configurations.v1)
        .then((res: HttpClientResponse): Promise<any> => {
          return res.json();
        })
        .then((response: any): void => {
          console.log(response);
        });

      
      this.props.httpClient
      .get(serviceIntradayEndpointMarketStack, HttpClient.configurations.v1)
      .then((response: HttpClientResponse) => {
        console.log("Response Status: " + response.ok);
        if (response.ok) {
          console.log(response.json);
        }
        return response.json();
      })
      .then((data: MarketStackIntraday): void => {
        // if there are no errors and we have data
        if (!data["Error Message"] && data["Meta Data"] && data["Time Series (1min)"]) {
          const tempVar = '';
        }
      });
    

      const serviceIntradayEndpoint: string =
       `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${escape(stockSymbol)}&interval=1min&apikey=${this.props.apiKey}`;

       
      // request stock information to the REST API
      this.props.httpClient
        .get(serviceIntradayEndpoint, HttpClient.configurations.v1)
        .then((response: HttpClientResponse): Promise<IAVResults> => {
          return response.json();
        })
        .then((data: IAVResults): void => {

          // if there are no errors and we have data
          if (!data["Error Message"] && data["Meta Data"] && data["Time Series (1min)"]) {

            const timeSeries: Array<IAVResultsSeries> = new Array<IAVResultsSeries>();

            // parse response to retrieve the quotes
            lodash.forIn(data["Time Series (1min)"], (value: IAVResultsSeries, key: string) => {
              timeSeries.push(value);
            });

            // get the last data series from the AV service
            const lastAVDataSeries: IAVResultsSeries = timeSeries[0];

            // build the state variable to render the stock information
            const stockInfo: IStockTickerData = {
              fullName: this.props.stockFullName,
              symbol: data["Meta Data"]["2. Symbol"],
              lastRefreshed: now,
              lastData: {
                open: lastAVDataSeries["1. open"],
                high: lastAVDataSeries["2. high"],
                low: lastAVDataSeries["3. low"],
                close: lastAVDataSeries["4. close"],
                volume: lastAVDataSeries["5. volume"]
              },
              previousClose: closeValue
            };

            // set the state with the new stock information and stop the Spinner
            this.setState({
              loading: false,
              stockInfo: stockInfo
            });
          } else {
            // if we don't have data in the response, stop the Spinner and show previous data
            this.setState({
              loading: false
            });
            // and show a specific error
            this.props.errorHandler(`${strings.NoDataForStockSymbol}${escape(stockSymbol)}`);
          }
        }, (error: any): void => {
          // in case of any other generic error, stop the Spinner and show previous data
          this.setState({
            loading: false
          });
          // and show the error
          this.props.errorHandler(error);
        })
        .catch((error: any): void => {
          // in case of any other error, stop the Spinner and show previous data
          this.setState({
            loading: false
          });
          // and show the error
          this.props.errorHandler(error);
        });
    }
  }

  public render(): React.ReactElement<IStockTickerProps> {

    let contents: JSX.Element;

    // if we already have the configuration
    if (this.props.needsConfiguration === false &&
      this.state.stockInfo) {
      if (this.state.loading) {
        // show the Spinner control while loading data
        contents = <Spinner size={SpinnerSize.large} label={strings.LoadingDataLabel} />;
      } else {
        // show the Stock information, if we already have it
        const lastStockData: IStockData = this.state.stockInfo != null ? this.state.stockInfo.lastData : null;
        const previousClose: number = this.state.stockInfo != null ? this.state.stockInfo.previousClose : 0;
        const difference: number = lastStockData.close - previousClose;
        const differencePercent: number = (difference / previousClose) * 100;
        const stockDirection: string = differencePercent >= 0 ? 'stockUp' : 'stockDown';
        contents = (
          // Stock Name and Symbol section
          <div className={styles.stock}>
            <div className={styles.stockHeaderRow}>
              <div className={styles.stockHeaderColumn}>{this.state.stockInfo.fullName}</div>
              <div className={`${styles.stockHeaderColumn} ${styles.stockSymbol}`} >{this.state.stockInfo.symbol}</div>
          </div>

          {/* Stock Price Section */}
          <div className={styles.stockHeaderRow}>
              <div className={styles.stockDetails}></div>
              <div>
                <div className={`${styles.pill}`}>
                  <span className={styles.stockTrend}>
                    { lastStockData.close > previousClose ?
                    <Icon iconName='Up' /> :
                    lastStockData.close < previousClose ?
                    <Icon iconName='Down' /> :
                    <Icon iconName='Forward' /> }
                  </span>
                  <span className={styles.stockValue}>{ parseFloat(lastStockData.close.toString()).toFixed(2) } USD</span>
                  <span>{(difference >= 0 ? '+' : '')}{ parseFloat(difference.toString()).toFixed(2) }</span>
                  <span> ({differencePercent >= 0 ? '+' : ''}{ parseFloat(differencePercent.toString()).toFixed(2) }%)</span>
                </div>
              </div>
              <div className={styles.stockDetails}></div>
            </div>
            {/* Stock Footer: Refreshed, Volume, More info Link */}
            <div className={styles.stockHeaderRow}>
              <div className={styles.stockDetails}>
                <div>Last Refreshed</div>
                <div>{this.state.stockInfo.lastRefreshed.toLocaleDateString()} @ {this.state.stockInfo.lastRefreshed.toLocaleTimeString()}</div>
              </div>
              {/* <div className={styles.stockDetails}></div> */}
              <div className={`${styles.stockDetails} ${styles.stockSymbol}`}>
                <div>Volume:</div>
                <div>{this.state.stockInfo.lastData.volume}</div>
              </div>
              {/* <div className={styles.stockDetails}>
                <a href={`https://www.msn.com/en-us/money/stockdetails/fi-126.1.${this.state.stockInfo.symbol}.NAS?symbol=${this.state.stockInfo.symbol}&form=PRFIHQ`} target='_blank'>More info on MSN</a>
              </div> */}
            </div>
          </div>
        );
      }
    }

    // show the Placeholder control, if we are missing the real content, otherwise show the real content
    return (
      <div className={styles.stockTicker}>
        {this.props.needsConfiguration &&
          <Placeholder
            iconName={strings.PlaceholderIconName}
            iconText={strings.PlaceholderIconText}
            description={strings.PlaceholderDescription}
            buttonLabel={strings.PlaceholderButtonLabel}
            onConfigure={this.props.configureHandler} />
        }
        {contents}
      </div>);
  }
}
