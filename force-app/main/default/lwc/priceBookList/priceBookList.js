import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import pricebooksInit from '@salesforce/apex/PriceBookController.initPriceBooks';
import pricebooksSearch from '@salesforce/apex/PriceBookController.searchPriceBooks';
import pricebookCreate from '@salesforce/apex/PriceBookController.createPriceBook';

export default class PriceBookList extends LightningElement {
    
    @track pricebooks;
    @track error = null;
    @track pricebookSearch;
    @track showCreateModal = false;
    @track newPricebookName;
    @track newPricebookStartDate;
    @track newPricebookEndDate;
    @track newPricebookProductType = 'Business Premises';
    @api isUpdate = false;

    get productTypes() {
        return [
            { value: 'Business Premises', label: 'Business Premises' },
            { value: 'Apartments', label: 'Apartments' }
        ];
    }

    connectedCallback() {
        pricebooksInit()
            .then(data => {
                this.pricebooks = JSON.parse(data);
            })
            .catch(error => {
                this.error = error;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: this.error,
                        variant: 'error'
                    })
                );
            })
    }

    handleSearchPricebooks(event) {
        this.pricebookSearch = event.target.value;
        pricebooksSearch({name: this.pricebookSearch})
            .then(result => {              
                this.pricebooks = JSON.parse(result);
                console.log('results: ' + this.pricebooks);
            })
            .catch(error => {
                this.error = error;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: this.error,
                        variant: 'error'
                    })
                );
            })
    }

    displayCreateModal() {
        this.showCreateModal = true;
    }

    handleCancel() {
        this.showCreateModal = false;
    }

    handleNewPricebookNameChange(event) {
        this.newPricebookName = event.target.value;
    }

    handleNewPricebookStartDateChange(event) {
        this.newPricebookStartDate = event.target.value;
    }

    handleNewPricebookEndDateChange(event) {
        this.newPricebookEndDate = event.target.value;
    }

    handleNewPricebookProductTypeChange(event) {
        this.newPricebookProductType = event.target.value;
    }

    handleInsert() {
        pricebookCreate({
            name: this.newPricebookName, 
            startDate: this.newPricebookStartDate, 
            endDate: this.newPricebookEndDate, 
            productType: this.newPricebookProductType})
            .then(result => {
                this.pricebookSearch = '';
                this.showCreateModal = false;
                pricebooksInit()
                    .then(data => {
                        this.pricebooks = JSON.parse(data);
                    })
                    .catch(error => {
                        this.error = error;
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Error',
                                message: this.error,
                                variant: 'error'
                            })
                        );
                    });
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Price Book ' + this.newPricebookName + ' created successfully',
                        variant: 'success'
                    })
                );
                this.newPricebookName = '';
                this.newPricebookStartDate = null;
                this.newPricebookEndDate = null;
                this.newPricebookProductType = null;
            })
            .catch(error => {
                this.error = error;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: this.error,
                        variant: 'error'
                    })
                );
            })
    }

    handleSelectPricebook(event) {
        this.dispatchEvent(
            new CustomEvent('pricebookselect', {
                detail: {
                    id: event.target.dataset.recordId,
                    name: event.target.dataset.name,
                    prodType: event.target.dataset.prodType,
                    startDate: event.target.dataset.startDate,
                    endDate: event.target.dataset.endDate,
                    isActive: event.target.dataset.isActive,
                }
            })
        );
    }
}