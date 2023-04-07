import { LightningElement, api, track } from 'lwc';
import fileDelete from '@salesforce/apex/FileController.deleteFile';
import getDisplayUrl from '@salesforce/apex/FileController.getProductDisplayUrl';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import { updateRecord } from 'lightning/uiRecordApi';

import PRODUCT2_ID_FIELD from '@salesforce/schema/Product2.Id';
import DEFAULT_IMAGE_URL from '@salesforce/schema/Product2.DisplayUrl';

export default class PreviewImage extends LightningElement {

    @api file;
    @api recordId;
    @api thumbnail;
    @track showDeleteModal = false;
    @track currentRecordId;
    dispUrl = '';

    get iconName() {
        return 'doctype:image';
    }

    async handleSelect(event) {
        let selectedVal = event.detail.value;
        this.currentRecordId = event.currentTarget.dataset.id;
        if(selectedVal === 'delete') {
            this.showDeleteModal = true;
        } else if(selectedVal === 'default') {
            await updateRecord({
                fields: {
                    [PRODUCT2_ID_FIELD.fieldApiName]: this.recordId,
                    [DEFAULT_IMAGE_URL.fieldApiName]: '/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=' + this.file.Id + '&operationContext=CHATTER&contentId=' + this.file.ContentDocumentId
                }
            });
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success!',
                    message: 'Image was set as default successfully.',
                    variant: 'success'
                })
            );
        }
    }

    filePreview() {
        const showPreview = this.template.querySelector('c-preview-file-modal');
        showPreview.show();
    }

    handleCancel() {
        this.showDeleteModal = false;
    }

    async handleDelete() {
        let defUrl = '/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=' + this.file.Id + '&operationContext=CHATTER&contentId=' + this.file.ContentDocumentId;
        await getDisplayUrl({id: this.recordId})
            .then(result => {
                let data = JSON.parse(result);
                this.dispUrl = data.message;
            })
        if(defUrl == this.dispUrl) {
            await updateRecord({
                fields: {
                    [PRODUCT2_ID_FIELD.fieldApiName]: this.recordId,
                    [DEFAULT_IMAGE_URL.fieldApiName]: null
                }
            });
        }
        await fileDelete({recordId: this.currentRecordId});
        this.showDeleteModal = false;
        this.dispatchEvent(new CustomEvent('deletefile'));
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success!',
                message: 'Image was deleted successfully.',
                variant: 'success'
            })
        );
    }
}