import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getPricebookStd from '@salesforce/apex/PriceBookController.getStandardPricebook';
import getById from '@salesforce/apex/PriceBookController.getPricebookById';
import getPricebookEntriesStd from '@salesforce/apex/PriceBookController.getStandardPricebookEntries';
import pricebookDeactivate from '@salesforce/apex/PriceBookController.deactivatePricebook';
import pricebookEdit from '@salesforce/apex/PriceBookController.updatePriceBook';

export default class PriceBookDetails extends LightningElement {
    
    @api currentId;
    @api currentName;
    @api currentProdType;
    @api currentStartDate;
    @api currentEndDate;
    @api currentIsActive = 'true';
    pricebook;

    @track currentNameEdit;
    @track currentStartDateEdit;
    @track currentEndDateEdit;

    @track error;
    @track showEditModal = false;
    @track displayDates = true;

    get disableDeactivate() {
        let flag = true;
        if(this.currentIsActive == 'false') {
            flag = true;
        } else if(this.currentIsActive == 'true') {
            flag = false;
        }
        return flag;
    }

    renderedCallback() {
        console.log(this.currentIsActive);
    }

    connectedCallback() {
        getPricebookStd()
            .then(result => {
                let data = JSON.parse(result);
                this.currentId = data.id;
                this.currentName = data.name;
                this.currentProdType = 'standard';
                this.currentStartDate = 'undefined';
                this.currentEndDate = 'undefined';
                this.currentIsActive = data.isActive;
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

    renderedCallback() {
        if(this.currentId == '01s7S000002VqAzQAK') {
            this.currentProdType = 'standard';
            this.currentStartDate = 'undefined';
            this.currentEndDate = 'undefined';
        }
    }

    displayEditModal() {
        this.currentNameEdit = this.currentName;
        this.currentStartDateEdit = this.currentStartDate;
        this.currentEndDateEdit = this.currentEndDate;
        this.showEditModal = true;
    }

    handleCancel() {
        this.showEditModal = false;
    }

    handleEditPricebookNameChange(event) {
        this.currentNameEdit = event.target.value;
    }

    handleEditPricebookStartDateChange(event) {
        this.currentStartDateEdit = event.target.value;
    }

    handleEditPricebookEndDateChange(event) {
        this.currentEndDateEdit = event.target.value;
    }

    handleEdit() {
        if(this.currentEndDateEdit > this.currentStartDateEdit) {
            pricebookEdit({
                id: this.currentId, 
                name: this.currentNameEdit, 
                startDate: this.currentStartDateEdit, 
                endDate: this.currentEndDateEdit
            })
                .then(result => {
                    let data = JSON.parse(result);
                    if(data.message == '') {
                        this.dispatchEvent(
                            new CustomEvent('pricebookedit')
                        );
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Success',
                                message: 'Price Book updated successfully',
                                variant: 'success'
                            })
                        );
                        this.showEditModal = false;
                        this.currentName = this.currentNameEdit;
                        this.currentStartDate = this.currentStartDateEdit;
                        this.currentEndDate = this.currentEndDateEdit;
                    } else if(data.message != '') {
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Error',
                                message: data.message,
                                variant: 'error'
                            })
                        );
                    }
                    
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
        } else {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'End date should be after start date',
                    variant: 'error'
                })
            );
        }       
    }

    handleDeactivation() {
        pricebookDeactivate({id: this.currentId})
            .then(result => {
                this.currentIsActive = false;
                let d = new Date();
                this.currentEndDate = d.toISOString().slice(0,10);
                this.dispatchEvent(
                    new CustomEvent('pricebookedit2')
                );
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Price Book deactivated successfully',
                        variant: 'success'
                    })
                );
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
}