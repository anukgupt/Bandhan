export function handleResponse(responseJson: any) {
    console.log(responseJson);
    if (responseJson && responseJson.status) {
        if (responseJson.status === 200 || responseJson.status === 201) {
            return responseJson.json().then((data: any) => {
                console.log(data)
                return data;
            });
        } else {
            if (responseJson.status === 400) {
                return responseJson.json().then((data: any) => {
                    throw new Error(data.Message);
                });
            } else {
                throw new Error("Error occured, try again later");
            }
        }
    }
}