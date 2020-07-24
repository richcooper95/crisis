import React, { Component } from 'react'
import SidebarIcon from './SidebarIcon'
import SidebarContent from './SidebarContent'

export default class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
    }
  }
  
  toggleSidebar = () => {
    this.setState(prevState => ({
      isOpen: !prevState.isOpen
    }))
  }
  
  render() {
    return <div className="sidebar-container">
      <div className="sidebar-icon">
        <SidebarIcon
          isOpen={this.state.isOpen}
          handleClick={this.toggleSidebar}
        />
      </div>
      <SidebarContent
        isOpen={this.state.isOpen}
        onSidebarSelect={s => this.props.onSidebarSelect(s)}
        sidebarSelect={this.props.sidebarSelect}
      />
    </div>
  }
}