import React from 'react';
import { config } from '../configs/Config';
import { getTenants } from '../service/tenantService';
import withAuthProvider from '../providers/AuthProvider';
import Subscriptions from './Subscriptions';

interface TenantsState {
  tenants: {
    value: any[]
  },
  selectedTenant: string
}

class Tenants extends React.Component<any, TenantsState> {
  constructor(props: any) {
    super(props);

    this.state = {
      tenants: {
        value: []
      },
      selectedTenant: ''
    };
  }

  async componentDidMount() {
    try {
      this.props.clearState();
      let accessToken = await this.props.getAccessToken('', config.azureApiScopes);
      let tenants = await getTenants(accessToken);
      this.setState({ tenants: tenants });
    }
    catch (err) {
      this.props.setError('ERROR', JSON.stringify(err));
    }
  }
  render() {
    let subscriptionProps: any = {
      ...this.props,
      tenantId: this.state.selectedTenant
    };
    return (
      <div className="flex-column">
              <label className="bolt-formitem-label body-m">Select your Azure Tenant</label>
              <select className="flex-column flex-center dropdown tenantDropdown" onChange={(event) => {
                event.target.value === "ignore" ? this.setState({ selectedTenant: '' }) :
                  this.setState({ selectedTenant: event.target.value })
                  this.props.setTenantId(event.target.value);
                  this.props.clearState();
              }}>
                <option value="ignore"></option>
                {
                  this.state.tenants && this.state.tenants.value &&
                  this.state.tenants.value.length > 0 &&
                  this.state.tenants.value.map(tenant =>
                    <option key={tenant.tenantId} value={tenant.tenantId}>
                      {tenant.displayName}
                    </option>
                  )
                }
              </select>

        <Subscriptions {...subscriptionProps}></Subscriptions>
      </div>
    );
  }
}

export default withAuthProvider(Tenants);