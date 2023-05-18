({
    onInit : function(component, event, helper) {
        let action = component.get("c.sendEmail");
        action.setParams({
            quoteId: component.get("v.recordId")
        });
        action.setCallback(this, function(response) {
            let state = response.getState();
            if(state == "SUCCESS") {
                $A.get("e.force:closeQuickAction").fire();
                $A.get("e.force:refreshView").fire();
                let showToast = $A.get("e.force:showToast");
                showToast.setParams({
                    title: 'Success',
                    message: 'Email was sent successfully',
                    type: 'success'
                });
                showToast.fire();
            } else {
                let showToast = $A.get("e.force:showToast");
                showToast.setParams({
                    title: 'Error',
                    message: 'Email was not sent',
                    type: 'error'
                });
                showToast.fire();
            }
        });
        $A.enqueueAction(action);
    }
})
