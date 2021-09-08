export const TABLE_MASTER_DATA = [
    {headerTitle:'#',className:'serial-number'},
    {headerTitle:'',className:'delete-icon'},
    {headerTitle:'',className:'toggle-icon'},
    {headerTitle:'',className:'edit-icon'},
    {headerTitle:'Operational Process',className:'operational-process'},
    {headerTitle:'Service/Charge Name',className:'charge-name'},
    {headerTitle:'Requested By',className:'requested-by'},
    {headerTitle:'Supplier',className:'supplier'},
    {headerTitle:'Quantity',className:'quantity'},
    {headerTitle:'UOM',className:'uom'},
    {headerTitle:'Unit Cost',className:'unit-cost'},
    {headerTitle:'Cost Currency',className:'cost-currency'},
    {headerTitle:'Exchange Rate',className:'cost-currency'},
    {headerTitle:'Est. Total Cost',className:'est-total-cost'},
    {headerTitle:'Tax Type',className:'tax-type'},
    {headerTitle:'Tax Rate',className:'tax-rate'},
    {headerTitle:'Tax Amount',className:'tax-amount'},
    {headerTitle:'Est. Total Cost(incl. Tax)',className:'inclusive-tax'},
    {headerTitle:'Actual Cost',className:'actual-cost'},
    {headerTitle:'Cost Variance',className:'cost-variance'},
    {headerTitle:'Service Request#',className:'service-request'},
    {headerTitle:'Linked Crew',className:'linked-crew'},
    {headerTitle:'No. Of Ship Spares',className:'no-of-ship-spares'},
    {headerTitle:'SR Status',className:'sr-status'},
    {headerTitle:'Rating',className:'rating'},
    {headerTitle:'Service Status',className:'service-status'},
    {headerTitle:'Start Date/Time',className:'start-date-time'},
    {headerTitle:'End Date/Time',className:'end-date-time'},
    {headerTitle:'Completed Date/Time',className:'completed-date-time'},
    {headerTitle:'Remarks',className:'remarks'}
];
export const API_DOMAIN_URL = 'https://dev-pegasus.gac.com/suite/webapi';
export const DATA_GRID_URLS = {
    OPERATIONAL_PROCESS :'/jobService-getAllOpProcessByJobId',
    SERVICES: '/getOPsAndSVs',
    UOM:'/jobService-getMdmUomPicker',
    CURRENCY:'/jobService-getMdmCurrencyPicker',
    TAX_TYPE:'/jobService-getAllTaxDetailsByCompanyCode',
    SUPPLIER:'/jobService-getSupplierBySearchText',
    JOB_PARTIES: '/jobService-getAllPartiesByOpId',
    CHARGES: '/getCharges',
    EXCHANGERATE: '/oum-get-exchange-rates',
    JOB_SERVICES: '/jobService-getAllJobServiceV3',
    SAVE_JOB: '/jobService-saveServiceAndCharge'
}
export const API_REQ_HEADERS =  { 
   'Appian-API-Key': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJjMmVmOTYwNi0xNGFlLTQ5NDMtOTQyNy0xMDVmN2RlZmZmYzAifQ.tV_aC4B-Nbkp_5Oquq3o9RAgri75ir5kW75nyl5bYNU',
   'My-Custom-Header': 'foobar'
};