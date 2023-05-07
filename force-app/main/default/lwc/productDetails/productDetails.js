import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getProduct from '@salesforce/apex/FileController.getProductById';
import UserId from '@salesforce/user/Id';
import userEvent from '@salesforce/apex/ProductController.getUserEvents';
import productEvents from '@salesforce/apex/ProductController.getProductEventsForGivenDay';
import eventCreate from '@salesforce/apex/ProductController.createEvent';
import eventDelete from '@salesforce/apex/ProductController.deleteEvent';

export default class ProductDetails extends LightningElement {

    @track product;
    @api productId;
    @track userId = UserId;
    @track myEvent = null;
    @track productEvents = [];
    @track hours = [
        '9:00','9:30',
        '10:00','10:30',
        '11:00','11:30',
        '12:00','12:30',
        '13:00','13:30',
        '14:00','14:30',
        '15:00','15:30',
        '16:00','16:30',
    ];
    @track availableHours = [];
    @track meetingDate = new Date().toISOString();
    @track meetingStart = new Date().toISOString();
    @track showEventModal = false;

    connectedCallback() {
        getProduct({id: this.productId})
            .then(result => {
                this.product = JSON.parse(result);
                if(this.product.wifi == true) {
                    this.product.wifi = 'yes';
                } else {
                    this.product.wifi = 'no';
                }
                if(this.product.parking == true) {
                    this.product.parking = 'yes';
                } else {
                    this.product.parking = 'no';
                }
                if(this.product.elevator == true) {
                    this.product.elevator = 'yes';
                } else {
                    this.product.elevator = 'no';
                }
                if(this.product.kitchen == true) {
                    this.product.kitchen = 'yes';
                } else {
                    this.product.kitchen = 'no';
                }
                userEvent({whoId: this.userId, whatId: this.product.id})
                    .then(result => {
                        this.myEvent = JSON.parse(result);
                    })
                    // .catch(error => {
                    //     this.dispatchEvent(
                    //         new ShowToastEvent({
                    //             title: 'Error',
                    //             message: error,
                    //             variant: 'error'
                    //         })
                    //     );
                    // })

                                                // let existingHours = ['9:30', '11:30'];
                                                // let k = false;
                                                // for(let i = 0; i < this.hours.length; i++) {
                                                //     for(let j = 0; j < existingHours.length; j++) {
                                                //         if(this.hours[i] == existingHours[j]) {
                                                //             k = true;
                                                //             continue;
                                                //         }
                                                //     }
                                                //     if(k == false) {
                                                //         this.availableHours.push(this.hours[i]);
                                                //     }
                                                //     k = false;
                                                // }
                productEvents({whatId: this.product.id, start: this.chosenDate})
                    .then(result => {
                        if(result) {
                            this.productEvents = JSON.parse(result);
                            let existingHours = [];
                            for(let i = 0; i < this.productEvents.length; i++) {
                                existingHours.push(this.productEvents[i].hour);
                            }
                            let k = false;
                            for(let i = 0; i < this.hours.length; i++) {
                                for(let j = 0; j < existingHours.length; j++) {
                                    if(this.hours[i] == existingHours[j]) {
                                        k = true;
                                        continue;
                                    }
                                }
                                if(k == false) {
                                    this.availableHours.push(this.hours[i]);
                                }
                                k = false;
                            }
                        }            
                    })
                    // .catch(error => {
                    //     this.dispatchEvent(
                    //         new ShowToastEvent({
                    //             title: 'Error',
                    //             message: error,
                    //             variant: 'error'
                    //         })
                    //     );
                    // })
            })
            // .catch(error => {
            //     this.dispatchEvent(
            //         new ShowToastEvent({
            //             title: 'Error',
            //             message: error,
            //             variant: 'error'
            //         })
            //     );
            // })
    }

    get backgroundStyle() {
        return 'background-image:url(' + this.product.displayUrl + ')';
    }

    toHome() {
        this.dispatchEvent(
            new CustomEvent('gohome')
        );
    }

    get isLoggedIn() {
        let flag = false;
        if(this.userId == null) {
            flag = false;
        } else {
            flag = true;
        }
        return flag;
    }

    get hasMeeting() {
        let flag = false;
        if(this.myEvent == null) {
            flag = false;
        } else {
            flag = true;
        }
        return flag;
    }

    handleMeetingDateChange(event) {
        this.meetingDate = event.target.value;
        productEvents({whatId: this.product.id, start: this.chosenDate})
            .then(result => {
                if(result) {
                    this.productEvents = JSON.parse(result);
                    let existingHours = [];
                    for(let i = 0; i < this.productEvents.length; i++) {
                        existingHours.push(this.productEvents[i].hour);
                    }
                    let k = false;
                    for(let i = 0; i < this.hours.length; i++) {
                        for(let j = 0; j < existingHours.length; j++) {
                            if(this.hours[i] == existingHours[j]) {
                                k = true;
                                continue;
                            }
                        }
                        if(k == false) {
                            this.availableHours.push(this.hours[i]);
                        }
                        k = false;
                    }
                }            
            })
            // .catch(error => {
            //     this.dispatchEvent(
            //         new ShowToastEvent({
            //             title: 'Error',
            //             message: error,
            //             variant: 'error'
            //         })
            //     );
            // })
    }

    closeEventModal() {
        this.showEventModal = false;
    }

    displayEventModal() {
        this.showEventModal = true;
    }

    handleCreateEvent(event) {
        let chosenHour = event.target.dataset.hour.split(':');
        let meetData = this.meetingDate.split('-');
        eventCreate({
            agentId: this.product.agentId, 
            whoId: this.userId, 
            whatId: this.product.id, 
            location: this.product.address,
            year: parseInt(meetData[0]),
            month: parseInt(meetData[1]),
            day: parseInt(meetData[2]),
            hour: parseInt(chosenHour[0]),
            minute: chosenHour[1] == '30' ? 30 : 0})
            .then(result => {
                userEvent({whoId: this.userId, whatId: this.product.id})
                    .then(result => {
                        this.myEvent = JSON.parse(result);
                    })
                    // .catch(error => {
                    //     this.dispatchEvent(
                    //         new ShowToastEvent({
                    //             title: 'Error',
                    //             message: error,
                    //             variant: 'error'
                    //         })
                    //     );
                    // })
                productEvents({whatId: this.product.id, start: this.chosenDate})
                    .then(result => {
                        this.productEvents = JSON.parse(result);
                        let existingHours = [];
                        for(let i = 0; i < this.productEvents.length; i++) {
                            existingHours.push(this.productEvents[i].hour);
                        }
                        console.log('existing hours: ' + JSON.stringify(existingHours));
                        this.availableHours.filter(h => {
                            !existingHours.includes(h);
                        })
                    })
                    // .catch(error => {
                    //     this.dispatchEvent(
                    //         new ShowToastEvent({
                    //             title: 'Error',
                    //             message: error,
                    //             variant: 'error'
                    //         })
                    //     );
                    // })
                this.showEventModal = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Meeting scheduled successfully',
                        variant: 'success'
                    })
                );
            })
    }

    handleCancelMeeting() {
        eventDelete({id: this.myEvent.id})
            .then(result => {
                userEvent({whoId: this.userId, whatId: this.product.id})
                    .then(result => {
                        this.myEvent = JSON.parse(result);
                    })
                    // .catch(error => {
                    //     this.dispatchEvent(
                    //         new ShowToastEvent({
                    //             title: 'Error',
                    //             message: error,
                    //             variant: 'error'
                    //         })
                    //     );
                    // })
                productEvents({whatId: this.product.id, start: this.chosenDate})
                    .then(result => {
                        this.productEvents = JSON.parse(result);
                        let existingHours = [];
                        for(let i = 0; i < this.productEvents.length; i++) {
                            existingHours.push(this.productEvents[i].hour);
                        }
                        console.log('existing hours: ' + JSON.stringify(existingHours));
                        this.availableHours.filter(h => {
                            !existingHours.includes(h);
                        })
                    })
                    // .catch(error => {
                    //     this.dispatchEvent(
                    //         new ShowToastEvent({
                    //             title: 'Error',
                    //             message: error,
                    //             variant: 'error'
                    //         })
                    //     );
                    // })
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Meeting cancelled successfully',
                        variant: 'success'
                    })
                );
            })
    }
}  