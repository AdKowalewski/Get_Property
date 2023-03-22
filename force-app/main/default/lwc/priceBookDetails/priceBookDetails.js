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
    @api currentIsActive;
    pricebook;

    @track error;
    @track showEditModal = false;
    @track displayDates = true;
    @track editedPricebookName;
    @track editedPricebookStartDate;
    @track editedPricebookEndDate;

    connectedCallback() {
        // if(this.currentId == null) {
            getPricebookStd()
                .then(result => {
                    let data = JSON.parse(result);
                    this.currentId = data.id;
                    this.currentName = data.name;
                    this.currentProdType = data.productType;
                    this.currentStartDate = data.startDate;
                    this.currentEndDate = data.endDate;
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
        // } else {
        //     getById({})
        //         .then(result => {
        //             this.pricebook = JSON.parse(result);
        //         })
        //         .catch(error => {
        //             this.error = error;
        //             this.dispatchEvent(
        //                 new ShowToastEvent({
        //                     title: 'Error',
        //                     message: this.error,
        //                     variant: 'error'
        //                 })
        //             );
        //         })
        // }
    }

    displayEditModal() {
        this.editedPricebookName = this.currentName;
        this.editedPricebookStartDate = this.currentStartDate;
        this.editedPricebookEndDate = this.currentEndDate;
        this.showEditModal = true;
    }

    handleCancel() {
        this.showEditModal = false;
    }

    handleEditPricebookNameChange(event) {
        this.editedPricebookName = event.target.value;
    }

    handleEditPricebookStartDateChange(event) {
        this.editedPricebookStartDate = event.target.value;
    }

    handleEditPricebookEndDateChange(event) {
        this.editedPricebookEndDate = event.target.value;
    }

    handleEdit() {
        pricebookEdit({
            id: this.pricebook.id, 
            name: this.editedPricebookName, 
            startDate: this.editedPricebookStartDate, 
            endDate: this.editedPricebookEndDate})
            .then(result => {
                this.showEditModal = false;

                // getById({})
                // .then(result => {
                //     this.pricebook = JSON.parse(result);
                // })
                // .catch(error => {
                //     this.error = error;
                //     this.dispatchEvent(
                //         new ShowToastEvent({
                //             title: 'Error',
                //             message: this.error,
                //             variant: 'error'
                //         })
                //     );
                // })

                // this.dispatchEvent(
                //     new CustomEvent('pricebookedit')
                // );
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Price Book was edited successfully',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
                this.error = error;
                console.log(error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: this.error,
                        variant: 'error'
                    })
                );
            })
    }

    handleDeactivation() {
        pricebookDeactivate()
            .then(result => {
                this.currentIsActive = false;
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