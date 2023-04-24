import { LightningElement, track, api, wire } from 'lwc';

export default class ProductDetailsGalleryTile extends LightningElement {

    @api file;
    @api recordId;
    @api thumbnail;

    filePreview() {
        const showPreview = this.template.querySelector('c-preview-file-modal');
        showPreview.show();
    }
}