import React from 'react';

//import material components
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Multiselect from 'multiselect-react-dropdown';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';

import './data-grid.scss';

// import constants here
import {API_DOMAIN_URL, API_REQ_HEADERS, DATA_GRID_URLS, TABLE_MASTER_DATA} from '../../master-data/grid-constants';
import axios from 'axios';
import { ICharges, ICurrencyList, IJOBPostRequestPayload, IOperationalProcessResponse, IRequestedByModel, IServicesDropDownModel, ISupplierIdentifiers } from '../../types/types';

class DataGridComponent extends React.Component<{}, {tableData:IJOBPostRequestPayload[],operationalProcessInfo:IOperationalProcessResponse[], uomList:[], openDialog:boolean, modalInfo:any}> {
    tableRowData:IJOBPostRequestPayload[] = [] as IJOBPostRequestPayload[];
    operationalProcessInfo: IOperationalProcessResponse[] = [] as IOperationalProcessResponse[];
    servicesDropDownResponse: IServicesDropDownModel[] = [] as IServicesDropDownModel[];
    currencyList: ICurrencyList = {} as ICurrencyList;
    UOMList:any[] = [];
    paersonName= [];
    serviceJobId?: string;
    editRowId?: string;

    constructor(props:any){
        super(props);
        this.currencyList = {
            options: [],
            getOptionLabel: (option: ISupplierIdentifiers) => option.name,
        };
        this.state = {
            tableData:[],
            operationalProcessInfo:[],
            uomList: [],
            openDialog: false,
            modalInfo: {}
        }
    }

    componentDidMount() {
        this.getJobSerives();
    }

    /**
     * @method getJobSerives
     * @param none
     * @desc used to fetch job services on load to show on grid
     * @returns none 
     */
    getJobSerives():void {
        let search = window.location.search;
        let params = new URLSearchParams(search);
        this.serviceJobId = params.get('jobId')?.toString();
        const API_URL = `${API_DOMAIN_URL}${DATA_GRID_URLS.JOB_SERVICES}?jobId=${this.serviceJobId}`
        axios.get(API_URL,{headers:API_REQ_HEADERS})
        .then((response:any)=>{
            if(response && response.data && response.data.Services && response.data.Services.length>0) {
                this.tableRowData = response.data.Services;
                this.tableRowData.forEach((row:any)=>{
                    row.modeOfGrid = 'view';
                    if(row.RequestedBy && row.RequestedBy.length){
                        row.RequestedBy.forEach((item:any)=>{
                            item['legalName'] = item.name;
                        })
                    }
                    row.supplierIdentifiers = {
                        options: [{code:row.SupplierCode,name:row.SupplierName}],
                        getOptionLabel: (option: ISupplierIdentifiers) => option.name,
                        defaultValue: {code:row.SupplierCode,name:row.SupplierName}
                      };
                });
                this.setState({tableData: this.tableRowData});
            }
        });
    }

    /**
     * @method handleAddRow
     * @param none
     * @desc used to add the row to the table
     * @returns none 
     */
    handleAddRow():void {
        let tableRowObj = {} as IJOBPostRequestPayload;
        // set initial supplier object as []
        tableRowObj.supplierIdentifiers = {
            options: [],
            getOptionLabel: (option: ISupplierIdentifiers) => option.name,
          };
          tableRowObj.charges = [];
          tableRowObj.RequestedBy = [];
          tableRowObj.modeOfGrid = 'edit';
          tableRowObj.isNewService = true;
          tableRowObj.IsActive = true;
          tableRowObj.IsCharge = false;
        this.tableRowData.push(tableRowObj);
        this.fetchOperationalProcess();
        this.fetchCurrencyList(this.tableRowData.length-1);
        this.fetchUOMList();
    };

    /**
     * @method fetchOperationalProcess
     * @param none
     * @desc used to fetch operational process from server
     * @returns none 
     */
    fetchOperationalProcess():void {
        this.serviceJobId = this.serviceJobId?this.serviceJobId:'5011';
        const API_URL = `${API_DOMAIN_URL}${DATA_GRID_URLS.OPERATIONAL_PROCESS}?jobId=${this.serviceJobId}`
        axios.get(API_URL,{headers:API_REQ_HEADERS})
        .then((response:any)=>{
            if(response && response.data){
                this.operationalProcessInfo = response.data;
                this.setState({operationalProcessInfo:this.operationalProcessInfo});
            }
        });
    }

    /**
     * @method handleOperationalProcessChange
     * @param element<HTMLInputElemet>, index<number>
     * @desc used to handle the operational service change
     * @returns none 
     */
     handleOperationalProcessChange(element:any, index:number):void {
        const selectedOptionindex = element.target.selectedIndex;
        const selectedOption = element.target.childNodes[selectedOptionindex];
        const companyCode =  selectedOption.getAttribute('id'); 
        const jobProcessId = selectedOption.getAttribute('data-jobprocessid');
        this.tableRowData[index].companyCode = companyCode;
        this.tableRowData[index].OperationalProcessCode = element.target.value;
        this.tableRowData[index].JobOperationalProcessFk = jobProcessId; 
        this.tableRowData[index].OperationalProcessName = selectedOption.getAttribute('data-process-name');; 
        if(element.target.value && companyCode){
            this.fetchServices(element.target.value, index, companyCode);
            this.getRequestedByList(jobProcessId,index);
            if(this.tableRowData[index].charges && this.tableRowData[index].charges.length>0){
                this.fetchTaxTypes(companyCode, index);
            }
        }
    }

   /**
     * @method openProcessChangeModal
     * @param element<any>, index<number>
     * @desc used to open the opeartional process change modal
     * @returns none 
     */
    openProcessChangeModal(element:any, index:number):void {
        if(this.tableRowData[index].charges.length>0){
            this.setState({modalInfo:{element: element, parentRowIndex:index, 
                typeOfModal:'OPC_MODAL', messageText: 'This action will remove all the services/charges'}, openDialog: true});
        }else {
            this.handleOperationalProcessChange(element, index);
        }
    }

   /**
     * @method fetchServices
     * @param operationalCode:string,index:number,companyCode:string
     * @desc used to fetch the service from server
     * @returns none 
     */
    fetchServices(operationalCode:string,index:number, companyCode:string):void {
        if(companyCode && operationalCode){
            const SERVICE_API_URL = `${API_DOMAIN_URL}${DATA_GRID_URLS.SERVICES}?op-code=${operationalCode}&company-code=${companyCode}`
            axios.get(SERVICE_API_URL, {headers:API_REQ_HEADERS})
            .then((response:any)=>{
                if(response && response.data && response.data.length>0 && response.data[0].services){
                    this.tableRowData[index].serviceDropDownList = response.data[0].services;
                    this.setState({tableData: this.tableRowData});
                }
            });
        }
    }

    /**
     * @method handleServiceChange
     * @param element<HTMLInputElemet>, index<number>
     * @desc used to handle the service select box change
     * @returns none 
     */
    handleServiceChange(element:any, index:number):void {
        const selectedOptionindex = element.target.selectedIndex;
        const selectedOption = element.target.childNodes[selectedOptionindex];
        const serviceCode =  selectedOption.getAttribute('id');
        this.tableRowData[index].Code = serviceCode;
        // add child rows if service code presents
        if(serviceCode) {
            this.tableRowData[index].Name = element.target.value;
            this.fetchChildCharges(this.tableRowData[index].companyCode?this.tableRowData[index].companyCode:'GDUB',serviceCode,index)
        }
        // add first child row if child row is empty 
        if(serviceCode && selectedOption && this.tableRowData[index] && this.tableRowData[index].charges 
            && !this.tableRowData[index].charges.length) {
            this.tableRowData[index].charges.push({IsActive:true, IsCharge:true, 
            JobOperationalProcessFk:this.tableRowData[index].JobOperationalProcessFk, 
            CostCurrencyExchangeRate: this.tableRowData[index].CostCurrencyExchangeRate,
            CostCurrencyName:this.tableRowData[index].CostCurrencyName,
            CostCurrencyCode:this.tableRowData[index].CostCurrencyCode} as ICharges);
            this.tableRowData[index].showContent = true;
            this.fetchTaxTypes(this.tableRowData[index].companyCode, index);
        }
        this.setState({tableData:this.tableRowData});

    }

    /**
     * @method openServiceChangeModal
     * @param element<any>, index<number>
     * @desc used to fetch the curency list from server
     * @returns none 
     */
    openServiceChangeModal(element:any, index:number): void{
        if(this.tableRowData[index].charges.length>0){
            this.setState({modalInfo:{element: element, parentRowIndex:index, 
                typeOfModal:'SERVICE_MODAL', messageText: 'This action will remove the below charges'}, openDialog: true});
        }else {
            this.handleServiceChange(element, index);
        }
    }

    /**
     * @method fetchCurrencyList
     * @param none
     * @desc used to fetch the curency list from server
     * @returns none 
     */
    fetchCurrencyList(parentRowIndex:number):void {
        if(!this.currencyList || !Object.keys(this.currencyList).length || !this.currencyList.options.length){
            const API_URL = `${API_DOMAIN_URL}${DATA_GRID_URLS.CURRENCY}`
            axios.get(API_URL,{headers:API_REQ_HEADERS})
            .then((response:any)=>{
                if(response && response.data && response.data.length>0) {
                    this.currencyList = {
                        options: response.data,
                        getOptionLabel: (option: ISupplierIdentifiers) => option.code,
                    };
                    this.tableRowData[parentRowIndex].currencyList = this.currencyList;
                }
            });
        }else{
            this.tableRowData[parentRowIndex].currencyList = this.currencyList;
        }
        this.setState({tableData:this.tableRowData});
    };

    /**
     * @method handleCurrencyChange
     * @param event<ISupplierIdentifiers>, parentRowIndex<number>
     * @desc used to handle currency change in combo box
     * @returns none 
     */
    handleCurrencyChange(event:ISupplierIdentifiers, parentRowIndex:number): void {
        if(event && event.code){
            this.tableRowData[parentRowIndex].CostCurrencyCode = event.code;
            this.tableRowData[parentRowIndex].CostCurrencyName = event.name;
            this.setState({tableData:this.tableRowData});
            this.getExchangeRate(event.code, this.tableRowData[parentRowIndex].companyCode, parentRowIndex);
        }
    }

    /**
     * @method getExchangeRate
     * @param targetCurency<string>, companyCode<string>, parentRowIndex<number>
     * @desc used to fetch the echange rate from the server
     * @returns none 
     */
    getExchangeRate(targetCurency:string, companyCode:string, parentRowIndex:number):void {
        const SUPPLIER_API_URL = `${API_DOMAIN_URL}${DATA_GRID_URLS.EXCHANGERATE}?from-currency-code=AED&target-currency-code=${targetCurency}&company-code=${companyCode}`
        axios.get(SUPPLIER_API_URL, {headers:API_REQ_HEADERS})
        .then((response:any)=>{
            if(response && response.data && response.data.ExchangeRate) {
                this.tableRowData[parentRowIndex].CostCurrencyExchangeRate = response.data.ExchangeRate;
                this.setState({tableData:this.tableRowData});
            }
        });
    }

    /**
     * @method fetchUOMList
     * @param none
     * @desc used to fetch UOM list from the srver
     * @returns none 
     */
    fetchUOMList():void {
        const API_URL = `${API_DOMAIN_URL}${DATA_GRID_URLS.UOM}`
        axios.get(API_URL,{headers:API_REQ_HEADERS})
        .then((response:any)=>{
            if(response && response.data && response.data.length>0) {
                this.UOMList = response.data;
                this.setState({
                    tableData: this.tableRowData
                });
            }
        });
    };

    /**
     * @method handleUOMChange
     * @param selectedValue<string>, index<number>
     * @desc used to set UOM change in the payload
     * @returns none 
     */
    handleUOMChange(element:any, childRowIndex: number, parentRowIndex:number):void {
        const selectedOptionindex = element.target.selectedIndex;
        const selectedOption = element.target.childNodes[selectedOptionindex];
        this.tableRowData[parentRowIndex].charges[childRowIndex].EstimatedUomCode = selectedOption.getAttribute('id');
        this.tableRowData[parentRowIndex].charges[childRowIndex].EstimatedUomName = element.target.value;
    }

    /**
     * @method getRequestedByList
     * @param operationalProcessId<string>,index<number>
     * @desc used to fetch the request by list from server
     * @returns none 
     */
    getRequestedByList(operationalProcessId:string,index:number):void {
        const API_URL = `${API_DOMAIN_URL}${DATA_GRID_URLS.JOB_PARTIES}?opId=${operationalProcessId}`
        axios.get(API_URL,{headers:API_REQ_HEADERS})
        .then((response:any)=>{
            if(response && response.data && response.data.length>0) {
                this.tableRowData[index].jobPartiesList = response.data;
                this.setState({tableData:this.tableRowData});
            }
        });
    };

    /**
     * @method handleRequestByChange
     * @param event<any>, index<number>
     * @desc used to set request by change in the payload
     * @returns none 
     */
    handleRequestByChange(event:any, index:number):void {
        this.tableRowData[index].RequestedBy = [] as IRequestedByModel[];
        if(event.length>0){
            event.forEach((item: any)=>{
                let requestByObj = {} as IRequestedByModel;
                requestByObj.code = item.code;
                requestByObj.name = item.legalName;
                requestByObj.legalName = item.legalName;
                requestByObj.operationalProcessPartyId = item.operationalProcessPartyId;
                this.tableRowData[index].RequestedBy.push(requestByObj);
            });
            this.setState({tableData: this.tableRowData});
        }
    }

    /**
     * @method fetchChildCharges
     * @param element<HTMLInputElemet>
     * @desc used to handle the service select box change
     * @returns none 
     */
    fetchChildCharges(companyCode:string, serviceCode:string, index:number):void {
        const SERVICE_API_URL = `${API_DOMAIN_URL}${DATA_GRID_URLS.CHARGES}?company-code=${companyCode}&service-code=${serviceCode}`
        axios.get(SERVICE_API_URL, {headers:API_REQ_HEADERS})
        .then((response:any)=>{
            if(response && response.data && response.data.length>0 && response.data) {
                // update all the child rows with charges list
                this.tableRowData[index].charges.forEach((item)=>{
                    item.servicesList = response.data;
                });
                this.setState({tableData: this.tableRowData});
            }
        });
    }

    /**
     * @method handleChargeChange
     * @param element<HTMLSelectElement>, parentRowIndex<number>, childRowIndex<number>
     * @desc used to set request by change in the payload
     * @returns none 
     */
    handleChargeChange(element: any, parentRowIndex:number, childRowIndex:number):void {
        const selectedOptionindex = element.target.selectedIndex;
        const selectedOption = element.target.childNodes[selectedOptionindex];
        this.tableRowData[parentRowIndex].charges[childRowIndex].Code = selectedOption.getAttribute('id');
        this.tableRowData[parentRowIndex].charges[childRowIndex].Name = element.target.value; 
    }

    /**
     * @method getSuppliers
     * @param inputValue<string>, index<number>
     * @desc used to fetch the supplier list from the server
     * @returns none 
     */
    getSuppliers(inputValue:string, index:number):void {
        if(inputValue.length>3) {
            const SUPPLIER_API_URL = `${API_DOMAIN_URL}${DATA_GRID_URLS.SUPPLIER}?searchText=${inputValue}`
            axios.get(SUPPLIER_API_URL, {headers:API_REQ_HEADERS})
            .then((response:any)=>{
                if(response && response.data && response.data.identifiers && response.data.identifiers.length>0) {
                    this.tableRowData[index].supplierIdentifiers = {
                        options: response.data.identifiers,
                        getOptionLabel: (option: ISupplierIdentifiers) => option.name,
                      }; 
                    this.setState({tableData: this.tableRowData});
                }
            });
        }
    }

    /**
     * @method handleSupplierChange
     * @param inputValue<ISupplierIdentifiers>, index<number>
     * @desc used to set the supplier changes in the payload
     * @returns none 
     */
    handleSupplierChange(inputValue:ISupplierIdentifiers, index:number):void {
        if(inputValue) {
            this.tableRowData[index].SupplierCode = inputValue.code;
            this.tableRowData[index].SupplierName = inputValue.name;
        } else {
            this.tableRowData[index].SupplierCode = inputValue;
            this.tableRowData[index].SupplierName = inputValue;
        }
    }

    /**
     * @method fetchTaxTypes
     * @param companyCode<string>, index<number>
     * @desc used to fetch the tax types from the server
     * @returns none 
     */
    fetchTaxTypes(companyCode:string, index:number):void {
        const SUPPLIER_API_URL = `${API_DOMAIN_URL}${DATA_GRID_URLS.TAX_TYPE}?companyCode=${companyCode?companyCode:'GDUB'}`
        axios.get(SUPPLIER_API_URL, {headers:API_REQ_HEADERS})
        .then((response:any)=>{
            if(response && response.data) {
                 // update all the child rows with tax types list
                 this.tableRowData[index].charges.forEach((item)=>{
                    item.taxTypesList = response.data;
                });
            }
        });
    }

    /**
     * @method addChildRow
     * @param index<number>
     * @desc used to add the charges row
     * @returns none 
     */
    addChildRow(index:number):void {
        this.tableRowData[index].showContent = true;
        let chargesObj = {} as ICharges;
        if(this.tableRowData[index].charges && this.tableRowData[index].charges.length>0){
            // update services list with 0th row service list as it's same for all child rows
            chargesObj.servicesList = this.tableRowData[index].charges[0].servicesList;
        }
        if(this.tableRowData[index].charges && this.tableRowData[index].charges.length>0){
            // update tax types list with 0th row service list as it's same for all child rows
            chargesObj.taxTypesList = this.tableRowData[index].charges[0].taxTypesList;
        }
        chargesObj.IsActive = true;
        chargesObj.JobOperationalProcessFk = this.tableRowData[index].JobOperationalProcessFk;
        chargesObj.IsCharge = true;
        chargesObj.CostCurrencyExchangeRate = this.tableRowData[index].CostCurrencyExchangeRate;
        chargesObj.CostCurrencyCode = this.tableRowData[index].CostCurrencyCode;
        chargesObj.CostCurrencyName = this.tableRowData[index].CostCurrencyName;
        this.tableRowData[index].charges.push(chargesObj);
        this.setState({tableData:this.tableRowData});
    }

    /**
     * @method handleInputValueChanges
     * @param event<any>, parentRowIndex<number>, childRowIndex<number>
     * @desc used to handle the calculations in the child row
     * @returns none 
     */
    handleInputValueChanges(event:any, parentRowIndex:number, childRowIndex:number):void {
        const inputName:'EstimatedQuantity'|'EstimatedUnitCost' = event.target.name;
        if((event.target.name === 'EstimatedQuantity' || event.target.name === 'EstimatedUnitCost') && event.target.value!=='0') {
            this.tableRowData[parentRowIndex].charges[childRowIndex][inputName] = event.target.value;
            this.tableRowData[parentRowIndex].charges[childRowIndex] = this.handleCalculations(this.tableRowData[parentRowIndex].charges[childRowIndex], parentRowIndex);
            this.setState({tableData:this.tableRowData});
        } else if(event.target.name === 'ActualTotalCost') {
            this.tableRowData[parentRowIndex].charges[childRowIndex][inputName] = event.target.value;
        }
        this.calculateTaxAmount(parentRowIndex, childRowIndex);
    }

    /**
     * @method handleCalculations
     * @param childRow<ICharges>, parentRowIndex<number>
     * @desc used to calculate the estimated cost
     * @returns ICharges 
     */
    handleCalculations(childRow:ICharges, parentRowIndex:number): ICharges {
       childRow.EstimatedTotalCost =  childRow.EstimatedQuantity && childRow.EstimatedUnitCost && this.tableRowData[parentRowIndex].CostCurrencyExchangeRate? 
                        childRow.EstimatedQuantity * childRow.EstimatedUnitCost * this.tableRowData[parentRowIndex].CostCurrencyExchangeRate:0;
       return childRow;
    }

    /**
     * @method handleTaxTypeChange
     * @param element<any>, parentRowIndex<number>, childRowIndex<number>
     * @desc used to handle the tax type changes
     * @returns none 
     */
    handleTaxTypeChange(element:any, parentRowIndex:number, childRowIndex:number):void {
        this.tableRowData[parentRowIndex].charges[childRowIndex].TaxRate = element.target.value;
        this.calculateTaxAmount(parentRowIndex, childRowIndex);
        this.setState({tableData: this.tableRowData});
    }

    /**
     * @method calculateTaxAmount
     * @param parentRowIndex<number>, childRowIndex<number>
     * @desc used to calculate the tax amount
     * @returns none 
     */
    calculateTaxAmount(parentRowIndex:number, childRowIndex:number):void {
        if(this.tableRowData[parentRowIndex].charges[childRowIndex].TaxRate){
            this.tableRowData[parentRowIndex].charges[childRowIndex].TaxAmount = (this.tableRowData[parentRowIndex].charges[childRowIndex].TaxRate * 
            this.tableRowData[parentRowIndex].charges[childRowIndex].EstimatedTotalCost)/100;
            this.tableRowData[parentRowIndex].charges[childRowIndex].EstimatedTotalCostIncTax = this.tableRowData[parentRowIndex].charges[childRowIndex].TaxAmount + 
            this.tableRowData[parentRowIndex].charges[childRowIndex].EstimatedTotalCost;
        }
    }

    /**
     * @method toggleContent
     * @param parentRowIndex<number>
     * @desc used to toggle the content
     * @returns none 
     */
    toggleContent(parentIndex:number):void {
        this.tableRowData[parentIndex].showContent = !this.tableRowData[parentIndex].showContent;
        this.setState({tableData: this.tableRowData});
    }

    /**
     * @method openDeleteModal
     * @param deleteParentRow<boolean>, parentRowIndex<number>, childRowIndex<number>
     * @desc used to delete the parent/child row based on user selection
     * @returns none 
     */
    openDeleteModal(deleteParentRow: boolean, parentRowIndex:number, childRowIndex:number){
        const messageText = deleteParentRow?'Are you sure want to delete service?':'Are you sure want to delete charges?'
        this.setState({modalInfo:{deleteParentRow: deleteParentRow, parentRowIndex:parentRowIndex, childRowIndex:childRowIndex, 
            typeOfModal:'DELETE', messageText: messageText}, openDialog: true});
    }

    /**
     * @method deleteRow
     * @param deleteParentRow<boolean>, parentRowIndex<number>, childRowIndex<number>
     * @desc used to delete the parent/child row based on user selection
     * @returns none 
     */
    deleteRow(deleteParentRow: boolean, parentRowIndex:number, childRowIndex:number):void {
        if(deleteParentRow){
            this.tableRowData.splice(parentRowIndex,1);
        } else {
            this.tableRowData[parentRowIndex].charges.splice(childRowIndex,1);
        }
        this.setState({tableData: this.tableRowData});
    }

    /**
     * @method saveServiceJob
     * @param none
     * @desc used to save the services data in server
     * @returns none 
     */
    saveServiceJob():void {
        const SUPPLIER_API_URL = `${API_DOMAIN_URL}${DATA_GRID_URLS.SAVE_JOB}?jobId=${this.serviceJobId}`;
        axios.post(SUPPLIER_API_URL, {Services:this.tableRowData}, {headers:API_REQ_HEADERS})
        .then((response:any)=>{
        // TODO :: make everything view mode once get the grid data in response payload
        },(error)=>{
            console.log(error);
        });
    }

    /**
     * @method changeViewToEditMode
     * @param parentRowIndex<number>
     * @desc used to change the grid mode from view to edit
     * @returns none 
     */
    changeViewToEditMode(parentRowIndex:number):void {
        this.tableRowData[parentRowIndex].modeOfGrid = 'edit';
        this.fetchOperationalProcess();
        this.tableRowData[parentRowIndex].currencyList = {
            options: [{code:this.tableRowData[parentRowIndex].CostCurrencyCode,name:this.tableRowData[parentRowIndex].CostCurrencyName}],
            getOptionLabel: (option: ISupplierIdentifiers) => option.code,
            defaultValue: {code:this.tableRowData[parentRowIndex].CostCurrencyCode,name:this.tableRowData[parentRowIndex].CostCurrencyName}
        };
        this.fetchUOMList();
        this.fetchServices(this.tableRowData[parentRowIndex].OperationalProcessCode, parentRowIndex, 'GDUB');
        this.fetchChildCharges('GDUB', this.tableRowData[parentRowIndex].Code, parentRowIndex);
        this.fetchTaxTypes('GDUB', parentRowIndex);
        this.getRequestedByList(this.tableRowData[parentRowIndex].JobOperationalProcessFk, parentRowIndex);
        this.setState({tableData:this.tableRowData});
    }

    /**
     * @method changeEditToViewMode
     * @param parentRowIndex<number>
     * @desc used to change the grid mode from edit to view
     * @returns none 
     */
    changeEditToViewMode(parentRowIndex:number):void {
        this.tableRowData[parentRowIndex].modeOfGrid = 'view';
        this.setState({tableData:this.tableRowData});
    }

    /**
     * @method handleClose
     * @param typeOfAction<string>
     * @desc used to close the popup modal and call the corresponding action
     * @returns none 
     */
    handleClose(typeOfAction:string):void {
        if(this && this.state && this.state.modalInfo && this.state.modalInfo.typeOfModal && typeOfAction === 'Okay'){
            switch(this.state.modalInfo.typeOfModal){
                case 'DELETE':
                    this.deleteRow(this.state.modalInfo.deleteParentRow, this.state.modalInfo.parentRowIndex, this.state.modalInfo.childRowIndex);
                    break;
                case 'OPC_MODAL':
                    this.resetServices(this.state.modalInfo.element, this.state.modalInfo.parentRowIndex);
                    break
                case 'SERVICE_MODAL':
                    this.tableRowData[this.state.modalInfo.parentRowIndex].charges = [];
                    this.setState({tableData: this.tableRowData},()=>{
                        this.handleServiceChange(this.state.modalInfo.element, this.state.modalInfo.parentRowIndex);
                    });
                    break;
            }
        }
        if(this)
            this.setState({openDialog: false});
    };

    /**
     * @method resetServices
     * @param element<HTMLInputElement>, parentRowIndex<number>
     * @desc used to reset services on selection of operational process change
     * @returns none 
     */
    resetServices(element:any, parentRowIndex:number):void {
        this.tableRowData[parentRowIndex].Code = '';
        this.tableRowData[parentRowIndex].Name = '';
        this.tableRowData[parentRowIndex].RequestedBy = [];
        this.tableRowData[parentRowIndex].SupplierCode = '';
        this.tableRowData[parentRowIndex].SupplierName = '';
        this.tableRowData[parentRowIndex].CostCurrencyCode = '';
        this.tableRowData[parentRowIndex].CostCurrencyName = '';
        this.tableRowData[parentRowIndex].CostCurrencyExchangeRate = 0;
        this.tableRowData[parentRowIndex].charges = [];
        this.currencyList = {} as ICurrencyList;
        this.setState({tableData:this.tableRowData},()=>{
            this.handleOperationalProcessChange(element, parentRowIndex); 
        });
    }

  render() {
    return (
      <div className="container-fluid data-grid-component">
            <div className="data-grid-component__btn-title-wrapper">
                <div className="data-grid-component__btn-title-wrapper__title"> Services and Charges </div>
                <div className="btn-wrapper">
                    <button className="data-grid-component__btn-title-wrapper__button" onClick={this.handleAddRow.bind(this)}>
                        <img src="/add-icon.png" alt="add_icon" />Add New Service
                    </button>
                    <button className="data-grid-component__btn-title-wrapper__save-btn" onClick={this.saveServiceJob.bind(this)}>Save Job</button>
                </div>
            </div>
            <div className="data-grid-component__wrapper row">
                <div className="data-grid-component__wrapper__header">
                    {TABLE_MASTER_DATA?.map((item) =>  <div className={item.className}>{item.headerTitle}</div>)}
                </div>
                <div className="data-grid-component__wrapper__body">
                    {this.state.tableData && this.state.tableData.length>0 ?this.state.tableData.map((eachRow,parentRowIndex) =>
                    <div className="body-parent-child-wrapper" id={'parent-row-'+parentRowIndex} key={parentRowIndex} tabIndex={ 0 }>
                        <div className="body-row" id={'parent-row-'+parentRowIndex}>
                            <div className="serial-number">{parentRowIndex+1} {eachRow.isNewService && <span className="badge badge-pill badge-info">New</span>}</div>
                            <div className="edit-icon"> 
                               {eachRow.modeOfGrid === 'view' && <img src="/edit-icon.png" alt="edit_icon" onClick={(event)=>this.changeViewToEditMode(parentRowIndex)} />}
                               {eachRow.modeOfGrid === 'edit' && <img src="/check-mark.png" alt="view_icon" onClick={(event)=>this.changeEditToViewMode(parentRowIndex)} />}
                            </div>
                            <div className="toggle-icon" onClick={()=>this.toggleContent(parentRowIndex)}> 
                                <img src="/down-arrow.png" alt="toggle_icon" className={eachRow.showContent?'up-arrow':''} />
                            </div>
                            {eachRow.modeOfGrid === 'edit' && <div className="delete-icon" onClick={()=>this.openDeleteModal(true, parentRowIndex,0)}><img alt="delte icon" src="/delete-icon.png"/></div>}
                            <div className="operational-process">
                               {eachRow.modeOfGrid === 'edit'? <select onChange={($event)=>this.openProcessChangeModal($event,parentRowIndex)} value={eachRow.OperationalProcessCode}>
                                    <option value="null">Select Operational Process</option>
                                    {this.operationalProcessInfo.map((item)=>
                                        <option data-process-name={item.OperationalProcessName} data-jobprocessid={item.JobOperationalProcessId} id={item.CompanyCode} value={item.OperationalProcessCode}>{item.OperationalProcessName} | {item.ProcessReferenceNumber}</option>)}
                                </select>:eachRow.OperationalProcessName}
                            </div>
                            <div className="charge-name">                           
                            {eachRow.modeOfGrid === 'edit'? <select onChange={($event)=>this.openServiceChangeModal($event,parentRowIndex)} value={eachRow.Name}>
                                    <option value="null">Select Services</option>
                                    {eachRow && eachRow.serviceDropDownList&& (eachRow.serviceDropDownList.map((item)=><option id={item.code} value={item.name}>{item.name}</option>))}
                                </select>:eachRow.Name}
                            </div>
                           {eachRow.modeOfGrid === 'edit' && <div className={eachRow.OperationalProcessCode && eachRow.Code?'add-icon':'add-icon disabled'}>
                                <img src="/add.svg" alt="add_icon" onClick={()=>this.addChildRow(parentRowIndex)} />
                            </div>}
                            <div className="requested-by">
                               {eachRow.modeOfGrid === 'edit' && <Multiselect
                                    options={eachRow.jobPartiesList} // Options to display in the dropdown
                                    selectedValues={eachRow.RequestedBy} // Preselected value to persist in dropdown
                                    onSelect={($event)=>this.handleRequestByChange($event,parentRowIndex)} // Function will trigger on select $event
                                    onRemove={($event)=>this.handleRequestByChange($event,parentRowIndex)} // Function will trigger on remove $event
                                    displayValue="legalName" // Property name to display in the dropdown options
                                    showCheckbox={true}
                                    hidePlaceholder={true}
                                />}
                                {eachRow.modeOfGrid === 'view' && eachRow.RequestedBy && eachRow.RequestedBy.map((requestedByItem)=>
                                    <span>{requestedByItem.name}</span>
                                )}
                            </div>
                            <div className="supplier">  
                                {eachRow.modeOfGrid === 'edit'? <Autocomplete
                                    onChange={($event: any, newValue: any) => {
                                        this.handleSupplierChange(newValue,parentRowIndex);
                                    }}
                                    onInputChange={($event, newInputValue) => {
                                        this.getSuppliers(newInputValue,parentRowIndex);
                                    }}
                                    {...eachRow.supplierIdentifiers}
                                    id="supplier"
                                    renderInput={(params) => <TextField {...params} label="Type To Search Supplier" margin="normal" />}
                                />:eachRow.SupplierName}
                            </div>
                            <div className="quantity"></div>
                            <div className="uom"></div>
                            <div className="unit-cost"></div>
                            <div className="cost-currency">
                                {eachRow.modeOfGrid === 'edit'? <Autocomplete
                                    onChange={($event: any, newValue: any) => {
                                        this.handleCurrencyChange(newValue,parentRowIndex);
                                    }}
                                    onInputChange={() => {
                                        this.fetchCurrencyList(parentRowIndex);
                                    }}
                                    {...eachRow.currencyList}
                                    id="currency"
                                    renderInput={(params) => <TextField {...params} label="Currency" margin="normal" />}
                                />:eachRow.CostCurrencyCode}
                            </div>
                            <div className="cost-currency"></div>
                            <div className="est-total-cost"></div>
                            <div className="tax-type"></div>
                            <div className="tax-rate"></div>
                            <div className="tax-amount"></div>
                            <div className="inclusive-tax"></div>
                            <div className="actual-cost"></div>
                            <div className="cost-variance"></div>
                            <div className="service-request">
                                <a href={eachRow.serviceRequestLink}>{eachRow.ServiceRequestNo}</a>
                            </div>
                            <div className="linked-crew">
                             NA 
                            </div>
                            <div className="no-of-ship-spares">
                             NA 
                            </div>
                            <div className="sr-status">
                            {eachRow.StatusName} 
                            </div>
                            <div className="rating"></div>
                            <div className="service-status"></div>
                            <div className="start-date-time">
                            {eachRow.StartTime}
                            </div>
                            <div className="end-date-time">
                            {eachRow.EndTime}
                            </div>
                            <div className="completed-date-time">
                            {eachRow.CompletedTime}
                            </div>
                            <div className="remarks">
                            {eachRow.Remarks} 
                            </div>
                            </div>
                       {eachRow.charges && eachRow.charges.map((childRow,childRowIndex)=><div className={eachRow.showContent?'child-rows':'hide-content child-rows'} key={childRowIndex}>
                            {eachRow.modeOfGrid === 'edit' && eachRow.charges.length>1 && <div className="delete-icon" onClick={()=>this.openDeleteModal(false, parentRowIndex, childRowIndex)}><img alt="delte icon" src="/delete-icon.png"/></div>}
                            <div className={eachRow.modeOfGrid === 'edit'?'operational-process':'operational-process-view'}>
                            </div>
                            <div className="charge-name">                           
                               {eachRow.modeOfGrid === 'edit' ? <select onChange={($event)=>this.handleChargeChange($event, parentRowIndex, childRowIndex)} value={childRow.Name}>
                                    <option value="null">Select Charge</option>
                                    {childRow && childRow.servicesList && (childRow.servicesList.map((item)=><option id={item.code} value={item.name}>{item.name}</option>))}
                                </select>: childRow.Name }
                            </div>
                            <div className="requested-by"></div>
                            <div className="supplier"></div>
                            <div className="quantity">
                            {eachRow.modeOfGrid === 'edit' ?  
                                <input type="text" name="EstimatedQuantity" defaultValue={childRow.EstimatedQuantity} onBlur={($event)=>this.handleInputValueChanges($event, parentRowIndex, childRowIndex)}/>:
                                childRow.EstimatedQuantity}
                            </div>
                            <div className="uom">
                               {eachRow.modeOfGrid === 'edit' ? <select onChange={($event)=>this.handleUOMChange($event,childRowIndex,parentRowIndex)} id="uom-select-box" value={childRow.EstimatedUomCode}>
                                        <option value="null">Select Unit Of Measures</option>
                                        {this.UOMList.map((item:any)=><option id={item.code} value={item.name}>{item.name}</option>)}
                                </select>:childRow.EstimatedUomName}
                            </div>
                            <div className="unit-cost">
                                {eachRow.modeOfGrid === 'edit' ? <input type="text" name="EstimatedUnitCost" defaultValue={childRow.EstimatedUnitCost} 
                                    onBlur={($event)=>this.handleInputValueChanges($event, parentRowIndex, childRowIndex)}/>:childRow.EstimatedUnitCost}
                            </div>
                            <div className="cost-currency">
                                {eachRow.CostCurrencyCode}
                            </div>
                            <div className="cost-currency">
                                {eachRow.CostCurrencyExchangeRate && Number(eachRow.CostCurrencyExchangeRate).toFixed(2)}
                            </div>
                            <div className="est-total-cost">
                                {childRow.EstimatedTotalCost && Number(childRow.EstimatedTotalCost).toFixed(2)}
                            </div>
                            <div className="tax-type">
                            {eachRow.modeOfGrid === 'edit'? <select onChange={($event)=>this.handleTaxTypeChange($event, parentRowIndex, childRowIndex)} value={childRow.TaxRate}>
                                    <option value="null">Select Tax Type</option>
                                    {childRow && childRow.taxTypesList && childRow.taxTypesList.length && (childRow.taxTypesList.map((item)=><option id={item.TaxId} value={item.Percentage}>{item.Name}</option>))}
                                </select>:childRow.TaxTypeName}
                            </div>
                            <div className="tax-rate">{childRow.TaxRate}</div>
                            <div className="tax-amount">
                                {eachRow.modeOfGrid === 'edit'? childRow.TaxAmount && Number(childRow.TaxAmount).toFixed(2):childRow.TaxAmount}
                            </div>
                            <div className="inclusive-tax">
                                {eachRow.modeOfGrid === 'edit'? childRow.EstimatedTotalCostIncTax && Number(childRow.EstimatedTotalCostIncTax).toFixed(2):childRow.EstimatedTotalCostIncTax }
                            </div>
                            <div className="actual-cost">
                            {eachRow.modeOfGrid === 'edit'? <input type="text" name="ActualTotalCost" defaultValue={childRow.ActualTotalCost} onBlur={($event)=>this.handleInputValueChanges($event, parentRowIndex, childRowIndex)}/>:childRow.ActualTotalCost}
                            </div>
                            <div className="actual-cost">
                            {eachRow.modeOfGrid === 'edit'? <input type="text" name="CostVariance" defaultValue={childRow.CostVariance} onBlur={($event)=>this.handleInputValueChanges($event, parentRowIndex, childRowIndex)}/>:childRow.CostVariance}
                            </div>
                            <div className="service-request">
                            </div>
                            <div className="linked-crew">
                            </div>
                            <div className="no-of-ship-spares">
                            </div>
                            <div className="sr-status">
                            </div>
                            <div className="rating"></div>
                            <div className="service-status"></div>
                            <div className="start-date-time"></div>
                            <div className="end-date-time"></div>
                            <div className="completed-date-time"></div>
                            <div className="remarks"></div>
                        </div>)}
                    </div>
                    ):<div className="no-details"> No items available</div>}
                </div>
            </div>
     <div>
     <Dialog
        open={this.state.openDialog}
        onClose={this.handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
              {this.state.modalInfo.messageText}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>this.handleClose('Cancel')} className="modal-btn">
            Cancel
          </Button>
          <Button onClick={()=>this.handleClose('Okay')} autoFocus className="modal-btn">
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </div>
      </div>
    );
  }
}

export default DataGridComponent;