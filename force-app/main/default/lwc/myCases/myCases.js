import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import casesGet from '@salesforce/apex/CaseController.getCases';
import UserId from '@salesforce/user/Id';

export default class MyCases extends LightningElement {

    @track myCases = [];
    @track userId = UserId;

    get areCases() {
        let flag = false;
        if(this.myCases.length > 0) {
            flag = true;
        } else if(this.myCases.length == 0) {
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
        casesGet({whoId: this.userId})
            .then(result => {
                if(result) {
                    this.myCases = JSON.parse(result);
                }
            })
    }
}