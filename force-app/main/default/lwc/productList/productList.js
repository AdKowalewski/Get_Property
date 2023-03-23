import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getStdEntries from '@salesforce/apex/PriceBookController.getStandardPricebookEntries';
import getPricebookEntries from '@salesforce/apex/PriceBookController.getEntriesFromPriceBook';
import searchPricebookEntries from '@salesforce/apex/PriceBookController.searchEntriesFromPriceBook';
import entryCreate from '@salesforce/apex/PriceBookController.createEntry';
import singleUpdate from '@salesforce/apex/PriceBookController.updateSingleEntry';
import allUpdate from '@salesforce/apex/PriceBookController.updateAllEntries';
import apartmentsGet from '@salesforce/apex/PriceBookController.getApartments';
import premisesGet from '@salesforce/apex/PriceBookController.getPremises';

export default class ProductList extends LightningElement {
    
    @api currentPricebookId;
    @api currentPricebookType;
    @track products = [];
    @track newProducts;
    @track error;
    @track productSearch;
    @track showModal = false;
    @track showSingleModal = false;
    @track showAllModal = false;
    @track newProductName;
    @track newProductPrice;
    @track currentEntryId;
    @track currentDiscountType;
    @track currentDiscount;
    @track currentPrice;
    @track allDiscountType;
    @track allDiscount;
    @track correctDiscount = true;

    get updateAllDisabled() {
        let flag = false;
        if(this.products.length == 0) {
            flag = true;
        } else if(this.products.length != 0) {
            flag = false;
        }
        return flag;
    }

    get displayTable() {
        let flag = false;
        if(this.products.length == 0) {
            flag = false;
        } else if(this.products.length != 0) {
            flag = true;
        }
        return flag;
    }

    get discountTypes() {
        return [
            { value: 'Percentage', label: 'Percentage' },
            { value: 'Amount', label: 'Amount' }
        ];
    }

    get newProductNames() {
        let newProds = [];
        for(let i = 0; i < this.newProducts.length; i++) {
            newProds.push(
                { value: this.newProducts[i].id, label: this.newProducts[i].name}
            );
        }
        return newProds;
    }

    connectedCallback() {
        getStdEntries()
            .then(result => {
                this.products = JSON.parse(result);
                console.log('products ' + this.products);
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

    @api
    getPBEntries() {
        getPricebookEntries({id: this.currentPricebookId})
            .then(result => {
                this.products = JSON.parse(result);
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

    @api
    getNewProducts() {
        if(this.currentPricebookType == 'Business Premises') {
            premisesGet()
                .then(result => {
                    this.newProducts = JSON.parse(result);
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
        } else if(this.currentPricebookType == 'Apartments') {
            apartmentsGet()
                .then(result => {
                    this.newProducts = JSON.parse(result);
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

    handleSearchProducts(event) {
        this.productSearch = event.target.value;
        searchPricebookEntries({id: this.currentPricebookId, name: this.productSearch})
            .then(result => {
                this.products = JSON.parse(result);
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

    goToProduct(event) {
        window.open('https://britenet-10a-dev-ed.develop.lightning.force.com/' + event.target.dataset.productId, '_blank').focus();
    }

    displayModal() {
        this.showModal = true;
    }

    displaySingleModal(event) {
        this.showSingleModal = true;
        this.currentEntryId = event.target.dataset.productId;
        this.currentDiscount = event.target.dataset.discount;
        this.currentDiscountType = event.target.dataset.discountType;
        this.currentPrice = event.target.dataset.price;
    }

    displayAllModal() {
        this.showAllModal = true;
    }

    handleCancel() {
        this.showModal = false;
        this.showSingleModal = false;
        this.showAllModal = false;
    }

    handleNewProductNameChange(event) {
        this.newProductName = event.target.value;
    }

    handleNewProductPriceChange(event) {
        this.newProductPrice = event.target.value;
    }

    handleCurrentPriceChange(event) {
        this.currentPrice = event.target.value;
    }

    handleCurrentDiscountTypeChange(event) {
        this.currentDiscountType = event.target.value;
    }

    handleCurrentDiscountChange(event) {
        this.currentDiscount = event.target.value;
        if(this.currentDiscountType == 'Percentage') {
            if(this.currentDiscount < 0) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Discount percentage cannot be lower than 0',
                        variant: 'error'
                    })
                );
                this.correctDiscount = false;
            } else if(this.currentDiscount > 99.9) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Discount percentage cannot be higher than 99.9',
                        variant: 'error'
                    })
                );
                this.correctDiscount = false;
            } else {
                this.correctDiscount = true;
            }
        } else if(this.currentDiscountType == 'Amount') {
            if(this.currentDiscount < 0) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Discount amount cannot be lower than 0',
                        variant: 'error'
                    })
                );
                this.correctDiscount = false;
            } else if(this.currentDiscount > this.currentPrice) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Discount amount cannot be higher than current product price',
                        variant: 'error'
                    })
                );
                this.correctDiscount = false;
            } else {
                this.correctDiscount = true;
            }
        }
    }

    handleAllDiscountTypeChange(event) {
        this.allDiscountType = event.target.value;
    }

    handleAllDiscountChange(event) {
        this.allDiscount = event.target.value;
    }

    handleAddProduct() {
        entryCreate({productId: this.newProductName, pricebookId: this.currentPricebookId, price: this.newProductPrice})
            .then(result => {
                this.showModal = false;
                getPricebookEntries({id: this.currentPricebookId})
                    .then(result => {
                        this.products = JSON.parse(result);
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
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Product added successfully',
                        variant: 'success'
                    })
                );
            })
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
    }

    handleSingleEdit() {
        if(this.correctDiscount == true) {
            singleUpdate({id: this.currentEntryId, discountType: this.currentDiscountType, discount: this.currentDiscount, price: this.currentPrice})
            .then(result => {
                this.showSingleModal = false;
                getPricebookEntries({id: this.currentPricebookId})
                    .then(result => {
                        this.products = JSON.parse(result);
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
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Price updated successfully',
                        variant: 'success'
                    })
                );
            })
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
        } else if(this.correctDiscount == false) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Invalid discount value',
                    variant: 'error'
                })
            );
        } 
    }

    handleAllEdit() {
        allUpdate({pricebookId: this.currentPricebookId, discountType: this.allDiscountType, discount: this.allDiscount})
            .then(result => {
                this.showAllModal = false;
                getPricebookEntries({id: this.currentPricebookId})
                    .then(result => {
                        this.products = JSON.parse(result);
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
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Prices updated successfully',
                        variant: 'success'
                    })
                );
            })
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
    }
}