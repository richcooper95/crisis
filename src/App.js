import React from 'react';
import './index.css';
import Sidebar from './components/Sidebar';
import Arena from './components/Arena';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sidebarSelect: "home",
      status: "idle",
    }
  }

  handleSidebarSelect(sidebarSelect) {
    this.setState(
      {
        sidebarSelect: sidebarSelect,
      }
    )
  }

  render() {
    return (
      <div className="app">
        <Sidebar
          onSidebarSelect={s => this.handleSidebarSelect(s)}
          sidebarSelect={this.state.sidebarSelect}
        />
        <div className="app-title">
          <h1>
            Coach Assignment App
          </h1>
        </div>
        <div className="app-title-image" >
          <img src="logo-crisis.png" alt="Crisis title logo" height="80" style={{float: "right"}}/>
        </div>
        <Arena sidebarSelect={this.state.sidebarSelect}/>
      </div>
    )
  }
}