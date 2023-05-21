import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getPremises from '@salesforce/apex/ProductController.getProductPremisesList';
import markAsViewed from '@salesforce/apex/LastSeenPremisesController.markProductAsRecentlyViewed';
import getLastViewed from '@salesforce/apex/LastSeenPremisesController.getUserRecentlyViewedProducts2';
import main_url from '@salesforce/label/c.main_url';
import UserId from '@salesforce/user/Id';

import first from '@salesforce/label/c.first';
import previous from '@salesforce/label/c.previous';
import next from '@salesforce/label/c.next';
import last from '@salesforce/label/c.last';
import recentlyviewedproperties from '@salesforce/label/c.recentlyviewedproperties';
import mustlogin1 from '@salesforce/label/c.mustlogin1';
import noproductsfound from '@salesforce/label/c.noproductsfound';
import filter from '@salesforce/label/c.filter';
import hidefilter from '@salesforce/label/c.hidefilter';
import clearfilter from '@salesforce/label/c.clearfilter';
import findproperty from '@salesforce/label/c.findproperty';
import maxprice from '@salesforce/label/c.maxprice';
import minsize from '@salesforce/label/c.minsize';
import wifi from '@salesforce/label/c.wifi';
import parking from '@salesforce/label/c.parking';
import elevator from '@salesforce/label/c.elevator';
import kitchen from '@salesforce/label/c.kitchen';
import productname from '@salesforce/label/c.productname';
import productcity from '@salesforce/label/c.productcity';

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
    @track isPrevV = true;
    @track isNextV = true;
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
    @track isMyMeetings = false;

    @track userId = UserId;

    @track seenProductName;
    @track seenProductCity;

    label = {
        main_url,
        first,
        previous,
        next,
        last,
        noproductsfound,
        mustlogin1,
        recentlyviewedproperties,
        filter,
        hidefilter,
        clearfilter,
        findproperty,
        maxprice,
        minsize,
        wifi,
        parking,
        elevator,
        kitchen,
        productname,
        productcity
    };

    get isLogged() {
        let flag = false;
        if(this.userId != null) {
            flag = true;
        } else {
            flag = false;
        }
        return flag;
    }

    get arelastproducts() {
        let flag = false;
        if(this.lastproducts.length > 0) {
            flag = true;
        } else if(this.lastproducts.length == 0) {
            flag = false;
        }
        return flag;
    }

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
    }

    showRecentlyViewed() {
        this.isDetail = false;
        this.loading = true;
        this.getLastViewedPremises();
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

    handleFirstV() {
        this.pageNumber = 1;
        this.getLastViewedPremises();
    }

    handlePreviousV() {
        this.pageNumber = this.pageNumber - 1;
        if(this.pageNumber < 1) {
            this.pageNumber = 1;
        }
        this.getLastViewedPremises();
    }

    handleNextV() {
        this.pageNumber = this.pageNumber + 1;
        if(this.pageNumber > this.totalPages) {
            this.pageNumber = this.totalPages;
        }
        this.getLastViewedPremises();
    }

    handleLastV() {
        this.pageNumber = this.totalPages;
        this.getLastViewedPremises();
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
    
    get vProductsDisplayed() {
        let flag = true;
        if(this.lastproducts) {
            if(this.lastproducts.length == 0) {
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
    }

    selectLastProduct(event) {
        this.selectedProductId = event.detail.productId;
        this.isDetail = true;
        markAsViewed({id: this.selectedProductId});
    }

    handleGoHome() {
        this.isDetail = false;
        this.isMyMeetings = false;
        this.getLastViewedPremises();
    }

    getLastViewedPremises() {
        getLastViewed({pageSize: this.pagesize, pageNumber: this.pageNumber, name: this.seenProductName, city: this.seenProductCity})
            .then(result => {
                if(result) {
                    let data = JSON.parse(result);
                    this.recordEnd = data.recordEnd;
                    this.totalRecords = data.totalRecords;
                    this.recordStart = data.recordStart;
                    this.lastproducts = data.products;
                    this.pageNumber = data.pageNumber;
                    this.totalPages = Math.ceil(data.totalRecords / this.pagesize);
                    this.isNextV = (this.pageNumber == this.totalPages || this.totalPages == 0);
                    this.isPrevV = (this.pageNumber == 1 || this.totalRecords < this.pagesize);
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
    }

    backFromRecentlyViewed() {
        this.isLastSeen = false;
        this.isMyMeetings = false;
    }

    handleSeenName(event) {
        this.seenProductName = event.target.value;
        this.getLastViewedPremises();
    }

    handleSeenCity(event) {
        this.seenProductCity = event.target.value;
        this.getLastViewedPremises();
    }

    viewMyMeetings() {
        this.isMyMeetings = true;
        this.isDetail = false;
        this.isLastSeen = false;
    }
}