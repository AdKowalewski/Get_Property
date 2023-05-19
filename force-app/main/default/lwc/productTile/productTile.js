import { LightningElement, api, track } from 'lwc';
import City from '@salesforce/label/c.City';
import size from '@salesforce/label/c.size';
import price from '@salesforce/label/c.price';
import Reserved1 from '@salesforce/label/c.Reserved1';

export default class ProductTile extends LightningElement {

    @api
    product;

    @api
    selectedProductId;

    @track
    productPrice;

    label = {
        City,
        size,
        price,
        Reserved1
    }

    get backgroundStyle() {
        return 'background-image:url('+ this.product.DisplayUrl +')';
    }

    get isRes() {
        let flag = false;
        if(this.product.IsReservation__c == true) {
            flag = true
        } else {
            flag = false;
        }
        return flag;
    }

    connectedCallback() {
        this.productPrice = this.product.PricebookEntries.records[0].UnitPrice;
    }

    selectProduct() {
        this.selectedProductId = this.product.Id;
        const productselect = new CustomEvent('productselect', {
            detail: {
                productId: this.selectedProductId
            }
        });
        this.dispatchEvent(productselect);
    }
}