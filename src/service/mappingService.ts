import { handleResponse } from "./serviceHelper";

export async function saveMapping(mappingInputs: { installationId: string; tenantId: string; subscriptionId: string; }) {
    var url = " https://chmudili4.azurewebsites.net/api/InstallationIdScopes";
    return fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }),
        body: JSON.stringify({
            "InstallationId": parseInt(mappingInputs.installationId),
            "Tenant": mappingInputs.tenantId,
            "Subscription": mappingInputs.subscriptionId
        })
    }).then(responseJson => {
        return handleResponse(responseJson);  
    }).catch(error => {
        throw error;
    });
}