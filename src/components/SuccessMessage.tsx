import React from 'react';

interface SuccessMessageProps {
  message : string;
}

export default class SuccessMessage extends React.Component<SuccessMessageProps> {
  render() {
    return (
      <p>
        <img src="success.png" height="4%" width="4%" alt="Azure logo" />
        <span className="mb-3 successmsg">{this.props.message}</span>
      </p>
    );
  }
}