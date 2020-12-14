import React from "react";
import { Multiselect } from "multiselect-react-dropdown";
import { CoachForm, BlankForm } from "./Forms";
// import { useTable } from 'react-table';

const levelOfNeedOpts = [
  { type: 1, desc: "1 - No intervention necessary" },
  { type: 2, desc: "2 - Signpost to other resources" },
  { type: 3, desc: "3 - Information, advice and guidance (IAG)" },
  { type: 4, desc: "4 - Coaching and skills" },
  { type: 5, desc: "5 - Coaching engagement skills" },
  { type: 6, desc: "6 - Intensive support needed" },
];

const rightsStatusOpts = [
  { type: 1, desc: "1 - No intervention necessary" },
  { type: 2, desc: "2 - No recourse to public funds" },
];

const housingStatusOpts = [
  { type: 1, desc: "1 - No intervention necessary" },
  { type: 2, desc: "2 - At risk" },
  { type: 3, desc: "3 - Unsuitable temporary accommodation" },
  { type: 4, desc: "4 - Rough sleeping" },
];

const displays = {
  DELETE: "delete",
  EDIT: "edit",
  LOADING: "loading",
  SEARCH: "search",
  TABLE: "table",
};

/**
 * Capitalise the first letting of str.
 *
 * @param {String} str String to capitalise the first letter of.
 */
function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Obtain all entries in database.
 */
function get_coaches() {
  fetch("http://localhost:8000/api/v1/coaches/", {
    method: "GET",
  })
    .then((response) => {
      if (!response.ok) {
        console.error(
          "Failed to get all coaches, got response code: " + response.status
        );
        response.text().then((text) => alert(`An error occured: ${text}`));
      } else {
        return response.body;
      }
    })
    .catch((error) => {
      console.error("There was a problem: " + error);
      alert(`An error occured: ${error}`);
    });
}

/**
 * Obtain entry for coach_id
 */
function get_coach(coach_id) {
  fetch("http://localhost:8000/api/v1/coaches/" + coach_id, {
    method: "GET",
  })
    .then((response) => {
      if (!response.ok) {
        console.error(
          "Failed to get coaches information, got response code: " +
            response.status
        );
        response.text().then((text) => alert(`An error occured: ${text}`));
      } else {
        return response.json();
      }
    })
    .catch((error) => {
      console.error("There was a problem: " + error);
      alert(`An error occured: ${error}`);
    });
}

/*
 * Class defines edit page.
 */
export default class Edit extends React.Component {
  constructor(props) {
    super(props);
    this.handleDeleteConfirm = this.handleDeleteConfirm.bind(this);
    this.handleEditConfirm = this.handleEditConfirm.bind(this);
    this.handleSearchConfirm = this.handleSearchConfirm.bind(this);
    this.state = {
      display: displays.SEARCH,
    };
  }

  /**
   * Delete a coach from the database.
   *
   * @param {Number} coach_id The ID of the coach to remove.
   */
  handleDeleteConfirm(coach_id) {
    console.log("Confirmed delete" + coach_id);
    this.setState({ display: displays.LOADING });

    // Hardcode to localhost:8000 for development mode.
    fetch("http://localhost:8000/api/v1/coaches/" + coach_id, {
      method: "DELETE",
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
          alert(`Coach was successfully deleted`);
        }
        this.setState({ display: displays.TABLE });
      })
      .catch((error) => {
        console.error("There was a problem: " + error);
        alert(`An error occured: ${error}`);
        this.setState({ display: displays.FORM });
      });
  }

  /**
   * Edit an existing coach.
   *
   * @param {Number} coach_id  The ID of the coach to edit.
   * @param {Object} form_data The updated form data for the coach.
   */
  handleEditConfirm(coach_id, form_data) {
    console.log("Confirmed form: " + JSON.stringify(form_data));
    this.setState({ display: displays.LOADING });

    // Hardcode to localhost:8000 for development mode.
    fetch("http://localhost:8000/api/v1/coaches/" + coach_id, {
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
          alert(`Coach ${form_data.name} was successfully updated`);
        }
        this.setState({ display: displays.FORM });
      })
      .catch((error) => {
        console.error("There was a problem: " + error);
        alert(`An error occured: ${error}`);
        this.setState({ display: displays.FORM });
      });
  }

  /**
   * Search for all coaches matching form_data.
   *
   * @param {Object} form_data The updated form data for the coach.
   */
  handleSearchConfirm(form_data) {
    // Poll server for all forms matching data.
    // Set to table display with correct values.
    console.error("Not defined yet");
  }

  /**
   * Return the page to display.
   */
  render() {
    var display = null;

    switch (this.state.display) {
      case displays.DELETE:
        // display = (
        //   <DeleteConfirmation handleDeleteConfirm={this.handleDeleteConfirm} />
        // );
        display = "delete";
        break;

      case displays.EDIT:
        display = <EditForm handleEditConfirm={this.handleEditConfirm} />;
        break;

      case displays.LOADING:
        display = <Loader />;
        break;

      case displays.TABLE:
        // display = <CoachesTable />;
        display = "foo";
        break;

      case displays.SEACH:
      default:
        display = <SearchForm handleEditConfirm={this.handleSearchConfirm} />;
        break;
    }

    return display;
  }
}

/**
 * Return loader for spinner.
 */
function Loader(props) {
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

/**
 * Defines a form that allows users to edit a coach entry.
 */
class EditForm extends CoachForm {
  constructor(props, coach_id) {
    super(props);

    /*
     * Set submit function - inheritted from base class.
     */
    this.onSubmit = this.handleSubmitFullForm;

    /**
     * Set the starting state to the current coach information.
     *
     * @@@ set to get_coach() once working.
     */
    this.state = {
      coach_id: coach_id,
      birthYear: 1000,
      name: "hello",
      gender: "Male",
      available: true,
      bio: "pii",
      languages: {
        english: { type: 1, desc: "1 - Good" },
        french: { type: 2, desc: "2 - Good" },
      },
      needLevels: [
        { type: 1, desc: "1 - No intervention necessary" },
        { type: 2, desc: "2 - No recourse to public funds" },
      ],
      rightsLevels: [
        { type: 1, desc: "1 - No intervention necessary" },
        { type: 2, desc: "2 - No recourse to public funds" },
      ],
      housingLevels: [
        { type: 1, desc: "1 - No intervention necessary" },
        { type: 2, desc: "2 - At risk" },
        { type: 3, desc: "3 - Unsuitable temporary accommodation" },
        { type: 4, desc: "4 - Rough sleeping" },
      ],
    };
  }

  /*
   * Return HTML for the edit form with values pre-filled.
   *
   * Call this.onSubmit on form submission.
   */
  render() {
    /*
     * Obtain list of acceptable DoBs.
     */
    var yearOfBirthList = [];
    let currentYear = new Date().getFullYear();
    for (let i = currentYear; i > currentYear - 80; i--) {
      yearOfBirthList.push(i);
    }

    return (
      <div>
        <form
          onSubmit={this.onSubmit}
          onKeyPress={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
        >
          <div className="edit-form-left">
            <label htmlFor="name">
              <h4>Name:</h4>
              <p>Enter the Coach's name.</p>
              <input
                value={this.state.name}
                type="text"
                name="name"
                className="name-input"
                onChange={this.onNameChange}
              />
            </label>

            <label htmlFor="age">
              <h4>Birth Year:</h4>
              <p>Enter the Coach's year of birth.</p>
              <Multiselect
                options={yearOfBirthList}
                isObject={false}
                closeIcon="cancel"
                selectedValues={[this.state.birthYear]}
                avoidHighlightFirstOption
                singleSelect
                onSelect={this.onYearOfBirthChange}
                onRemove={this.onYearOfBirthChange}
              />
            </label>

            <label>
              <h4>Available:</h4>
              Tick the box if the Coach is available:
              <input
                name="isAvailable"
                type="checkbox"
                checked={this.state.available}
                onChange={this.onAvailableChange}
              />
            </label>

            <label htmlFor="gender">
              <h4>Gender:</h4>
              <p>Enter the Coach's gender.</p>
              <Multiselect
                options={["Male", "Female", "Non-binary"]}
                isObject={false}
                closeIcon="cancel"
                selectedValues={[capitalise(this.state.gender)]}
                avoidHighlightFirstOption
                singleSelect
                onSelect={this.onGenderChange}
                onRemove={this.onGenderChange}
              />
            </label>

            <label htmlFor="languages">
              <h4>Languages:</h4>
              <p>Enter all languages spoken by the Coach.</p>
              <Multiselect
                options={["English", "French", "German"]}
                isObject={false}
                onSelect={this.onLanguagesAdd}
                onRemove={this.onLanguagesRemove}
                closeIcon="cancel"
                selectedValues={Object.keys(this.state.languages).map(
                  capitalise
                )}
                avoidHighlightFirstOption
                style={{ chips: { background: "rgba(236, 34, 41, 0.934)" } }}
              />
            </label>

            <label htmlFor="proficiencies">
              {/*
                Only include proficiencies option if any languages selected
              */}
              {Object.keys(this.state.languages).length === 0 ? (
                <p> No language selected. </p>
              ) : (
                this.renderLanguageProficiencies()
              )}
            </label>
          </div>

          <div className="edit-form-right">
            <label htmlFor="need">
              <h4>Level of Need:</h4>
              <p>Enter levels of need the Coach has experience with.</p>
              <Multiselect
                options={levelOfNeedOpts}
                displayValue="desc"
                onSelect={this.onNeedChange}
                onRemove={this.onNeedChange}
                closeIcon="cancel"
                selectedValues={this.state.needLevels}
                avoidHighlightFirstOption
                style={{ chips: { background: "rgba(236, 34, 41, 0.934)" } }}
              />
            </label>

            <label htmlFor="rights">
              <h4>Rights Status:</h4>
              <p>Enter the rights statuses the Coach has experience with.</p>
              <Multiselect
                options={rightsStatusOpts}
                displayValue="desc"
                onSelect={this.onRightsChange}
                onRemove={this.onRightsChange}
                closeIcon="cancel"
                selectedValues={this.state.rightsLevels}
                avoidHighlightFirstOption
                style={{ chips: { background: "rgba(236, 34, 41, 0.934)" } }}
              />
            </label>

            <label htmlFor="housing">
              <h4>Housing Status:</h4>
              <p>Enter the housing statuses the Coach has experience with.</p>
              <Multiselect
                options={housingStatusOpts}
                displayValue="desc"
                onSelect={this.onHousingChange}
                onRemove={this.onHousingChange}
                closeIcon="cancel"
                selectedValues={this.state.housingLevels}
                avoidHighlightFirstOption
                style={{ chips: { background: "rgba(236, 34, 41, 0.934)" } }}
              />
            </label>

            <label htmlFor="bio">
              <h4>Biography:</h4>
              Enter a short biography about the Coach (optional):
              <textarea onChange={this.onBioChange} value={this.state.bio} />
            </label>
          </div>

          <div className="edit-form-submit">
            <button type="submit">Submit</button>
          </div>

          <div className="edit-form-cancel">
            <button type="cancel">Cancel</button>
          </div>
        </form>
      </div>
    );
  }
}

/*
 * Defines a form that allows for searching of coaches based on specified
 * traits
 */
class SearchForm extends BlankForm {
  constructor(props) {
    super(props);
    this.onSubmit = this.handleSubmitPartialForm;
  }
}
