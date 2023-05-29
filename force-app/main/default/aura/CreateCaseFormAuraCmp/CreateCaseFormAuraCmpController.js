({
    initValues : function(component, event, helper) {
        let types = [
            {value: 'Payment', label: 'Payment'},
            {value: 'Technical', label: 'Technical'},
            {value: 'Invoicing', label: 'Invoicing'}
        ];
        component.set('v.types', types);
        component.set('v.typeVal', 'Payment');
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
            'type': component.find('typeId').get('v.value'),
            'description': component.find('descriptionId').get('v.value')
        });
        action.setCallback(this, function(response) {
            component.set('v.typeVal', 'Payment');
            component.set('v.subjectVal', '');
            component.set('v.descriptionVal', '');
            let toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                'title': 'Success',
                'message': 'Case has been created successfully',
                'variant': 'success'
            });
            toastEvent.fire();
        });
        $A.enqueueAction(action);
    }
})
