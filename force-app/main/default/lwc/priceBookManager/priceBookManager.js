import { LightningElement, api, wire, track } from 'lwc';

export default class PriceBookManager extends LightningElement {
    
    @track selectedId;
    @track selectedName;
    @track selectedProdType;
    @track selectedStartDate;
    @track selectedEndDate;
    @track selectedIsActive;

    handlePricebookSelect(event) {
        this.selectedId = event.detail.id;
        this.selectedName = event.detail.name;
        this.selectedProdType = event.detail.prodType;
        this.selectedStartDate = event.detail.startDate;
        this.selectedEndDate = event.detail.endDate;
        this.selectedIsActive = event.detail.isActive;
        this.template.querySelector('c-product-list').getNewProducts();
    }

    handlePBEdit() {
        this.template.querySelector('c-price-book-list').fetchPricebooks();
    }
}