import React from "react";

class CounterErrorBoundaries extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(err) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          ERROR
        </div>
      );
    }
    return <>{this.props.children}</>;
  }
}

export default CounterErrorBoundaries;