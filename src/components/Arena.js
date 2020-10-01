import React from 'react';
import Assign from './Assign';
import Add from './Add';

export default class Arena extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: "idle",
    }
  }

  renderAssign() {
    return (<Assign />)
  }

  renderAdd() {
    return (<Add />)
  }

  renderHelp() {
    return (
      <div>
        <h4>
          Bugs and Other Issues
        </h4>
        <p>
          To report a bug, please raise a <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/richcooper95/crisis/issues"
          >Github issue</a> or email <a href="mailto:richwjcooper@me.com" >
          Rich Cooper</a>.
        </p>
      </div>
    )
  }

  renderHome() {
    return (
      <div>
        <h4>
          Welcome to the Crisis Coach Assignment tool!
        </h4>
        <p>
          This app is designed to aid assigning a Coach to a new Crisis Member,
          by maintaining a database of Crisis Coaches and providing a
          recommendation based on relevant information about the new Member.
        </p>
        <p>
          Check out the menu options to the left to see what it can do!
        </p>
      </div>
    )
  }

  renderSelected() {
    switch (this.props.sidebarSelect) {
      case "help":
        return this.renderHelp();

      case "assign":
        return this.renderAssign();

      case "add":
        return this.renderAdd();

      case "home":
        return this.renderHome();

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