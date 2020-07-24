import React from 'react'
import { Transition } from 'react-transition-group'
import { Home, PersonAdd, Add, Remove, Search, Help } from '@material-ui/icons';

const duration = 100

const sidebarStyle = {
  transition: `width ${duration}ms`
}

const sidebarTransitionStyles = {
  entering: { width: 0 },
  entered: { width: '180px' },
  exiting: { width: '180px' },
  exited: { width: 0 }
}

const linkStyle = {
  transition: `opacity ${duration}ms`
}

const linkTransitionStyles = {
  entering: { opacity: 0 },
  entered: { opacity: 1 },
  exiting: { opacity: 1 },
  exited: { opacity: 0 }
}

const sidebarButtonNames = {
    "home": "Home",
    "assign": "Assign Coach",
    "add": "Add Coach",
    "remove": "Remove Coach",
    "search": "Search",
    "help": "Help & Support",
}

const highlightStyle = {
  borderRight: '5px solid rgb(172, 17, 17)',
  backgroundColor: 'rgba(255, 124, 128, 0.8)',
}

export default class SidebarContent extends React.Component {
  renderLink = (icon, intName) => {
    return (
        <div
          className="sidebar-link"
          onClick={() => this.props.onSidebarSelect(intName)}
          style={(this.props.sidebarSelect === intName) ? highlightStyle : {}}
        >
          {icon}    {sidebarButtonNames[intName]}
        </div>
    )
  }

  renderLinks = () => {
    return <Transition in={this.props.isOpen} timeout={duration}>
      {(state) => (
        <div style={{
          ...linkStyle,
          ...linkTransitionStyles[state]
        }}>
          {this.renderLink(<Home />, "home")}
          {this.renderLink(<PersonAdd />, "assign")}
          {this.renderLink(<Add />, "add")}
          {this.renderLink(<Remove />, "remove")}
          {this.renderLink(<Search />, "search")}
          {this.renderLink(<Help />, "help")}
        </div>
      )}
    </Transition>
  }
  
  render() {
    return <Transition in={this.props.isOpen} timeout={duration}>
      {(state) => (
        <div className="sidebar" style={{
          ...sidebarStyle,
          ...sidebarTransitionStyles[state]
        }}>
          {this.renderLinks()}
        </div>
      )}
    </Transition>
  }
}