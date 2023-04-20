import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord } from 'lightning/uiRecordApi';
import ID from '@salesforce/user/Id';
import ROLE_NAME_FIELD from '@salesforce/schema/User.UserRole.Name';
import getPremises from '@salesforce/apex/ProductController.getProductPremisesList';
import getApartments from '@salesforce/apex/ProductController.getProductApartmentsList';
import main_url from '@salesforce/label/c.main_url';

export default class ProductExplorer extends LightningElement {

    @track selectedProductId;

    @track error = null;
    @track currentUserRoleName;
    @track isApartments = false;

    @track recordEnd = 0;
    @track recordStart = 0;
    @track pageNumber = 1;
    @track totalRecords = 0;
    @track totalPages = 0;
    @track loading = false;
    @track pagesize = 3;
    @track isPrev = true;
    @track isNext = true;
    @track products = [];
    @track showFilter = false;
    @track maxPrice = 100000;
    @track minSize = 20;

    productName;
    productCity;
    apartmentType;
    laundry;
    balcony;
    livingRoomKitchen;
    wifi;
    parking;
    elevator;
    kitchen;

    label = {
        main_url
    };

    get apartmentTypes() {
        return [
            { value: 'All Types', label: 'All Types' },
            { value: 'For 1 person', label: 'For 1 person' },
            { value: 'For 2 person', label: 'For 2 person' },
            { value: 'For 3 person', label: 'For 3 person' },
            { value: 'For 4 person', label: 'For 4 person' },
            { value: 'For 5 person', label: 'For 5 person' }
        ];
    }

    @wire(getRecord, { recordId: ID, fields: [ROLE_NAME_FIELD]})
    currentUser({error, data}) {
        if(data) {
            this.currentUserRoleName = data.fields.UserRole.value.fields.Name.value;
            if(this.currentUserRoleName.startsWith('Housing')) {
                this.isApartments = true;
            } else {
                this.isApartments = false;
            }
        } else if(error) {
            this.error = error.message;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: this.error,
                    variant: 'error'
                })
            );
        }
    }

    connectedCallback() {
        this.loading = true;
        getPremises({
            pageSize: this.pagesize, 
            pageNumber: this.pageNumber, 
            name: this.productName, 
            city: this.productCity, 
            wifi: this.wifi, 
            parking: this.parking, 
            elevator: this.elevator, 
            kitchen: this.kitchen,
            price: this.maxPrice,
            size: this.minSize
        })
            .then(result => {
                this.loading = false;
                if(result) {
                    let data = JSON.parse(result);
                    this.recordEnd = data.recordEnd;
                    this.totalRecords = data.totalRecords;
                    this.recordStart = data.recordStart;
                    this.products = data.products;
                    this.pageNumber = data.pageNumber;
                    this.totalPages = Math.ceil(data.totalRecords / this.pagesize);
                    this.isNext = (this.pageNumber == this.totalPages || this.totalPages == 0);
                    this.isPrev = (this.pageNumber == 1 || this.totalRecords < this.pagesize);
                }
            })
            .catch(error => {
                this.loading = false;
                this.error = error.message;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: this.error,
                        variant: 'error'
                    })
                );
            });
    }

    getProducts() {
        this.loading = true;
        if(this.currentUserRoleName.startsWith('Housing')) {
            getApartments({
                pageSize: this.pagesize, 
                pageNumber: this.pageNumber, 
                name: this.productName, 
                city: this.productCity, 
                type: this.apartmentType, 
                laundry: this.laundry, 
                balcony: this.balcony, 
                lk: this.livingRoomKitchen
            })
                .then(result => {
                    this.loading = false;
                    if(result) {
                        let data = JSON.parse(result);
                        this.recordEnd = data.recordEnd;
                        this.totalRecords = data.totalRecords;
                        this.recordStart = data.recordStart;
                        this.products = data.products;
                        this.pageNumber = data.pageNumber;
                        this.totalPages = Math.ceil(data.totalRecords / this.pagesize);
                        this.isNext = (this.pageNumber == this.totalPages || this.totalPages == 0);
                        this.isPrev = (this.pageNumber == 1 || this.totalRecords < this.pagesize);
                    }
                })
                .catch(error => {
                    this.loading = false;
                    this.error = error.message;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: this.error,
                            variant: 'error'
                        })
                    );
                });
        } else {
            getPremises({
                pageSize: this.pagesize, 
                pageNumber: this.pageNumber, 
                name: this.productName, 
                city: this.productCity, 
                wifi: this.wifi, 
                parking: this.parking, 
                elevator: this.elevator, 
                kitchen: this.kitchen,
                price: this.maxPrice,
                size: this.minSize
            })
                .then(result => {
                    this.loading = false;
                    if(result) {
                        let data = JSON.parse(result);
                        this.recordEnd = data.recordEnd;
                        this.totalRecords = data.totalRecords;
                        this.recordStart = data.recordStart;
                        this.products = data.products;
                        this.pageNumber = data.pageNumber;
                        this.totalPages = Math.ceil(data.totalRecords / this.pagesize);
                        this.isNext = (this.pageNumber == this.totalPages || this.totalPages == 0);
                        this.isPrev = (this.pageNumber == 1 || this.totalRecords < this.pagesize);
                    }
                })
                .catch(error => {
                    this.loading = false;
                    this.error = error.message;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: this.error,
                            variant: 'error'
                        })
                    );
                });
        }
    }

    displayFilter() {
        this.showFilter = true;
    }

    hideFilter() {
        this.showFilter = false;
    }

    handleMaxPriceChange(event) {
        this.maxPrice = event.target.value;
        this.getProducts();
    }

    handleSizeChange(event) {
        this.minSize = event.target.value;
        this.getProducts();
    }

    handleProductNameChange(event) {
        this.productName = event.target.value;
        this.getProducts();
    }

    handleProductCityChange(event) {
        this.productCity = event.target.value;
        this.getProducts();
    }

    handleApartmentTypeChange(event) {
        this.apartmentType = event.target.value;
        this.getProducts();
    }

    handleLaundryChange(event) {
        this.laundry = event.target.checked;
        this.getProducts();
    }

    handleBalconyChange(event) {
        this.balcony = event.target.checked;
        this.getProducts();
    }

    handleLivingRoomKitchenChange(event) {
        this.livingRoomKitchen = event.target.checked;
        this.getProducts();
    }

    handleWifiChange(event) {
        this.wifi = event.target.checked;
        this.getProducts();
    }

    handleParkingChange(event) {
        this.parking = event.target.checked;
        this.getProducts();
    }

    handleElevatorChange(event) {
        this.elevator = event.target.checked;
        this.getProducts();
    }

    handleKitchenChange(event) {
        this.kitchen = event.target.checked;
        this.getProducts();
    }

    handleFirst() {
        this.pageNumber = 1;
        this.getProducts();
    }

    handlePrevious() {
        this.pageNumber = this.pageNumber - 1;
        if(this.pageNumber < 1) {
            this.pageNumber = 1;
        }
        this.getProducts();
    }

    handleNext() {
        this.pageNumber = this.pageNumber + 1;
        if(this.pageNumber > this.totalPages) {
            this.pageNumber = this.totalPages;
        }
        this.getProducts();
    }

    handleLast() {
        this.pageNumber = this.totalPages;
        this.getProducts();
    }

    get noProducts() {
        let isDisplay = true;
        if(this.products) {
            if(this.products.length == 0) {
                isDisplay = true;
            } else {
                isDisplay = false;
            }
        }
        return isDisplay;
    }

    get productsDisplayed() {
        let flag = true;
        if(this.products) {
            if(this.products.length == 0) {
                flag = false;
            } else {
                flag = true;
            }
        }
        return flag;
    }

    selectProduct(event) {
        this.selectedProductId = event.detail.productId;
        window.open(main_url + this.selectedProductId, '_blank').focus();
    }
}