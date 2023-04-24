import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getProduct from '@salesforce/apex/FileController.getProductById';

export default class ProductDetails extends LightningElement {

    @track product;

    connectedCallback() {
        getProduct({id: '01t7S000000XWtcQAG'})
            .then(result => {
                this.product = JSON.parse(result);
                console.log('product check ' + JSON.stringify(result));
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
} 