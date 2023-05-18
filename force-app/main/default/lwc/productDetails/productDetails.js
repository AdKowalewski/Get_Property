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

import hourcontainer1 from '@salesforce/label/c.hourcontainer1';
import hourcontainer2 from '@salesforce/label/c.hourcontainer2';
import quotesuccess from '@salesforce/label/c.quotesuccess';
import reservationsuccess from '@salesforce/label/c.reservationsuccess';
import meetingsuccess from '@salesforce/label/c.meetingsuccess';
import meetingcancelsuccess from '@salesforce/label/c.meetingdeletesuccess';
import success from '@salesforce/label/c.success';
import error from '@salesforce/label/c.error';
import yes from '@salesforce/label/c.yes';
import no from '@salesforce/label/c.no';
import dateerror from '@salesforce/label/c.dateerror';
import yourmeeting from '@salesforce/label/c.yourmeeting';
import starts from '@salesforce/label/c.starts';
import ends from '@salesforce/label/c.ends';
import in2 from '@salesforce/label/c.in2';
import with2 from '@salesforce/label/c.with2';
import Email from '@salesforce/label/c.Email';

export default class ProductDetails extends LightningElement {

    label = {
        hourcontainer1,
        hourcontainer2,
        quotesuccess,
        reservationsuccess,
        meetingsuccess,
        meetingcancelsuccess,
        success,
        error,
        yes,
        no,
        dateerror,
        yourmeeting,
        starts,
        ends,
        in2,
        with2,
        Email
    }

    @track product;
    @api productId;
    @track userId = UserId;
    @track myEvent = null;
    @track myRes = null;
    @track productEvents = [];
    @track hours = [
        {
            h: '9:00',
            class: hourcontainer2
        },
        {
            h: '9:30',
            class: hourcontainer2
        },
        {
            h: '10:00',
            class: hourcontainer2
        },
        {
            h: '10:30',
            class: hourcontainer2
        },
        {
            h: '11:00',
            class: hourcontainer2
        },
        {
            h: '11:30',
            class: hourcontainer2
        },
        {
            h: '12:00',
            class: hourcontainer2
        },
        {
            h: '12:30',
            class: hourcontainer2
        },
        {
            h: '13:00',
            class: hourcontainer2
        },
        {
            h: '13:30',
            class: hourcontainer2
        },
        {
            h: '14:00',
            class: hourcontainer2
        },
        {
            h: '14:30',
            class: hourcontainer2
        },
        {
            h: '15:00',
            class: hourcontainer2
        },
        {
            h: '15:30',
            class: hourcontainer2
        },
        {
            h: '16:00',
            class: hourcontainer2
        },
        {
            h: '16:30',
            class: hourcontainer2
        }
    ];
    @track availableHours = [];
    @track meetingDate = new Date(new Date().getTime() + (1*24*60*60*1000)).toISOString();
    @track meetingStart = new Date().toISOString();
    @track showEventModal = false;
    @track showResModal = false;
    @track hourContainer = hourcontainer2;
    @track tomorrow = new Date(new Date().getTime() + (1*24*60*60*1000)).toISOString();
    @track resPeriod = 1;
    @track resPrice = 100;
    @track newprice;

    connectedCallback() {
        getProduct({id: this.productId})
            .then(result => {
                this.product = JSON.parse(result);
                if(this.product.wifi == true) {
                    this.product.wifi = yes;
                } else {
                    this.product.wifi = no;
                }
                if(this.product.parking == true) {
                    this.product.parking = yes;
                } else {
                    this.product.parking = no;
                }
                if(this.product.elevator == true) {
                    this.product.elevator = yes;
                } else {
                    this.product.elevator = no;
                }
                if(this.product.kitchen == true) {
                    this.product.kitchen = yes;
                } else {
                    this.product.kitchen = no;
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
                                this.hours[j].class = hourcontainer2;
                            }
                            for(let i = 0; i < this.availableHours.length; i++) {
                                for(let j = 0; j < this.hours.length; j++) {
                                    if(this.hours[j].h == this.availableHours[i]) {
                                        this.hours[j].class = hourcontainer1;
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
                        this.hours[j].class = hourcontainer2;
                    }
                    for(let i = 0; i < this.availableHours.length; i++) {
                        for(let j = 0; j < this.hours.length; j++) {
                            if(this.hours[j].h == this.availableHours[i]) {
                                this.hours[j].class = hourcontainer1;
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
                    title: error,
                    message: dateerror,
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
                        this.hours[j].class = hourcontainer2;
                    }
                    for(let i = 0; i < this.availableHours.length; i++) {
                        for(let j = 0; j < this.hours.length; j++) {
                            if(this.hours[j].h == this.availableHours[i]) {
                                this.hours[j].class = hourcontainer1;
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
            if(hclass == hourcontainer1) {
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
                                        this.hours[j].class = hourcontainer2;
                                    }
                                    for(let i = 0; i < this.availableHours.length; i++) {
                                        for(let j = 0; j < this.hours.length; j++) {
                                            if(this.hours[j].h == this.availableHours[i]) {
                                                this.hours[j].class = hourcontainer1;
                                                continue;
                                            }
                                        }
                                    }
                                }            
                            })
                        this.showEventModal = false;
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: success,
                                message: meetingsuccess,
                                variant: 'success'
                            })
                        );
                    })
            }
        } else if(this.meetingDate < dd) {
            this.meetingDate = new Date(new Date().getTime() + (1*24*60*60*1000)).toISOString();
            this.dispatchEvent(
                new ShowToastEvent({
                    title: error,
                    message: dateerror,
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
                                    this.hours[j].class = hourcontainer2;
                                }
                                for(let i = 0; i < this.availableHours.length; i++) {
                                    for(let j = 0; j < this.hours.length; j++) {
                                        if(this.hours[j].h == this.availableHours[i]) {
                                            this.hours[j].class = hourcontainer1;
                                            continue;
                                        }
                                    }
                                }
                            }            
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

    saveReservation() {
        reservationCreate({whatId: this.product.id, whoId: this.userId, agentId: this.product.agentId, noDays: this.resPeriod})
            .then(result => {
                getProduct({id: this.productId})
                    .then(result => {
                        this.product = JSON.parse(result);
                        if(this.product.wifi == true) {
                            this.product.wifi = yes;
                        } else {
                            this.product.wifi = no;
                        }
                        if(this.product.parking == true) {
                            this.product.parking = yes;
                        } else {
                            this.product.parking = no;
                        }
                        if(this.product.elevator == true) {
                            this.product.elevator = yes;
                        } else {
                            this.product.elevator = no;
                        }
                        if(this.product.kitchen == true) {
                            this.product.kitchen = yes;
                        } else {
                            this.product.kitchen = no;
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
                                        this.hours[j].class = hourcontainer2;
                                    }
                                    for(let i = 0; i < this.availableHours.length; i++) {
                                        for(let j = 0; j < this.hours.length; j++) {
                                            if(this.hours[j].h == this.availableHours[i]) {
                                                this.hours[j].class = hourcontainer1;
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
                        title: success,
                        message: reservationsuccess,
                        variant: 'success'
                    })
                );
            })
    }

    quoteCreation() {
        quoteCreate({whatId: this.product.id, whoId: this.userId, agentId: this.product.agentId})
            .then(result => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: success,
                        message: quotesuccess,
                        variant: 'success'
                    })
                );
            })
    }
}   