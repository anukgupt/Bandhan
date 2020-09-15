export async function getClientServices() {
    var url = "https://localhost:44381/api/client-permissions";
    return fetch(url, {
      method: 'GET'
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