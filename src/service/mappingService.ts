import { handleResponse } from "./serviceHelper";

export async function saveMapping(mappingInputs: { installationId: string; tenantId: string; subscriptionId: string; }) {
    var url = " https://bandhanv1.azurewebsites.net/api/installation-scopes";
    return fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }),
        body: JSON.stringify({
            "InstallationId": parseInt(mappingInputs.installationId),
            "TenantId": mappingInputs.tenantId,
            "SubscriptionId": mappingInputs.subscriptionId
        })
    }).then(responseJson => {
        return handleResponse(responseJson);  
    }).catch(error => {
        throw error;
    });
}