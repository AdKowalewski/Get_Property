import { LightningElement, api, track, wire } from 'lwc';

export default class ProductTile extends LightningElement {

    @api
    product;

    @api
    selectedProductId;

    get backgroundStyle() {
        return 'background-image:url('+ this.product.DisplayUrl +')';
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