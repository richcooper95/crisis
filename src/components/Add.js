import React from "react";
import Loader from "react-loader-spinner";
import { BlankForm } from "./Forms";
//import 'react-confirm-alert/src/react-confirm-alert.css';


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

    // Hardcode to localhost:8000 for development mode.
    fetch("http://localhost:8000/api/v1/coaches", {
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
        display = <AddLoader />;
        break;

      default:
        // TODO: Sensible default here? Or maybe just make the form the default?
        break;
    }

    return display;
  }
}

function AddLoader(props) {
  return (
    // @@@ This doesn't seem to justify the spinner in the centre...
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Loader type="TailSpin" color="#EC2229" height={80} width={80} />
    </div>
  );
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