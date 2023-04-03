import { LightningElement, track } from 'lwc';

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
        if(this.selectedProdType == null) {
            this.selectedProdType = 'Standard';
        }
        this.selectedStartDate = event.detail.startDate;
        if(this.selectedStartDate == null) {
            this.selectedStartDate = 'undefined';
        }
        this.selectedEndDate = event.detail.endDate;
        if(this.selectedEndDate == null) {
            this.selectedEndDate = 'undefined';
        }
        this.selectedIsActive = event.detail.isActive;
        this.template.querySelector('c-product-list').getNewProducts();     
    }

    handlePBEdit() {
        this.template.querySelector('c-price-book-list').fetchPricebooks();
    }
}