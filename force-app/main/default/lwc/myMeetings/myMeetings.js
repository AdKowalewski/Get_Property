import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import UserId from '@salesforce/user/Id';
import userEvents from '@salesforce/apex/ProductController.getAllUserEvents';
import eventDelete from '@salesforce/apex/ProductController.deleteEvent';

import meetingcancelsuccess from '@salesforce/label/c.meetingcancelsuccess';
import success from '@salesforce/label/c.success';

export default class MyMeetings extends LightningElement {
    
    @track userEvents = [];
    @track userId = UserId;
    @track idToDelete;
    @track displayModal = false;

    label = {
        meetingcancelsuccess,
        success
    }

    get areMeetings() {
        let flag = false;
        if(this.userEvents.length != 0) {
            flag = true;
        } else {
            flag = false;
        }
        return flag;
    }

    get isLoggedIn() {
        let flag = false;
        if(this.userId != null) {
            flag = true;
        } else {
            flag = false;
        }
        return flag;
    }

    connectedCallback() {
        userEvents({whoId: this.userId})
            .then(result => {
                this.userEvents = JSON.parse(result);
            })
    }

    hideModal() {
        this.displayModal = false;
    }

    showModal(event) {
        this.idToDelete = event.target.dataset.deleteId;
        this.displayModal = true;
    }

    handleDelete() {
        eventDelete({id: this.idToDelete})
            .then(result => {
                this.displayModal = false;
                userEvents({whoId: this.userId})
                    .then(result => {
                        this.userEvents = JSON.parse(result);
                    })
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: success,
                        message: meetingcancelsuccess,
                        variant: 'success'
                    })
                );
            })
    }

    handleSelect(event) {
        let selectedVal = event.detail.value;
        if(selectedVal === 'Delete') {
            this.displayModal = true;
            this.idToDelete = event.target.dataset.deleteId;
            console.log('id to delete: ' + this.idToDelete);
        }
    }

    backFromMyMeetings() {
        this.dispatchEvent(
            new CustomEvent('goback')
        );
    }
}