import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord } from 'lightning/uiRecordApi';
import ID from '@salesforce/user/Id';
import ROLE_NAME_FIELD from '@salesforce/schema/User.UserRole.Name';
import getPremises from '@salesforce/apex/ProductController.getProductPremisesList';
import getApartments from '@salesforce/apex/ProductController.getProductApartmentsList';
import markAsViewed from '@salesforce/apex/ProductController.markProductAsRecentlyViewed';
import getLastViewed from '@salesforce/apex/ProductController.getUserRecentlyViewedProducts';
import main_url from '@salesforce/label/c.main_url';

export default class PremiseExplorer extends LightningElement {

    @track selectedProductId;

    @track error = null;

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
    @track lastproducts = [];
    @track showFilter = false;
    @track maxPrice = 100000;
    @track minSize = 20;

    @track productName;
    @track productCity;
    @track wifi;
    @track parking;
    @track elevator;
    @track kitchen;

    @track isDetail = false;
    @track isLastSeen = false;

    label = {
        main_url
    };

    connectedCallback() {
        this.isDetail = false;
        this.isLastSeen = false;
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
                // this.loading = false;
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
                this.loading = false;
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
        // this.loading = false;
    }

    getProducts() {
        this.isDetail = false;
        this.isLastSeen = false;
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
                // this.loading = false;
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
                this.loading = false;
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
        // this.loading = false;
    }

    showRecentlyViewed() {
        this.loading = true;
        getLastViewed()
            .then(result => {
                if(result) {
                    this.lastproducts = JSON.parse(result);
                }
                this.loading = false;
            })
            .catch(error => {
                console.log('error with getting last viewed records');
            });
        this.isLastSeen = true;
    }

    displayFilter() {
        this.showFilter = true;
    }

    hideFilter() {
        this.showFilter = false;
    }

    clearFilter() {
        this.maxPrice = 100000;
        this.minSize = 20;
        this.wifi = false;
        this.parking = false;
        this.elevator = false;
        this.kitchen = false;
        this.showFilter = false;
        this.getProducts();
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
        this.isDetail = true;
        markAsViewed({id: this.selectedProductId});
        //window.open(main_url + this.selectedProductId, '_blank').focus();
    }

    selectLastProduct(event) {
        this.selectedProductId = event.target.dataset.productId;
        this.isDetail = true;
        markAsViewed({id: this.selectedProductId});
    }

    handleGoHome() {
        this.isDetail = false;
    }

    backFromRecentlyViewed() {
        this.isLastSeen = false;
    }
}