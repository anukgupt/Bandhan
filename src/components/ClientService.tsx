import React from 'react';
import { getClientServices } from '../service/clientPermissionService';
import MultiSelect from "react-multi-select-component";

interface ClientServiceState {
  clientServices: any[]
}

class ClientService extends React.Component<any, ClientServiceState> {
  constructor(props: any) {
    super(props);

    this.state = {
      clientServices: []
    };
  }

  async componentDidMount() {
    try {
      let clientServ = await getClientServices();
      this.setState({ clientServices: clientServ });
    }
    catch (err) {
      this.props.setError('ERROR', JSON.stringify(err));
    }
  }
  render() {
    const options = [
      { label: "Grapes 🍇", value: "grapes" },
      { label: "Mango 🥭", value: "mango" },
      { label: "Strawberry 🍓", value: "strawberry", disabled: true },
      { label: "Watermelon 🍉", value: "watermelon" },
      { label: "Pear 🍐", value: "pear" },
      { label: "Apple 🍎", value: "apple" },
      { label: "Tangerine 🍊", value: "tangerine" },
      { label: "Pineapple 🍍", value: "pineapple" },
      { label: "Peach 🍑", value: "peach" },
    ];
    return (
      <div className="flex-column">
              <label className="bolt-formitem-label body-m">Select Azure services</label>
              <select className="flex-column flex-center dropdown tenantDropdown" onChange={(event) => {
                  console.log(event.target.value);
              }} multiple>
                <option value="ignore"></option>
                {
                  this.state.clientServices &&
                  this.state.clientServices.length > 0 &&
                  this.state.clientServices.map(client =>
                    <option key={client.ClientId} value={client.ClientId}>
                      {client.ClientId}
                    </option>
                  )
                }
              </select>
              <MultiSelect
        options={options}
        value={[]}
        onChange={undefined}
        labelledBy={"Select"}
      />
      </div>
    );
  }
}

export default ClientService;