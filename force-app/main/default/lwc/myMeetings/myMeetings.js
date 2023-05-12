import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import UserId from '@salesforce/user/Id';
import userEvents from '@salesforce/apex/ProductController.getAllUserEvents';
import eventDelete from '@salesforce/apex/ProductController.deleteEvent';

export default class MyMeetings extends LightningElement {
    
    @track userEvents = [];
    @track userId = UserId;
    @track idToDelete;
    @track displayModal = false;

    get areMeetings() {
        let flag = false;
        if(this.userEvents.length != 0) {
            flag = true;
        } else {
            flag = false;
        }
        return flag;
    }

    connectedCallback() {
        userEvents({whoId: this.userId})
            .then(result => {
                this.myEvent = JSON.parse(result);
            })
    }

    hideModal() {
        this.displayModal = false;
    }

    showModal(event) {
        this.idToDelete = event.target.dataset.deleteId;
        this.displayModal = true;
    }

    handleDelete(event) {
        eventDelete({id: this.idToDelete})
            .then(result => {
                this.displayModal = false;
                userEvents({whoId: this.userId})
                    .then(result => {
                        this.myEvent = JSON.parse(result);
                    })
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Meeting cancelled successfully',
                        variant: 'success'
                    })
                );
            })
    }

    handleSelect(event) {
        let selectedVal = event.detail.value;
        if(selectedVal === 'Delete') {
            this.displayModal = true;
            this.idToDelete = event.target.dataset.productId;
        }
    }

    backFromMyMeetings() {
        this.dispatchEvent(
            new CustomEvent('goback')
        );
    }
}