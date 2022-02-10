declare interface IStockTickerWebPartStrings {
    // Property Pane labels and strings
    PropertyPaneDescription: string;
    BasicGroupName: string;
    StockFullNameFieldLabel: string;
    StockSymbolFieldLabel: string;
    DemoFieldLabel: string;
  
    // Placeholder labels and strings
    PlaceholderIconName: string;
    PlaceholderIconText: string;
    PlaceholderDescription: string;
    PlaceholderButtonLabel: string;
  
    // UI labels and strings
    LoadingDataLabel: string;
    NoDataForStockSymbol: string;
    NoAPIKeyInTenantProperties: string;
}

declare module 'StockTickerWebPartStrings' {
  const strings: IStockTickerWebPartStrings;
  export = strings;
}
