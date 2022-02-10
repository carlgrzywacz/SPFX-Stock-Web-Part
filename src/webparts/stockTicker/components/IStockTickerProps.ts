import { HttpClient } from "@microsoft/sp-http";

export interface IStockTickerProps {
  stockSymbol: string;
  stockFullName: string;
  demo: boolean;
  apiKey?: string;
  needsConfiguration: boolean;
  httpClient: HttpClient;
  configureHandler: () => void;
  errorHandler: (errorMessage: string) => void;
}
