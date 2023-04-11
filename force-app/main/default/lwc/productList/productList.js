import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getStdEntries from '@salesforce/apex/PriceBookController.getStandardPricebookEntries';
import getPricebookEntries from '@salesforce/apex/PriceBookController.getEntriesFromPriceBook';
import searchPricebookEntries from '@salesforce/apex/PriceBookController.searchEntriesFromPriceBook';
import entryCreate from '@salesforce/apex/PriceBookController.createEntry';
import singleUpdate from '@salesforce/apex/PriceBookController.updateSingleEntry';
import allUpdate from '@salesforce/apex/PriceBookController.updateAllEntries';
import selectedUpdate from '@salesforce/apex/PriceBookController.updateSelectedEntries';
import singleUpdateUp from '@salesforce/apex/PriceBookController.updateSingleEntryUp';
import allUpdateUp from '@salesforce/apex/PriceBookController.updateAllEntriesUp';
import selectedUpdateUp from '@salesforce/apex/PriceBookController.updateSelectedEntriesUp';
import apartmentsGet from '@salesforce/apex/PriceBookController.getApartments';
import premisesGet from '@salesforce/apex/PriceBookController.getPremises';
import minPrice from '@salesforce/apex/PriceBookController.getMinimalPrice';
import allProdGet from '@salesforce/apex/PriceBookController.getAllProducts';
import entryDelete from '@salesforce/apex/PriceBookController.deletePriceBookEntry';
import entryDeleteAll from '@salesforce/apex/PriceBookController.deleteAllPriceBookEntries';
import noImgUrl from '@salesforce/label/c.NoImageUrl';
import baseUrl from '@salesforce/label/c.BaseUrl';
import strPricebookId from '@salesforce/label/c.StdPricebookId';

export default class ProductList extends LightningElement {
    
    @api currentPricebookId;
    @api currentPricebookType;
    @track products = [];
    @track newProducts = [];
    @track error;
    @track productSearch;
    @track showModal = false;
    @track showSingleModal = false;
    @track showAllModal = false;
    @track showSingleModalUp = false;
    @track showAllModalUp = false;
    @track showDeleteModal = false;
    @track showDeleteAllModal = false;
    @track newProductName;
    @track newProductPrice;
    @track currentEntryId;
    @track currentDiscountType;
    @track currentDiscount;
    @track currentPrice;
    @track allDiscountType;
    @track allDiscount;
    @track correctDiscount = true;
    @track minimal;
    @track idList = [];
    @track priceList = [];
    @track currentIncrease;
    @track allIncrease;

    get deleteAllDisabled() {
        let flag = false;
        if(this.products.length == 0) {
            flag = true;
        } else if(this.products.length != 0) {
            flag = false;
        }
        return flag;
    }

    get updateAllDisabled() {
        let flag = false;
        if(this.products.length == 0 || !this.checkIfAnySelected()) {
            flag = true;
        } else if(this.products.length != 0 && this.checkIfAnySelected()) {
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

    get addProductDisabled() {
        let flag = false;
        if(this.newProducts.length == 0) {
            flag = true;
        } else if(this.newProducts.length != 0) {
            flag = false;
        }
        return flag;
    }

    connectedCallback() {
        getStdEntries()
            .then(result => {
                this.products = JSON.parse(result);
                for(const item of this.products) {
                    item.price = parseFloat(item.price);
                    if(item.displayUrl == null) {
                        item.displayUrl = noImgUrl;
                    }
                }
            })
            .catch(error => {
                this.error = error;
                // this.dispatchEvent(
                //     new ShowToastEvent({
                //         title: 'Error',
                //         message: this.error,
                //         variant: 'error'
                //     })
                // );
            })
    }

    @api
    getPBEntries() {
        getPricebookEntries({id: this.currentPricebookId})
            .then(result => {
                this.products = JSON.parse(result);
                for(const item of this.products) {
                    item.price = parseFloat(item.price);
                    if(item.displayUrl == null) {
                        item.displayUrl = noImgUrl;
                    }
                }
            })
            .catch(error => {
                this.error = error;
                // this.dispatchEvent(
                //     new ShowToastEvent({
                //         title: 'Error',
                //         message: this.error,
                //         variant: 'error'
                //     })
                // );
            })
    }

    @api
    getNewProducts() {
        if(this.currentPricebookId == strPricebookId) {
            allProdGet({pricebookId: this.currentPricebookId})
                .then(result => {
                    this.newProducts = JSON.parse(result);
                })
                .catch(error => {
                    this.error = error;
                    // this.dispatchEvent(
                    //     new ShowToastEvent({
                    //         title: 'Error',
                    //         message: this.error,
                    //         variant: 'error'
                    //     })
                    // );
                })
        } else {
            if(this.currentPricebookType == 'Business Premises') {
                premisesGet({pricebookId: this.currentPricebookId})
                    .then(result => {
                        this.newProducts = JSON.parse(result);
                    })
                    .catch(error => {
                        this.error = error;
                        // this.dispatchEvent(
                        //     new ShowToastEvent({
                        //         title: 'Error',
                        //         message: this.error,
                        //         variant: 'error'
                        //     })
                        // );
                    })
            } else if(this.currentPricebookType == 'Apartments') {
                apartmentsGet({pricebookId: this.currentPricebookId})
                    .then(result => {
                        this.newProducts = JSON.parse(result);
                    })
                    .catch(error => {
                        this.error = error;
                        // this.dispatchEvent(
                        //     new ShowToastEvent({
                        //         title: 'Error',
                        //         message: this.error,
                        //         variant: 'error'
                        //     })
                        // );
                    })
            }
        }       
    }

    renderedCallback() {
        if(this.currentPricebookId == null) {
            this.currentPricebookId = strPricebookId;
        }
        this.getPBEntries();
        this.getNewProducts(); 
        searchPricebookEntries({id: this.currentPricebookId, name: this.productSearch})
            .then(result => {
                this.products = JSON.parse(result);
                for(const item of this.products) {
                    item.price = parseFloat(item.price);
                    if(item.displayUrl == null) {
                        item.displayUrl = noImgUrl;
                    }
                }
            })
            .catch(error => {
                this.error = error;
                // this.dispatchEvent(
                //     new ShowToastEvent({
                //         title: 'Error',
                //         message: this.error,
                //         variant: 'error'
                //     })
                // );
            })
    }

    handleSearchProducts(event) {
        this.productSearch = event.target.value;
        searchPricebookEntries({id: this.currentPricebookId, name: this.productSearch})
            .then(result => {
                this.products = JSON.parse(result);
                for(const item of this.products) {
                    item.price = parseFloat(item.price);
                    if(item.displayUrl == null) {
                        item.displayUrl = noImgUrl;
                    }
                }
            })
            .catch(error => {
                this.error = error;
                // this.dispatchEvent(
                //     new ShowToastEvent({
                //         title: 'Error',
                //         message: this.error,
                //         variant: 'error'
                //     })
                // );
            })
    }

    goToProduct(event) {
        window.open(baseUrl + event.target.dataset.productId, '_blank').focus();
    }

    displayModal() {
        this.showModal = true;
    }

    displaySingleModal(event) {
        this.showSingleModal = true;
        this.currentEntryId = event.target.dataset.productId;
        this.currentDiscount = event.target.dataset.discount;
        this.currentDiscountType = event.target.dataset.discountType;
        this.currentPrice = parseFloat(event.target.dataset.price);
    }

    displayAllModal() {
        this.showAllModal = true;
    }

    displaySingleModalUp(event) {
        this.showSingleModalUp = true;
        this.currentEntryId = event.target.dataset.productId;
        this.currentDiscount = event.target.dataset.discount;
        this.currentDiscountType = event.target.dataset.discountType;
        this.currentPrice = parseFloat(event.target.dataset.price);
    }

    displayAllModalUp() {
        this.showAllModalUp = true;
    }

    handleCancel() {
        this.showModal = false;
        this.showSingleModal = false;
        this.showAllModal = false;
        this.showSingleModalUp = false;
        this.showAllModalUp = false;
        this.showDeleteModal = false;
        this.showDeleteAllModal = false;
        this.allDiscount = null;
        this.allDiscountType = null;
    }

    handleCurrentIncreaseChange(event) {
        this.currentIncrease = event.target.value;
        if(this.currentIncrease < 0) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Value cannot be lower than 0',
                    variant: 'error'
                })
            );
            this.correctDiscount = false;
        } else {
            this.correctDiscount = true;
        }
    }

    handleAllIncreaseChange(event) {
        this.allIncrease = event.target.value;
        if(this.allIncrease < 0) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Value cannot be lower than 0',
                    variant: 'error'
                })
            );
            this.correctDiscount = false;
        } else {
            this.correctDiscount = true;
        }
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
        if(this.allDiscountType == 'Percentage') {
            if(this.allDiscount < 0) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Discount percentage cannot be lower than 0',
                        variant: 'error'
                    })
                );
                this.correctDiscount = false;
            } else if(this.allDiscount > 99.9) {
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
        } else if(this.allDiscountType == 'Amount') {
            if(this.allDiscount < 0) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Discount amount cannot be lower than 0',
                        variant: 'error'
                    })
                );
                this.correctDiscount = false;
            } else if(this.allDiscount > this.minimal) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Discount amount cannot be higher than minimal price in current price book',
                        variant: 'error'
                    })
                );
                this.correctDiscount = false;
            } else {
                this.correctDiscount = true;
            }
        }
    }

    handleAddProduct() {
        if(this.newProductName == null || this.newProductPrice == null) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Product name and price cannot be empty',
                    variant: 'error'
                })
            );
        } else {
            entryCreate({productId: this.newProductName, pricebookId: this.currentPricebookId, price: this.newProductPrice})
            .then(result => {
                this.showModal = false;
                this.getPBEntries();              
                this.getNewProducts();
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Product added successfully',
                        variant: 'success'
                    })
                );
                this.newProductName = null;
                this.newProductPrice = null;
            })
        }
    }

    handleSingleEdit() {
        if(this.correctDiscount == true) {
            singleUpdate({id: this.currentEntryId, discountType: this.currentDiscountType, discount: this.currentDiscount, price: this.currentPrice})
                .then(result => {
                    this.minimal = null;
                    this.showSingleModal = false;
                    this.getPBEntries();
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Price updated successfully',
                            variant: 'success'
                        })
                    );
                })
            this.deselectAll();
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

    handleSingleEditUp() {
        if(this.currentIncrease != null && this.currentIncrease != undefined) {
            if(this.correctDiscount == true) {
                singleUpdateUp({id: this.currentEntryId, discountType: this.currentDiscountType, discount: this.currentIncrease})
                    .then(result => {
                        this.minimal = null;
                        this.showSingleModalUp = false;
                        this.getPBEntries();
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Success',
                                message: 'Price updated successfully',
                                variant: 'success'
                            })
                        );
                        this.currentIncrease = null;
                    })
                this.deselectAll();
            } else if(this.correctDiscount == false) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Invalid increase value',
                        variant: 'error'
                    })
                );
            } 
        } else if(this.currentIncrease == null || this.currentIncrease == undefined) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Increase value cannot be empty',
                    variant: 'error'
                })
            );
        }
    }

    handleAllEdit() {
        let box = this.template.querySelector('[data-id="selAll"]');
        if(this.allDiscountType == null || this.allDiscount == null) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Discount and discount type cannot be empty',
                    variant: 'error'
                })
            );
        } else {
            if(this.correctDiscount == true) {
                if(this.checkIfAnySelected()) {
                    if(box.checked) {
                        allUpdate({pricebookId: this.currentPricebookId, discountType: this.allDiscountType, discount: this.allDiscount})
                            .then(result => {
                                this.deselectAll();
                                this.minimal = null;
                                this.showAllModal = false;
                                this.getPBEntries();
                                this.dispatchEvent(
                                    new ShowToastEvent({
                                        title: 'Success',
                                        message: 'Prices updated successfully',
                                        variant: 'success'
                                    })
                                );
                                this.allDiscount = null;
                                this.allDiscountType = null;
                            })
                    } else {
                        selectedUpdate({ids: this.idList, discountType: this.allDiscountType, discount: this.allDiscount})
                            .then(result => {
                                this.deselectAll();
                                this.minimal = null;
                                this.showAllModal = false;
                                this.getPBEntries();
                                this.dispatchEvent(
                                    new ShowToastEvent({
                                        title: 'Success',
                                        message: 'Prices updated successfully',
                                        variant: 'success'
                                    })
                                );
                                this.allDiscount = null;
                                this.allDiscountType = null;
                            })
                    }
                } else {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: 'Select any product first',
                            variant: 'error'
                        })
                    ); 
                }
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
    }

    handleAllEditUp() {
        let box = this.template.querySelector('[data-id="selAll"]');
        if(this.allDiscountType == null || this.allIncrease == null) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Increase and increase type cannot be empty',
                    variant: 'error'
                })
            );
        } else {
            if(this.correctDiscount == true) {
                if(this.checkIfAnySelected()) {
                    if(box.checked) {
                        allUpdateUp({pricebookId: this.currentPricebookId, discountType: this.allDiscountType, discount: this.allIncrease})
                            .then(result => {
                                this.deselectAll();
                                this.minimal = null;
                                this.showAllModalUp = false;
                                this.getPBEntries();
                                this.dispatchEvent(
                                    new ShowToastEvent({
                                        title: 'Success',
                                        message: 'Prices updated successfully',
                                        variant: 'success'
                                    })
                                );
                                this.allIncrease = null;
                                this.allDiscountType = null;
                            })
                    } else {
                        selectedUpdateUp({ids: this.idList, discountType: this.allDiscountType, discount: this.allIncrease})
                            .then(result => {
                                this.deselectAll();
                                this.minimal = null;
                                this.showAllModalUp = false;
                                this.getPBEntries();
                                this.dispatchEvent(
                                    new ShowToastEvent({
                                        title: 'Success',
                                        message: 'Prices updated successfully',
                                        variant: 'success'
                                    })
                                );
                                this.allIncrease = null;
                                this.allDiscountType = null;
                            })
                    }
                } else {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: 'Select any product first',
                            variant: 'error'
                        })
                    ); 
                }
            } else if(this.correctDiscount == false) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Invalid increase value',
                        variant: 'error'
                    })
                );
            }
        }         
    }

    deselectAll() {
        let box = this.template.querySelector('[data-id="selAll"]');
        box.checked = false;
        const checkboxList = this.template.querySelectorAll('[data-id^="01u"]');
        for(const element of checkboxList) {
            element.checked = false;
        }
    }

    checkIfAnySelected() {
        const checkboxList = this.template.querySelectorAll('[data-id^="01u"]');
        for(const element of checkboxList) {
            if(element.checked == true) {
                return true;
            }
        }
        return false;
    }

    async handleSelectAll() {
        await minPrice({id: this.currentPricebookId})
            .then(result => {
                let data = JSON.parse(result);
                this.minimal = parseFloat(data.message);
            })
            .catch(error => {
                this.error = error;
                // this.dispatchEvent(
                //     new ShowToastEvent({
                //         title: 'Error',
                //         message: this.error,
                //         variant: 'error'
                //     })
                // );
            })
        let box = this.template.querySelector('[data-id="selAll"]');
        const checkboxList = this.template.querySelectorAll('[data-id^="01u"]');
        if(box.checked) {
            for(const element of checkboxList) {
                element.checked = true;
            }
            minPrice({id: this.currentPricebookId})
                .then(result => {
                    let data = JSON.parse(result);
                    this.minimal = parseFloat(data.message);
                })
                .catch(error => {
                    this.error = error;
                    // this.dispatchEvent(
                    //     new ShowToastEvent({
                    //         title: 'Error',
                    //         message: this.error,
                    //         variant: 'error'
                    //     })
                    // );
                })
        } else {
            for(const element of checkboxList) {
                element.checked = false;
            }
            this.minimal = 0.0;
        }
    }

    handleSelectId(event) {
        let id = event.target.dataset.id;
        let price = event.target.dataset.price;
        let box = this.template.querySelector('[data-id="' + id +'"]');
        if(box.checked) {
            this.idList.push(id);
            this.priceList.push(price);
        } else {
            const idIndex = this.idList.indexOf(id);
            const priceIndex = this.priceList.indexOf(price);
            if(idIndex > -1) {
                this.idList.splice(idIndex, 1);
            }
            if(priceIndex > -1) {
                this.priceList.splice(priceIndex, 1);
            }          
        } 
        this.minimal = parseFloat(this.findMin(this.priceList));
    }

    findMin(arr) {
        let min = Infinity;
        for(let i = 0; i < arr.length; i++) {
            let num = arr[i];
            num = parseFloat(num);
            if(num < min) {
                min = num;
            }
        }
        return min;
    }

    displayDeleteModal(event) {
        this.showDeleteModal = true;
        this.currentEntryId = event.target.dataset.productId;
    }

    displayDeleteAllModal() {
        this.showDeleteAllModal = true;
    }

    handleEntryDeleteAll() {
        entryDeleteAll({pricebookId: this.currentPricebookId})
            .then(result => {
                this.showDeleteAllModal = false;
                this.getPBEntries();
                this.getNewProducts();
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'All Price Book Entries deleted successfully',
                        variant: 'success'
                    })
                );
            })
    }

    handleEntryDelete() {
        entryDelete({id: this.currentEntryId})
            .then(result => {
                this.showDeleteModal = false;
                this.getPBEntries();
                this.getNewProducts();
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Price Book Entry deleted successfully',
                        variant: 'success'
                    })
                );
            })
    }

    handleSelect(event) {
        let selectedVal = event.detail.value;
        if(selectedVal === 'Discount') {
            this.showSingleModal = true;
            this.currentEntryId = event.target.dataset.productId;
            this.currentDiscount = event.target.dataset.discount;
            this.currentDiscountType = event.target.dataset.discountType;
            this.currentPrice = parseFloat(event.target.dataset.price);
        } else if(selectedVal === 'Increase') {
            this.showSingleModalUp = true;
            this.currentEntryId = event.target.dataset.productId;
            this.currentDiscount = event.target.dataset.discount;
            this.currentDiscountType = event.target.dataset.discountType;
            this.currentPrice = parseFloat(event.target.dataset.price);
        } else if(selectedVal === 'Delete') {
            this.showDeleteModal = true;
            this.currentEntryId = event.target.dataset.productId;
        }
    }
}