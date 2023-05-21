import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import UserId from '@salesforce/user/Id';
import getLastViewed from '@salesforce/apex/LastSeenPremisesController.getUserRecentlyViewedProducts2';

import mustlogin1 from '@salesforce/label/c.mustlogin1';
import recentlyviewedpremises from '@salesforce/label/c.recentlyviewedpremises';
import noproductsfound from '@salesforce/label/c.noproductsfound';
import first from '@salesforce/label/c.first';
import previous from '@salesforce/label/c.previous';
import next from '@salesforce/label/c.next';
import last from '@salesforce/label/c.last';
import productname from '@salesforce/label/c.productname';
import productcity from '@salesforce/label/c.productcity';

export default class LastSeenPremises extends LightningElement {
    
    @track error = null;
    @track userId = UserId;
    @track seenProductName;
    @track seenProductCity;
    @track isPrevV = true;
    @track isNextV = true;
    @track loading = false;
    @track pagesize = 3;
    @track recordEnd = 0;
    @track recordStart = 0;
    @track pageNumber = 1;
    @track totalRecords = 0;
    @track totalPages = 0;
    @track lastproducts = [];
    @track isDetail = false;

    label = {
        mustlogin1,
        recentlyviewedpremises,
        noproductsfound,
        first,
        previous,
        next,
        last,
        productname,
        productcity
    }

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

    connectedCallback() {
        this.loading = true;
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

    selectLastProduct(event) {
        this.selectedProductId = event.detail.productId;
        this.isDetail = true;
        markAsViewed({id: this.selectedProductId});
    }

    handleSeenName(event) {
        this.seenProductName = event.target.value;
        this.getLastViewedPremises();
    }

    handleSeenCity(event) {
        this.seenProductCity = event.target.value;
        this.getLastViewedPremises();
    }

    handleGoHome() {
        this.isDetail = false;
        this.getLastViewedPremises();
    }
}