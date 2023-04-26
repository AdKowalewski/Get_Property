import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getFileVersions from '@salesforce/apex/FileController.getVersionFiles2';

export default class ProductDetailsGallery extends LightningElement {

    loaded = false;
    isLoading = false;
    @track fileList;
    @api recordId;
    @track files = [];

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
    //     console.log('data ' + JSON.stringify(data));
    //     this.fileList = "";
    //     this.files = [];
    //     if (data) {
    //         this.fileList = data;
    //         this.isLoading = true;
    //         for (let i = 0; i < this.fileList.length; i++) {
    //             let file = {
    //                 Id: this.fileList[i].id,
    //                 Title: this.fileList[i].title,
    //                 Extension: this.fileList[i].fileExtension,
    //                 ContentDocumentId: this.fileList[i].contentDocumentId,
    //                 ContentDocument: this.fileList[i].contentDocument,
    //                 CreatedDate: this.fileList[i].createdDate,
    //                 thumbnailFileCard:
    //                     'https://britenet-10a-dev-ed.develop.lightning.force.com/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=' +
    //                     this.fileList[i].id +
    //                     '&operationContext=CHATTER&contentId=' +
    //                     this.fileList[i].contentDocumentId,
    //                 downloadUrl: this.fileList[i].downloadUrl
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
}