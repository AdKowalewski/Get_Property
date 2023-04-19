import { LightningElement, api, track } from 'lwc';

export default class ProductTile extends LightningElement {

    @api
    product;

    @api
    selectedProductId;

    @track
    productPrice;

    get backgroundStyle() {
        return 'background-image:url('+ this.product.DisplayUrl +')';
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