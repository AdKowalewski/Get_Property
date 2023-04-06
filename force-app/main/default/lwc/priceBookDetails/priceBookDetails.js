import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getPricebookStd from '@salesforce/apex/PriceBookController.getStandardPricebook';
import pricebookDeactivate from '@salesforce/apex/PriceBookController.deactivatePricebook';
import pricebookEdit from '@salesforce/apex/PriceBookController.updatePriceBook';
import pricebookDelete from '@salesforce/apex/PriceBookController.deletePriceBook';
import strPricebookId from '@salesforce/label/c.StdPricebookId';

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
    @track showDeleteModal = false;
    @track showDeactivateModal = false;
    @track displayDates = true;

    get disableDeactivate() {
        let flag = false;
        if(this.currentIsActive == 'false' || this.currentId == strPricebookId) {
            flag = true;
        } else if(this.currentIsActive == 'true' && this.currentId != strPricebookId) {
            flag = false;
        }
        return flag;
    }

    connectedCallback() {
        getPricebookStd()
            .then(result => {
                let data = JSON.parse(result);
                this.currentId = data.id;
                this.currentName = data.name;
                this.currentProdType = 'Standard';
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

    displayEditModal() {
        this.currentNameEdit = this.currentName;
        this.currentStartDateEdit = this.currentStartDate;
        this.currentEndDateEdit = this.currentEndDate;
        this.showEditModal = true;
    }

    displayDeactivateModal() {
        this.showDeactivateModal = true;
    }

    handleCancel() {
        this.showEditModal = false;
        this.showDeleteModal = false;
        this.showDeactivateModal = false;
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

    displayDeleteModal() {
        this.showDeleteModal = true;
    }

    handleDelete() {
        pricebookDelete({id: this.currentId})
            .then(result => {       
                let data = JSON.parse(result);
                if(data.message == '') {
                    this.showDeleteModal = false;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Price Book deleted successfully',
                            variant: 'success'
                        })
                    );
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
    }
}