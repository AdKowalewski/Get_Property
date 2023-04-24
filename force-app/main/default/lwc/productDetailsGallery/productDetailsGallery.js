import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getFileVersions from '@salesforce/apex/FileController.getVersionFiles';

export default class ProductDetailsGallery extends LightningElement {

    loaded = false;
    isLoading = false;
    @track fileList;
    @api recordId;
    @track files = [];

    @wire(getFileVersions, { recordId: '$recordId' })
    fileResponse(value) {
        this.wiredActivities = value;
        const { data, error } = value;
        this.fileList = "";
        this.files = [];
        if (data) {
            this.fileList = data;
            this.isLoading = true;
            for (let i = 0; i < this.fileList.length; i++) {
                let file = {
                    Id: this.fileList[i].Id,
                    Title: this.fileList[i].Title,
                    Extension: this.fileList[i].FileExtension,
                    ContentDocumentId: this.fileList[i].ContentDocumentId,
                    ContentDocument: this.fileList[i].ContentDocument,
                    CreatedDate: this.fileList[i].CreatedDate,
                    thumbnailFileCard:
                        'https://britenet-10a-dev-ed.develop.lightning.force.com/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=' +
                        this.fileList[i].Id +
                        '&operationContext=CHATTER&contentId=' +
                        this.fileList[i].ContentDocumentId,
                    downloadUrl:
                        'https://britenet-10a-dev-ed.develop.lightning.force.com/sfc/servlet.shepherd/document/download/' +
                        this.fileList[i].ContentDocumentId
                };
                this.files.push(file);
            }
            this.isLoading = false;
            this.loaded = true;
        } else if (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading Files',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        }
    }
}