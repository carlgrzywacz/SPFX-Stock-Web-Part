import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart
} from '@microsoft/sp-webpart-base';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneCheckbox,
  PropertyPaneToggle } from "@microsoft/sp-property-pane";

import { DisplayMode } from '@microsoft/sp-core-library';

import * as strings from 'StockTickerWebPartStrings';

// import supporting types
import StockTicker from './components/StockTicker';
import { IStockTickerProps } from './components/IStockTickerProps';
import { IStockTickerWebPartProps } from './IStockTickerWebPartProps';
// import { IStorageEntity } from "@pnp/sp/webs";
import { Web } from "@pnp/sp/webs";
import { sp, IStorageEntity } from "@pnp/sp/presets/all";

export default class StockTickerWebPart extends BaseClientSideWebPart<IStockTickerWebPartProps> {

  public async onInit(): Promise<void> {
    return super.onInit().then(async (_) => {
      // const { sp } = await import(
      //   /* webpackChunkName: 'pnp-sp' */
      //   "@pnp/sp");

      // init sp pnpjs library
      sp.setup({
        spfxContext: this.context
      });

    });
  }

  public async render(): Promise<void> {
    // get the API Key value
    const apiKey: string = await this.getApiKey();

    const element: React.ReactElement<IStockTickerProps> = React.createElement(
      StockTicker,
      {
        demo: this.properties.demo,
        stockSymbol: this.properties.stockSymbol,
        stockFullName: this.properties.stockFullName,
        apiKey: apiKey,
        needsConfiguration: this.needsConfiguration(),
        httpClient: this.context.httpClient,
        configureHandler: () => {
          this.context.propertyPane.open();
        },
        errorHandler: (errorMessage: string) => {
          if (this.displayMode === DisplayMode.Edit) {
            this.context.statusRenderer.renderError(this.domElement, errorMessage);
          } else {
            // nothing to do, if we are not in edit Mode
          }
        }
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              // groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneToggle('demo', {
                  label: strings.DemoFieldLabel
                }),
                PropertyPaneTextField('stockSymbol', {
                  label: strings.StockSymbolFieldLabel
                }),
                PropertyPaneTextField('stockFullName', {
                  label: strings.StockFullNameFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }

  // method to disable reactive properties in the property pane
  protected get disableReactivePropertyChanges(): boolean {
    return true;
  }

  // method to refresh any error after properties configuration
  protected onAfterPropertyPaneChangesApplied(): void {
    this.context.statusRenderer.clearError(this.domElement);
  }

  // method to determine if the web part has to be configured
  private needsConfiguration(): boolean {
    // as long as we don't have the stock symbol, we need configuration
    return !this.properties.demo && (!this.properties.stockSymbol ||
      this.properties.stockSymbol.length === 0);
  }

  // method to retrieve the API Key for Alpha Vantage
  private async getApiKey(): Promise<string> {

    const apiKeyName: string = "AlphaVantage-API-Key";

    // try to get the API Key from the local session storage
    let apiKey: string = sessionStorage.getItem(apiKeyName);
    //apiKey = "BHEAAE2VVAX0JMS6";
    // if it is not there, load it from the tenant properties
    // and store its value in the session storage
    if (!apiKey) {
      // const { sp } = await import(
      //   /* webpackChunkName: 'pnp-sp' */
      //   "@pnp/sp");

      const prop: IStorageEntity = await sp.web.getStorageEntity("Test1");

      const storageEntity: IStorageEntity = await sp.web.getStorageEntity(apiKeyName);
      if (storageEntity && !storageEntity['odata.null']) {
        apiKey = storageEntity.Value;
        sessionStorage.setItem(apiKeyName, apiKey);
      }
    }

    // return the API Key value
    return (apiKey);
  }
}
