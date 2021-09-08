export interface IJOBPostRequestPayload {
        RequestedBy: IRequestedByModel[],
        OperationalProcessCode: string,
        OperationalProcessName: string,
        JobServiceAndChargeId: number,
        JobOperationalProcessFk: string,
        Code: string,
        Name: string,
        IsCharge: boolean,
        ParentFk:  number,
        EstimatedUomCode: string,
        EstimatedUomName: string,
        EstimatedQuantity: number,
        EstimatedUnitCost: number,
        CostCurrencyCode: string,
        CostCurrencyName: string,
        CostCurrencyExchangeRate: number,
        IsActive: boolean,
        isCharge: boolean,
        SupplierCode: string,
        SupplierName: string,
        StatusCode: string,
        StatusName: string,
        ActualTotalCost: string,
        TaxTypeCode: string,
        TaxTypeName: string,
        TaxRate: number,
        serviceDropDownList:IServicesDropDownModel[];
        supplierIdentifiers:any;
        charges: ICharges[];
        jobPartiesList: IJobPartiesModel[];
        companyCode: string;
        showContent: boolean;
        modeOfGrid: string;
        isNewService: boolean;
        currencyList: ICurrencyList;
        ServiceRequestNo: string;
        serviceRequestLink:string;
        StartTime:string;
        EndTime:string;
        CompletedTime:string;
        Remarks:string;
};

export interface ICurrencyList{
        options: any[];
        getOptionLabel: any;
        defaultValue?:any;
}

export interface IRequestedByModel{
        code: string;
        name: string;
        legalName: string;
        operationalProcessPartyId: string;
}

export interface ICharges{
    JobServiceAndChargeId:    number;
    JobOperationalProcessFk:  string;
    OperationalProcessName:   string;
    OperationalProcessCode:   string;
    IsCharge:                 boolean;
    ParentFk:                 number;
    Code:                     string;
    Name:                     string;
    SupplierCode:             string;
    SupplierName:             string;
    EstimatedQuantity:        number;
    EstimatedUomCode:         string;
    EstimatedUomName:         string;
    EstimatedUnitCost:        number;
    CostCurrencyCode:         string;
    CostCurrencyName:         string;
    CostCurrencyExchangeRate: number;
    EstimatedTotalCost:       number;
    TaxTypeCode:              string;
    TaxTypeName:              string;
    TaxRate:                  number;
    TaxAmount:                number;
    EstimatedTotalCostIncTax: number;
    ActualTotalCost:          number;
    ActualTaxAmount:          number;
    ActualCostLocal:          string;
    CostVariance:             number;
    ServiceRequestNo:         string;
    StartTime:                null;
    EndTime:                  null;
    CompletedTime:            null;
    StatusCode:               string;
    StatusName:               string;
    Rating:                   null;
    ServiceStatus:            string;
    Remarks:                  string;
    CreatedBy:                string;
    CreatedAt:                Date;
    ModifiedBy:               string;
    ModifiedAt:               Date;
    IsCostDistributed:        null;
    CostSummaryStatus:        string;
    CostSummaryVersion:       string;
    QuotationNumber:          string;
    IsActive:                 boolean;
    isCharge: boolean;
    servicesList: IChargesServiceList[];
    taxTypesList: ITaxTypes[];
    Quantity: number;
    UnitCost: number;
}

export interface ITaxTypes {
        TaxId:              string;
        CompanyFk:          number;
        Name:               string;
        Percentage:         number;
        Label:              string;
        Remarks:            string;
        DolphinServiceCode: string;
        DolphinAccountCode: string;
        Code:               string;
        DolphinTaxTypeCode: string;
        TaxCategory:        string;
        IGST:               number;
        CGST:               number;
        SGST:               number;
        MasterTaxTypeId:    number;
        CreatedAt:          Date;
        CreatedBy:          string;
        ModifiedBy:         string;
        IsActive:           boolean;
    }

export interface IChargesServiceList {
        code: string;
        name: string;
}

export interface IJobPartiesModel {
        remarks: string;
        isBillingParty: boolean;
        partyTypeCode: string;
        isActive: boolean;
        addressFk: number;
        code: string;
        emailAddress: string;
        phone: string;
        country: string;
        city: string;
        postalAddress: string;
        commonName: string;
        legalName: string;
        partyType: string;
        jobOperationalProcessFk: string;
        operationalProcessPartyId: number;
}

export interface IOperationalProcessResponse {
        JobOperationalProcessId: string,
        IsActive: boolean,
        JobFk: number,
        ProcessReferenceNumber: string,
        OperationalProcessCode: string,
        OperationalProcessName: string,
        CompanyCode: string,
}

export interface IServicesDropDownModel {
        name: string,
        code: string,
        isActive: number,
        svsCategories: string
}

export interface ISupplierIdentifiers {
        code: string,
        name: string
}
