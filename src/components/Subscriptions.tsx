import React from 'react';
import { config } from '../configs/Config';
import { getSubscriptions } from '../service/subscriptionService';
import withAuthProvider, { AuthComponentProps } from '../providers/AuthProvider';

interface SubscriptionState {
  subscriptions: {
    value: any[]
  },
  currentTenantId: string
}

interface subscriptionProps {
  tenantId: string
}

export class Subscription extends React.Component<any, SubscriptionState> {
  constructor(props: any) {
    super(props);

    this.state = {
      subscriptions: {
        value: []
      },
      currentTenantId: ''
    };
  }

  async componentDidUpdate() {
    try {
      if (this.props.tenantId !== this.state.currentTenantId) {
        if (this.props.tenantId) {
          this.setState({
            currentTenantId: this.props.tenantId
          });
          var accessToken = await this.props.getAccessToken(this.props.tenantId, config.azureApiScopes);
          var subscriptions = await getSubscriptions(accessToken);
          if (subscriptions && subscriptions.value && subscriptions.value.length > 0) {
            this.props.setSubscriptionId(subscriptions.value[0].subscriptionId);
          }
          this.setState(
            {
              subscriptions: subscriptions,
              currentTenantId: this.props.tenantId
            });
        } else {
          this.setState({
            subscriptions: {
              value: []
            },
            currentTenantId: ''
          });
        }
      }
    }
    catch (err) {
      this.props.setError('ERROR', JSON.stringify(err));
    }
  }

  render() {
    return (
      <div className="flex-column">
        <label className="bolt-formitem-label body-m">Select your Azure Subscription</label>
        <select className="dropdown" onChange={(event) => {
                  this.props.setSubscriptionId(event.target.value)
              }}>
              {
                this.state.subscriptions && this.state.subscriptions.value &&
                this.state.subscriptions.value.length > 0 &&
                this.state.subscriptions.value.map(subscription =>
                  <option key={subscription.subscriptionId} value={subscription.subscriptionId}>
                    {subscription.displayName}
                  </option>
                )
              }
            </select>
      </div>
    );
  }
}

export default withAuthProvider(Subscription);