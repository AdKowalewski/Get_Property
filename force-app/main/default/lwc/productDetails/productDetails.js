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
        {
            h: '9:00',
            class: 'hourContainer2'
        },
        {
            h: '9:30',
            class: 'hourContainer2'
        },
        {
            h: '10:00',
            class: 'hourContainer2'
        },
        {
            h: '10:30',
            class: 'hourContainer2'
        },
        {
            h: '11:00',
            class: 'hourContainer2'
        },
        {
            h: '11:30',
            class: 'hourContainer2'
        },
        {
            h: '12:00',
            class: 'hourContainer2'
        },
        {
            h: '12:30',
            class: 'hourContainer2'
        },
        {
            h: '13:00',
            class: 'hourContainer2'
        },
        {
            h: '13:30',
            class: 'hourContainer2'
        },
        {
            h: '14:00',
            class: 'hourContainer2'
        },
        {
            h: '14:30',
            class: 'hourContainer2'
        },
        {
            h: '15:00',
            class: 'hourContainer2'
        },
        {
            h: '15:30',
            class: 'hourContainer2'
        },
        {
            h: '16:00',
            class: 'hourContainer2'
        },
        {
            h: '16:30',
            class: 'hourContainer2'
        }
    ];
    @track availableHours = [];
    @track meetingDate = new Date().toISOString();
    @track meetingStart = new Date().toISOString();
    @track showEventModal = false;
    @track hourContainer = 'hourContainer2';

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
                productEvents({whatId: this.product.id, start: this.meetingDate})
                    .then(result => {
                        if(result) {
                            let data = JSON.parse(result);
                            this.productEvents = data.events;
                            this.availableHours = data.hours;
                            console.log('meetings: ' + JSON.stringify(this.productEvents));
                            console.log('available hours: ' + JSON.stringify(this.availableHours));
                            for(let i = 0; i < this.availableHours.length; i++) {
                                for(let j = 0; j < this.hours.length; j++) {
                                    if(this.hours[j].h == this.availableHours[i]) {
                                        this.hours[j].class = 'hourContainer1';
                                        continue;
                                    }
                                }
                            }
                            // this.productEvents = JSON.parse(result);
                            // console.log('meetings: ' + JSON.stringify(this.productEvents));
                            // let existingHours = [];
                            // for(let i = 0; i < this.productEvents.length; i++) {
                            //     existingHours.push(this.productEvents[i].hour);
                            // }
                            // console.log('existing hours: ' + JSON.stringify(existingHours));
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
                            // console.log('available hours: ' + JSON.stringify(this.availableHours));
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

    addToList(list1, list2, list3) {
        let k = false;
        for(let i = 0; i < list1.length; i++) {
            for(let j = 0; j < list2.length; j++) {
                if(list1[i] == list2[j]) {
                    k = true;
                    continue;
                }
            }
            if(k == false) {
                list3.push(list1[i]);
            }
            k = false;
        }
    }

    handleMeetingDateChange(event) {
        this.meetingDate = event.target.value;
        productEvents({whatId: this.product.id, start: this.meetingDate})
            .then(result => {
                if(result) {
                    let data = JSON.parse(result);
                    this.productEvents = data.events;
                    this.availableHours = data.hours;
                    console.log('meetings: ' + JSON.stringify(this.productEvents));
                    console.log('available hours: ' + JSON.stringify(this.availableHours));
                    for(let i = 0; i < this.availableHours.length; i++) {
                        for(let j = 0; j < this.hours.length; j++) {
                            if(this.hours[j].h == this.availableHours[i]) {
                                this.hours[j].class = 'hourContainer1';
                                continue;
                            }
                        }
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
        let hclass = event.target.dataset.class;
        if(hclass == 'hourContainer1') {
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
            hour: parseInt(chosenHour[0]) + 2,
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
                    productEvents({whatId: this.product.id, start: this.meetingDate})
                        .then(result => {
                            if(result) {
                                let data = JSON.parse(result);
                                this.productEvents = data.events;
                                this.availableHours = data.hours;
                                console.log('meetings: ' + JSON.stringify(this.productEvents));
                                console.log('available hours: ' + JSON.stringify(this.availableHours));
                                for(let i = 0; i < this.availableHours.length; i++) {
                                    for(let j = 0; j < this.hours.length; j++) {
                                        if(this.hours[j].h == this.availableHours[i]) {
                                            this.hours[j].class = 'hourContainer1';
                                            continue;
                                        }
                                    }
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
    }

    handleCancelMeeting() {
        eventDelete({id: this.myEvent.id})
            .then(result => {
                this.myEvent = null;
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
                    productEvents({whatId: this.product.id, start: this.meetingDate})
                        .then(async result => {
                            if(result) {
                                let data = JSON.parse(result);
                                this.productEvents = data.events;
                                this.availableHours = data.hours;
                                console.log('meetings: ' + JSON.stringify(this.productEvents));
                                console.log('available hours: ' + JSON.stringify(this.availableHours));
                                for(let i = 0; i < this.availableHours.length; i++) {
                                    for(let j = 0; j < this.hours.length; j++) {
                                        if(this.hours[j].h == this.availableHours[i]) {
                                            this.hours[j].class = 'hourContainer1';
                                            continue;
                                        }
                                    }
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