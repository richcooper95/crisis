import React from 'react';

export default class Arena extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: "idle",
    }
  }

  renderSelected() {
    switch (this.props.sidebarSelect) {
      case "help":
        return (
        <div>
          <p>
            For technical support, please email <a href="mailto:richwjcooper@me.com" >Rich Cooper</a>.
          </p>
        </div>
        );

      default:
        return (this.props.sidebarSelect);
    }
  }

  render() {
    return (
      <div className="arena">
        {this.renderSelected()}
      </div>
    )
  }
}