import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getProduct from '@salesforce/apex/FileController.getProductById';
import UserId from '@salesforce/user/Id';
import userEvent from '@salesforce/apex/ProductController.getUserEvents';
import userReservation from '@salesforce/apex/ProductController.getUserReservations';
import productEvents from '@salesforce/apex/ProductController.getProductEventsForGivenDay';
import eventCreate from '@salesforce/apex/ProductController.createEvent';
import eventDelete from '@salesforce/apex/ProductController.deleteEvent';
import reservationCreate from '@salesforce/apex/ProductController.createReservation';
import quoteCreate from '@salesforce/apex/ProductController.createQuote';

export default class ProductDetails extends LightningElement {

    @track product;
    @api productId;
    @track userId = UserId;
    @track myEvent = null;
    @track myRes = null;
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
    @track meetingDate = new Date(new Date().getTime() + (1*24*60*60*1000)).toISOString();
    @track meetingStart = new Date().toISOString();
    @track showEventModal = false;
    @track showResModal = false;
    @track hourContainer = 'hourContainer2';
    @track tomorrow = new Date(new Date().getTime() + (1*24*60*60*1000)).toISOString();
    @track resPeriod = 1;
    @track resPrice = 100;
    @track newprice;

    connectedCallback() {
        getProduct({id: this.productId})
            .then(result => {
                this.product = JSON.parse(result);
                console.log('result: ' + JSON.stringify(JSON.parse(result)));
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
                userReservation({whoId: this.userId, whatId: this.product.id})
                    .then(result => {
                        this.myRes = JSON.parse(result);
                        this.newprice = this.product.price - this.myRes.price;
                    })
                productEvents({whatId: this.product.id, start: this.meetingDate})
                    .then(result => {
                        if(result) {
                            let data = JSON.parse(result);
                            this.productEvents = data.events;
                            this.availableHours = data.hours;
                            for(let j = 0; j < this.hours.length; j++) {
                                this.hours[j].class = 'hourContainer2';
                            }
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
            })
    }

    get hasAnyMeetings() {
        let flag = false;
        if(this.productEvents.length == 0) {
            flag = false;
        } else {
            flag = true;
        }
        return flag;
    }

    get isRes() {
        let flag = false;
        if(this.product.isReserved == false) {
            flag = false;
        } else {
            flag = true;
        }
        return flag;
    }

    get hasRes() {
        let flag = false;
        if(this.myRes == null || this.myRes == undefined) {
            flag = false;
        } else {
            flag = true;
        }
        return flag;
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
        let dd = new Date(new Date().getTime()).toISOString();
        if(this.meetingDate >= dd) {
            productEvents({whatId: this.product.id, start: this.meetingDate})
            .then(result => {
                if(result) {
                    let data = JSON.parse(result);
                    this.productEvents = data.events;
                    this.availableHours = data.hours;
                    for(let j = 0; j < this.hours.length; j++) {
                        this.hours[j].class = 'hourContainer2';
                    }
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
        } else if(this.meetingDate < dd) {
            this.meetingDate = new Date(new Date().getTime() + (1*24*60*60*1000)).toISOString();
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Date cannot be earlier than tomorrow date',
                    variant: 'error'
                })
            );
        }
    }

    handlePeriodChange(event) {
        this.resPeriod = event.target.value;
        this.resPrice = 100 * this.resPeriod;
    }

    closeEventModal() {
        this.showEventModal = false;
    }

    closeResModal() {
        this.showResModal = false;
    }

    displayResModal() {
        this.showResModal = true;
    }

    displayEventModal() {
        this.showEventModal = true;
        productEvents({whatId: this.product.id, start: this.meetingDate})
            .then(result => {
                if(result) {
                    let data = JSON.parse(result);
                    this.productEvents = data.events;
                    this.availableHours = data.hours;
                    for(let j = 0; j < this.hours.length; j++) {
                        this.hours[j].class = 'hourContainer2';
                    }
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
    }

    handleCreateEvent(event) {
        let dd = new Date(new Date().getTime()).toISOString();
        if(this.meetingDate >= dd) {
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
                        productEvents({whatId: this.product.id, start: this.meetingDate})
                            .then(result => {
                                if(result) {
                                    let data = JSON.parse(result);
                                    this.productEvents = data.events;
                                    this.availableHours = data.hours;
                                    for(let j = 0; j < this.hours.length; j++) {
                                        this.hours[j].class = 'hourContainer2';
                                    }
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
        } else if(this.meetingDate < dd) {
            this.meetingDate = new Date(new Date().getTime() + (1*24*60*60*1000)).toISOString();
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Date cannot be earlier than tomorrow date',
                    variant: 'error'
                })
            );
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
                    productEvents({whatId: this.product.id, start: this.meetingDate})
                        .then(async result => {
                            if(result) {
                                let data = JSON.parse(result);
                                this.productEvents = data.events;
                                this.availableHours = data.hours;
                                for(let j = 0; j < this.hours.length; j++) {
                                    this.hours[j].class = 'hourContainer2';
                                }
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
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Meeting cancelled successfully',
                        variant: 'success'
                    })
                );
            })
    }

    saveReservation() {
        reservationCreate({whatId: this.product.id, whoId: this.userId, agentId: this.product.agentId, noDays: this.resPeriod})
            .then(result => {
                console.log('reservation result: ' + JSON.stringify(result));
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
                        userReservation({whoId: this.userId, whatId: this.product.id})
                            .then(result => {
                                this.myRes = JSON.parse(result);
                                this.newprice = this.product.price - this.myRes.price;
                            })
                        productEvents({whatId: this.product.id, start: this.meetingDate})
                            .then(result => {
                                if(result) {
                                    let data = JSON.parse(result);
                                    this.productEvents = data.events;
                                    this.availableHours = data.hours;
                                    for(let j = 0; j < this.hours.length; j++) {
                                        this.hours[j].class = 'hourContainer2';
                                    }
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
                    })
                this.showResModal = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Reservation scheduled successfully',
                        variant: 'success'
                    })
                );
            })
    }

    quoteCreation() {
        quoteCreate({whatId: this.product.id, whoId: this.userId, agentId: this.product.agentId})
            .then(result => {
                console.log('quote result: ' + JSON.stringify(result));
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Quote generated successfully',
                        variant: 'success'
                    })
                );
            })
    }

    // winOpp() {
    //     opportunityWin({whatId: this.product.id, whoId: this.userId})
    //         .then(result => {
    //             console.log('win result: ' + JSON.stringify(result));
    //             this.dispatchEvent(
    //                 new ShowToastEvent({
    //                     title: 'Success',
    //                     message: 'Premise bought successfully',
    //                     variant: 'success'
    //                 })
    //             );
    //         })
    // }
}   