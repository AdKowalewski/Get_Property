import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getProduct from '@salesforce/apex/FileController.getProductById';
import UserId from '@salesforce/user/Id';

export default class ProductDetails extends LightningElement {

    @track product;
    @api productId;
    @track userId = UserId;

    connectedCallback() {
        getProduct({id: this.productId})
            .then(result => {
                this.product = JSON.parse(result);
                if(this.product.wifi == true) {
                    this.product.wifi = 'yes';
                } else {
                    this.product.wifi = 'no';
                }
                if(this.product.parking == true) {
                    this.product.parking = 'yes';
                } else {
                    this.product.parking = 'no';
                }
                if(this.product.elevator == true) {
                    this.product.elevator = 'yes';
                } else {
                    this.product.elevator = 'no';
                }
                if(this.product.kitchen == true) {
                    this.product.kitchen = 'yes';
                } else {
                    this.product.kitchen = 'no';
                }
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error,
                        variant: 'error'
                    })
                );
            })
    }

    get backgroundStyle() {
        return 'background-image:url(' + this.product.displayUrl + ')';
    }

    toHome() {
        this.dispatchEvent(
            new CustomEvent('gohome')
        );
    }

    get isLoggedIn() {
        let flag = false;
        if(this.userId == null) {
            flag = false;
        } else {
            flag = true;
        }
        return flag;
    }
} 