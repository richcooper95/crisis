import React from "react";

import { BlankForm } from "./Forms";
import * as cmn from "../cmn.js";

const displays = {
  FORM: "form",
  LOADING: "loading",
};

export default class Add extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmitConfirm = this.handleSubmitConfirm.bind(this);
    this.state = {
      display: displays.FORM,
    };
  }

  handleSubmitConfirm(form_data) {

    console.log("Confirmed form: " + JSON.stringify(form_data));
    this.setState({ display: displays.LOADING });

    fetch(cmn.getApiUrlBase() + "coaches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form_data),
    })
      .then((response) => {
        if (!response.ok) {
          console.error(
            "Failed to submit, got response code: " + response.status
          );
          response.text().then((text) => alert(`An error occured: ${text}`));
        } else {
          console.log(
            "Successfully submitted with response: " + response.status
          );
          alert(`Coach ${form_data.name} was successfully added`);
        }
        this.setState({ display: displays.FORM });
      })
      .catch((error) => {
        console.error("There was a problem: " + error);
        alert(`An error occured: ${error}`);
        this.setState({ display: displays.FORM });
      });
  }

  render() {
    var display = null;

    switch (this.state.display) {
      case displays.FORM:
        display = (
          <AddForm
            handleSubmitConfirm={this.handleSubmitConfirm}
          />
        );
        break;

      case displays.LOADING:
        display = <cmn.LoaderDisplay />;
        break;

      default:
        // TODO: Sensible default here? Or maybe just make the form the default?
        break;
    }

    return display;
  }
}

/* 
 * Defines a form that allows for searching of coaches based on specified
 * traits
 */
class AddForm extends BlankForm {
  constructor(props) {
    super(props);
    this.onSubmit = this.handleSubmitFullForm;
  }
}
