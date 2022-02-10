import { IStockTickerData } from "./IStockTickerData";

export interface IStockTickerState {
  // used to show the Spinner while loading stock information
  loading: boolean;
  // the real stock information data
  stockInfo?: IStockTickerData;
}
