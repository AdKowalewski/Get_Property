({
    initValues : function(component, event, helper) {
        let userId = $A.get('$SObjectType.CurrentUser.Id');
        if(userId == null) {
            component.set('v.isLoggedIn', false);
            component.set('v.isNotLoggedIn', true);
        } else if(userId != null) {
            component.set('v.isLoggedIn', true);
            component.set('v.isNotLoggedIn', false);
            let action = component.get('c.getCasesAura');
            action.setParams({
                'whoId': userId
            });
            action.setCallback(this, function(response) {
                component.set('v.myCases', response.getReturnValue());
                if(component.get('v.myCases').length > 0) {
                    component.set('v.areCases', true);
                    component.set('v.areNotCases', false);
                } else if(component.get('v.myCases').length = 0) {
                    component.set('v.areCases', false);
                    component.set('v.areNotCases', true);
                }
            });
            $A.enqueueAction(action);
        }

        let types = [
            {value: 'Payment', label: 'Payment'},
            {value: 'Technical', label: 'Technical'},
            {value: 'Invoicing', label: 'Invoicing'}
        ];
        component.set('v.types', types);
    },

    comboboxChange : function(component, event, helper) {
        component.set('v.typeName', event.getParam('value'));
        console.log('type now is: ' + component.get('v.typeName'));
    },

    itemsChange : function(component, event, helper) {        
        let appEvent = $A.get("e.selfService:caseCreateFieldChange");
        appEvent.setParams({
            'modifiedField': event.getSource().get('v.fieldName'),
            'modifiedFieldValue': event.getSource().get('v.value')
        });
        appEvent.fire();
    },

    submitForm: function(component, event, helper) {
        let userId = $A.get('$SObjectType.CurrentUser.Id');
        let action = component.get('c.createCase');
        action.setParams({
            'whoId': userId,
            'subject': component.find('subjectId').get('v.value'),
            'caseType': component.get('v.typeName'),
            'description': component.find('descriptionId').get('v.value')
        });
        action.setCallback(this, function(response) {
            component.set('v.typeName', '');
            component.find('subjectId').set('v.value', '');
            component.find('descriptionId').set('v.value', '');

            let action1 = component.get('c.getCasesAura');
            action1.setParams({
                'whoId': userId
            });
            action1.setCallback(this, function(response1) {
                component.set('v.myCases', response1.getReturnValue());
                if(component.get('v.myCases').length > 0) {
                    component.set('v.areCases', true);
                    component.set('v.areNotCases', false);
                } else if(component.get('v.myCases').length = 0) {
                    component.set('v.areCases', false);
                    component.set('v.areNotCases', true);
                }
            });
            $A.enqueueAction(action1);

            let toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                'title': 'Success',
                'message': 'Case has been created successfully',
                'type': 'success'
            });
            toastEvent.fire();
        });
        $A.enqueueAction(action);
    }
})
