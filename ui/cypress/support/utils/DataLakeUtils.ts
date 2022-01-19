/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

// tslint:disable-next-line:no-implicit-dependencies
import * as CSV from 'csv-string';
import { FileManagementUtils } from './FileManagementUtils';
import { GenericAdapterBuilder } from '../builder/GenericAdapterBuilder';
import { ConnectUtils } from './ConnectUtils';
import { DataLakeFilterConfig } from '../model/DataLakeFilterConfig';

export class DataLakeUtils {


  public static getDataLakeTestSetAdapter(name: string, storeInDataLake: boolean = true) {
    const adapterBuilder = GenericAdapterBuilder
      .create('File_Set')
      .setName(name)
      .setTimestampProperty('timestamp')
      .addDimensionProperty('randomtext')
      .setFormat('csv')
      .addFormatInput('input', 'delimiter', ';')
      .addFormatInput('checkbox', 'header', 'check');

    if (storeInDataLake) {
      adapterBuilder.setStoreInDataLake();
    }
    return adapterBuilder.build();
  }

  public static loadDataIntoDataLake(dataSet: string) {
    // Create adapter with dataset
    FileManagementUtils.addFile(dataSet);

    const adapter = this.getDataLakeTestSetAdapter('datalake_configuration');
    ConnectUtils.addGenericSetAdapter(adapter);

    // Wait till data is stored
    cy.wait(10000);
  }

  public static loadRandomDataSetIntoDataLake() {
    this.loadDataIntoDataLake('fileTest/random.csv');
  }

  public static goToDatalake() {
    cy.visit('#/dataexplorer');
  }

  public static createAndEditDataView() {
    // Create new data view
    cy.dataCy('open-new-data-view-dialog')
      .click();

    // Configure data view
    cy.dataCy('data-view-name').type('Test View');
    cy.dataCy('save-data-view')
      .click();

    this.editDataView();
  }

  public static editDataView() {
    // Click edit button
    cy.dataCy('edit-data-view')
        .click();
  }

  public static saveDataExplorerWidgetConfiguration() {
    cy.dataCy('save-data-explorer-widget-btn', { timeout: 10000 }).click();
  }

  public static editWidget(widgetName: string) {
    cy.dataCy('edit-' + widgetName).click();
  }

  public static startEditWidget(widgetName: string) {
    cy.dataCy('more-options-' + widgetName).click();
    cy.dataCy('start-edit-' + widgetName).click();
  }

  public static saveAndReEditWidget() {
    // Save configuration
    DataLakeUtils.saveDataExplorerWidgetConfiguration();
    // Click start tab to go to overview
    cy.get('div').contains('Start').parent().click();
    DataLakeUtils.editDataView();
    // Edit widget again
    DataLakeUtils.editWidget('datalake_configuration');
  }

  public static addNewWidget() {
    cy.dataCy('add-new-widget')
      .click();
  }

  public static selectDataSet(dataSet: string) {
    cy.dataCy('data-explorer-select-data-set')
      .click()
      .get('mat-option')
      .contains(dataSet)
      .click();
  }


  /**
   * Checks if in the widget configuration the filters are set or not
   * @param amountOfFilter the amount of filters that should be set. 0 if no filter should be visible
   */
  public static checkIfFilterIsSet(amountOfFilter: number) {
    if (amountOfFilter === 0) {
      cy.dataCy('design-panel-data-settings-filter-field').should('not.exist');
    } else {
      cy.dataCy('design-panel-data-settings-filter-field').should('be.visible');
    }
  }

  /**
   * In the data set panel select all property fields
   */
  public static dataConfigSelectAllFields() {
    cy.dataCy('data-explorer-data-set-field-select-all')
      .click();
  }


  public static dataConfigAddFilter(filterConfig: DataLakeFilterConfig) {
    cy.dataCy('design-panel-data-settings-add-filter')
      .click();

    // Select field
    cy.dataCy('design-panel-data-settings-filter-field')
      .click()
      .get('mat-option')
      .contains(filterConfig.field)
      .click();

    // Select value
    cy.dataCy('design-panel-data-settings-filter-value').type(filterConfig.value);

    // Select operator
    cy.dataCy('design-panel-data-settings-filter-operator')
      .click()
      .get('mat-option')
      .contains(filterConfig.operator)
      .click();
  }

  public static dataConfigRemoveFilter() {
    cy.dataCy('design-panel-data-settings-remove-filter')
      .first()
      .click();
  }

  public static clickGroupBy(propertyName: string) {
    cy.dataCy('data-explorer-group-by-' + propertyName).children().click();
  }

  /**
   * Select visualization type
   */
  public static selectVisualizationType(type: string | 'Table') {
    // Select visualization type
    cy.dataCy('data-explorer-select-visualization-type')
      .click()
      .get('mat-option')
      .contains(type)
      .click();
  }

  public static selectDataConfig() {
    cy.get('.mat-tab-label').contains('Data').parent().click();
  }

  public static selectVisualizationConfig() {
    // Click Next button
    cy.get('.mat-tab-label').contains('Visualization').parent().click();
  }

  public static selectAppearanceConfig() {
    cy.get('.mat-tab-label').contains('Appearance').parent().click();
  }

  public static clickCreateButton() {
    // Create widget
    cy.dataCy('data-explorer-select-data-set-create-btn')
      .click();
  }

  public static goToDatalakeConfiguration() {
    cy.visit('#/configuration');
    cy.get('div').contains('DataLake').parent().click();
  }

  public static checkResults(dataLakeIndex: string, fileRoute: string, ignoreTime?: boolean) {

    // Validate result in datalake
    cy.request({
      method: 'GET',
      url: `/streampipes-backend/api/v4/datalake/measurements/${dataLakeIndex}/download?format=csv`,
      headers: {
        'content-type': 'application/octet-stream'
      },
      auth: {
        bearer: window.localStorage.getItem('auth-token')
      }
    }).should((response) => {
      const actualResultString = response.body;
      cy.readFile(fileRoute).then((expectedResultString) => {
        DataLakeUtils.resultEqual(actualResultString, expectedResultString, ignoreTime);
      });
    });
  }

  public static selectTimeRange(from: Date, to: Date) {
    cy.dataCy('1_year').click();
    // TODO fix time range selection
    // DataLakeUtils.setTimeInput('time-range-from', from);
    // DataLakeUtils.setTimeInput('time-range-to', to);
  }

  private static setTimeInput(selector: string, value: Date) {
    cy.dataCy(selector)
      .click();
    cy.wait(500);
    cy.get('.owl-dt-control-button-content').contains('Set').click({ 'force': true });
    cy.dataCy(selector)
      .clear()
      .type(`${value.toLocaleString()}{enter}`);
  }

  private static resultEqual(actual: string, expected: string, ignoreTime: boolean) {
    let actualResult;
    if (ignoreTime) {
      actualResult = DataLakeUtils.parseCsv(actual).map(row => {
        return row.splice(1);
      });
    } else {
      actualResult = DataLakeUtils.parseCsv(actual);
    }
    const expectedResult = ignoreTime ? DataLakeUtils.parseCsv(expected).map(row => row.splice(1)) : DataLakeUtils.parseCsv(expected);
    expect(actualResult).to.deep.equal(expectedResult);
  }

  private static parseCsv(csv: string) {
    return CSV.parse(csv, ';');
  }
}
