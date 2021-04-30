import React from 'react';
import {AmplifyAuthenticator, AmplifySignIn, AmplifySignOut} from '@aws-amplify/ui-react';
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
    var app =
      <div className="app">
        <Sidebar
          onSidebarSelect={s => this.handleSidebarSelect(s)}
          sidebarSelect={this.state.sidebarSelect}
        />
        <div className="app-title">
          <h1>
            Crisis Coach Assignment Tool
          </h1>
        </div>
        <div className="app-title-image" >
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://crisis.org.uk"
          >
            <img
              src="logo-crisis.png"
              alt="Crisis title logo"
              height="80"
              style={{float: "right"}}
            />
          </a>
        </div>
        <Arena sidebarSelect={this.state.sidebarSelect}/>
      </div>
    ;

    if (process.env.NODE_ENV === "production") {
      app =
        <AmplifyAuthenticator>
          { process.env.NODE_ENV === "production" &&
            <AmplifySignIn slot="sign-in" hideSignUp={true} /> }
          {app}
          { process.env.NODE_ENV === "production" && <AmplifySignOut/> }
        </AmplifyAuthenticator>;
    }

    return(app);
  }
}