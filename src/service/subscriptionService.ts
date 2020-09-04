export async function getSubscriptions(accessToken: string) {
  var url = "https://management.azure.com/subscriptions?api-version=2020-01-01";
  var bearer = 'Bearer ' + accessToken;
  return fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': bearer
    }
  }).then(responseJson => {
    console.log(responseJson);
    return responseJson.json().then(data => {
      console.log(data)
      return data
    });
  })
    .catch(error => {
      console.log(error);
    });
}