import { LightningElement, wire, api, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getFileVersions from '@salesforce/apex/FileController.getVersionFiles2';
import createCD from '@salesforce/apex/FileController.createContentDistributions';

export default class ProductGallery extends LightningElement {

    loaded = false;
    isLoading = false;
    @track fileList;
    @api recordId;
    @track files = [];

    get acceptedFormats() {
        return ['.png', '.jpg', '.jpeg'];
    }

    connectedCallback() {
        getFileVersions({recordId: this.recordId})
            .then(result => {
                this.fileList = "";
                this.files = [];
                if(result) {
                    this.fileList = JSON.parse(result);
                    this.isLoading = true;
                    for (let i = 0; i < this.fileList.length; i++) {
                        let file = {
                            Id: this.fileList[i].id,
                            Title: this.fileList[i].title,
                            Extension: this.fileList[i].fileExtension,
                            ContentDocumentId: this.fileList[i].contentDocumentId,
                            ContentDocument: this.fileList[i].contentDocument,
                            CreatedDate: this.fileList[i].createdDate,
                            thumbnailFileCard:
                                'https://britenet-10a-dev-ed.develop.lightning.force.com/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=' +
                                this.fileList[i].id +
                                '&operationContext=CHATTER&contentId=' +
                                this.fileList[i].contentDocumentId,
                            downloadUrl: this.fileList[i].downloadUrl
                        };
                        this.files.push(file);
                    }
                    this.isLoading = false;
                    this.loaded = true;
                }
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error loading Files',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            })
    }

    // @wire(getFileVersions, { recordId: '$recordId' })
    // fileResponse(value) {
    //     this.wiredActivities = value;
    //     const { data, error } = value;
    //     this.fileList = "";
    //     this.files = [];
    //     if (data) {
    //         this.fileList = data;
    //         this.isLoading = true;
    //         for (let i = 0; i < this.fileList.length; i++) {
    //             let file = {
    //                 Id: this.fileList[i].Id,
    //                 Title: this.fileList[i].Title,
    //                 Extension: this.fileList[i].FileExtension,
    //                 ContentDocumentId: this.fileList[i].ContentDocumentId,
    //                 ContentDocument: this.fileList[i].ContentDocument,
    //                 CreatedDate: this.fileList[i].CreatedDate,
    //                 thumbnailFileCard:
    //                     'https://britenet-10a-dev-ed.develop.lightning.force.com/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=' +
    //                     this.fileList[i].Id +
    //                     '&operationContext=CHATTER&contentId=' +
    //                     this.fileList[i].ContentDocumentId,
    //                 downloadUrl: 
    //                     'https://britenet-10a-dev-ed.develop.lightning.force.com/sfc/servlet.shepherd/document/download/' +
    //                     this.fileList[i].ContentDocumentId
    //             };
    //             this.files.push(file);
    //         }
    //         this.isLoading = false;
    //         this.loaded = true;
    //     } else if (error) {
    //         this.dispatchEvent(
    //             new ShowToastEvent({
    //                 title: 'Error loading Files',
    //                 message: error.body.message,
    //                 variant: 'error'
    //             })
    //         );
    //     }
    // }

    handleUploadFinished(event) {
        this.isLoading = true;
        const uploadedFiles = event.detail.files;
        createCD({recordId: this.recordId, limitnum: uploadedFiles.length})
            .then(result => {})
            .catch(error => {
                console.log('error creating content distributions');
            })
        refreshApex(this.wiredActivities);
        this.isLoading = false;
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success!',
                message: uploadedFiles.length + ' Files Uploaded Successfully.',
                variant: 'success'
            })
        );
    }

    handleDeleteFile() {
        this.isLoading = true;
        refreshApex(this.wiredActivities);
        this.isLoading = false;
    }
}