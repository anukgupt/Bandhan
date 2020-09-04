import React from 'react';

interface ErrorMessageProps {
  message : string;
}

export default class ErrorMessage extends React.Component<ErrorMessageProps> {
  render() {
    return (
      <p>
        <img src="error.png" height="4%" width="4%" alt="Azure logo" />
        <span className="mb-3 errormsg">{this.props.message}</span>
      </p>
    );
  }
}