import React from "react";
import { Multiselect } from "multiselect-react-dropdown";
import DataTable from "react-data-table-component";
import { confirmAlert } from "react-confirm-alert";

import { CoachForm, BlankForm } from "./Forms";
import * as cmn from "../cmn.js";

const displays = {
  EDIT: "edit",
  LOADING: "loading",
  SEARCH: "search",
  TABLE: "table",
};

/*
 * Class defines edit page.
 */
export default class Edit extends React.Component {
  constructor(props) {
    super(props);

    /*
     * Bind functions to class.
     */
    this.handleEditRequest = this.handleEditRequest.bind(this);
    this.handleEditCancel = this.handleEditCancel.bind(this);
    this.handleEditConfirm = this.handleEditConfirm.bind(this);
    this.handleDeleteConfirm = this.handleDeleteConfirm.bind(this);
    this.handleSearchConfirm = this.handleSearchConfirm.bind(this);
    this.handleTableCancel = this.handleTableCancel.bind(this);

    /*
     * Set starting state to search.
     */
    this.state = {
      display: displays.SEARCH,
    };
  }

  /**
   * Handle the user selecting to edit the coach with coachID from the table.
   *
   * @param {Number} coachID The ID of the coach to edit.
   */
  handleEditRequest(coachID) {
    // Set to edit display with correct values.
    // Save coachID as this.state.editID
    this.setState({ editID: coachID });
    this.setState({ display: displays.EDIT });
  }

  /**
   * Cancel the edit request and return to the table.
   */
  handleEditCancel() {
    console.log("Cancelling edit");
    this.setState({ display: displays.TABLE });
  }

  /**
   * UNFINISHED
   *
   * Edit an existing coach, then set display to the TABLE showing all searched
   * for coaches.
   *
   * @param {Number} coachID The ID of the coach to edit.
   * @param {Object} form_data The updated form data for the coach.
   */
  handleEditConfirm(form_data) {
    // Update db entry for form_data.coachID
    // Set to table display
    // Save all coaches as this.state.tableData
    alert(JSON.stringify(form_data));

    console.log("Confirmed form: " + JSON.stringify(form_data));
    this.setState({ display: displays.LOADING });

    this.setState({ display: displays.TABLE });
  }

  /**
   * UNFINISHED
   *
   * Remove a coach from the table
   *
   * @param coachID  the coach to remove from the table
   */
  removeCoachFromTable(coachID) {
    alert(`removed coach ${coachID} from the table`);
  }

  /**
   * UNFINISHED
   *
   * Delete a coach from the database and return display to the table.
   *
   * @param {Number} coachID The ID of the coach to remove.
   */
  handleDeleteConfirm(coachID) {
    // Remove coachID from db
    // Set to table display
    alert(`deleted coach ${coachID}`);

    console.log("Confirmed delete" + coachID);
    this.setState({ display: displays.LOADING });

    /*
     * Remove coach from table so coach isn't deleted/editted.
     */
    this.removeCoachFromTable(coachID);
    this.setState({ display: displays.TABLE });
  }

  /**
   * UNFINISHED
   *
   * Search for all coaches matching form_data and set display to table
   *
   * @param {Object} form_data The updated form data for the coach.
   */
  handleSearchConfirm(form_data) {
    // Poll server for all coaches matching data.
    // Set to table display
    // Save all coaches as this.state.tableData
    alert(JSON.stringify(form_data));

    console.log("Confirmed form: " + JSON.stringify(form_data));
    this.setState({ display: displays.LOADING });

    // @@@ Remove when properly implemented
    this.setState({
      tableData: [
        {
          coachID: 9999,
          birth_year: 1000,
          name: "hello",
          gender: "Male",
          available: true,
          bio: "pii",
          languages: {
            english: { type: 1, desc: "1 - Good" },
            french: { type: 2, desc: "2 - Good" },
          },
          need: [
            { type: 1, desc: "1 - No intervention necessary" },
            { type: 2, desc: "2 - No recourse to public funds" },
          ],
          rights: [
            { type: 1, desc: "1 - No intervention necessary" },
            { type: 2, desc: "2 - No recourse to public funds" },
          ],
          housing: [
            { type: 1, desc: "1 - No intervention necessary" },
            { type: 2, desc: "2 - At risk" },
            { type: 3, desc: "3 - Unsuitable temporary accommodation" },
            { type: 4, desc: "4 - Rough sleeping" },
          ],
        },
      ],
    });

    this.setState({ display: displays.TABLE });
  }

  /**
   * Cancel a search and return to the search form.
   */
  handleTableCancel() {
    console.log("Cancelling search, returning to search form");
    this.setState({ display: displays.SEARCH });
  }

  /**
   * Return the page to display.
   */
  render() {
    var display = null;

    switch (this.state.display) {
      case displays.EDIT:
        display = (
          <EditForm
            handleEditCancel={this.handleEditCancel}
            handleSubmitConfirm={this.handleEditConfirm}
            editID={this.state.editID}
          />
        );
        break;

      case displays.LOADING:
        display = <cmn.LoaderDisplay />;
        break;

      case displays.SEACH:
      default:
        display = <SearchForm handleSubmitConfirm={this.handleSearchConfirm} />;
        break;

      case displays.TABLE:
        display = (
          <CoachesTable
            handleDeleteConfirm={this.handleDeleteConfirm}
            handleEditRequest={this.handleEditRequest}
            handleTableCancel={this.handleTableCancel}
            tableData={this.state.tableData}
          />
        );
        break;
    }

    return display;
  }
}

/**
 * Defines a form that allows users to edit a coach entry.
 */
class EditForm extends CoachForm {
  constructor(props) {
    super(props);

    /*
     * Set submit function - inheritted from base class.
     */
    this.onSubmit = this.handleSubmitFullForm;
    this.onCancel = this.props.handleEditCancel;

    /**
     * Set the starting state to the current coach information.
     */
    this.state = this.getCoach(this.props.editID);
  }

  /**
   * UNFINISHED
   *
   * Obtain entry for coachID
   *
   * Doesn't work.
   */
  getCoach(coachID) {
    // Poll server data for coachID
    alert(`Loading data for coach ID ${coachID}`);

    // @@@ remove when implemented
    return {
      coachID: coachID,
      birth_year: 1000,
      name: "hello",
      gender: "Male",
      available: true,
      bio: "pii",
      languages: {
        english: 1,
        french: 2,
      },
      need: [
        { type: 1, desc: "1 - No intervention necessary" },
        { type: 2, desc: "2 - No recourse to public funds" },
      ],
      rights: [
        { type: 1, desc: "1 - No intervention necessary" },
        { type: 2, desc: "2 - No recourse to public funds" },
      ],
      housing: [
        { type: 1, desc: "1 - No intervention necessary" },
        { type: 2, desc: "2 - At risk" },
        { type: 3, desc: "3 - Unsuitable temporary accommodation" },
        { type: 4, desc: "4 - Rough sleeping" },
      ],
    };
  }

  /**
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
                selectedValues={[this.state.birth_year]}
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
                selectedValues={[cmn.capitalise(this.state.gender)]}
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
                  cmn.capitalise
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
                options={cmn.levelOfNeedOpts}
                displayValue="desc"
                onSelect={this.onNeedChange}
                onRemove={this.onNeedChange}
                closeIcon="cancel"
                selectedValues={this.state.need}
                avoidHighlightFirstOption
                style={{ chips: { background: "rgba(236, 34, 41, 0.934)" } }}
              />
            </label>

            <label htmlFor="rights">
              <h4>Rights Status:</h4>
              <p>Enter the rights statuses the Coach has experience with.</p>
              <Multiselect
                options={cmn.rightsStatusOpts}
                displayValue="desc"
                onSelect={this.onRightsChange}
                onRemove={this.onRightsChange}
                closeIcon="cancel"
                selectedValues={this.state.rights}
                avoidHighlightFirstOption
                style={{ chips: { background: "rgba(236, 34, 41, 0.934)" } }}
              />
            </label>

            <label htmlFor="housing">
              <h4>Housing Status:</h4>
              <p>Enter the housing statuses the Coach has experience with.</p>
              <Multiselect
                options={cmn.housingStatusOpts}
                displayValue="desc"
                onSelect={this.onHousingChange}
                onRemove={this.onHousingChange}
                closeIcon="cancel"
                selectedValues={this.state.housing}
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
            <button type="cancel" onClick={this.onCancel}>
              Cancel
            </button>
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

/*
 * Defines a table that displays all the coaches matching the search filter.
 */
class CoachesTable extends React.Component {
  /**
   * Return names and accessors of columns for the table.
   */
  getColumns() {
    return [
      {
        name: "Name",
        selector: "name",
      },
      {
        name: "Birth Year",
        selector: "birth_year",
      },
      {
        name: "Gender",
        selector: "gender",
      },
      {
        name: "Available",
        selector: "available",
      },
      {
        name: "Edit",
        selector: "editButton",
      },
      {
        name: "Delete",
        selector: "deteleButton",
      },
    ];
  }

  /**
   * Return delete confirmation message
   *
   * @param coachID the ID of the coach to delete
   */
  getDeleteConfirmationMessage(coachID) {
    return `Are you sure you want to delete coach ${coachID} from the database?`;
  }

  /**
   * Display confirm alert for deleting the coach from the db
   *
   * @param coachID the ID of the coach to delete
   */
  getDeleteConfirmCheck(coachID) {
    confirmAlert({
      title: "Confirm Coach Details",
      message: this.getDeleteConfirmationMessage(coachID),
      buttons: [
        {
          label: "Confirm",
          onClick: () => {
            this.props.handleDeleteConfirm(coachID);
          },
        },
        {
          label: "Go back",
        },
      ],
    });
  }

  /**
   * Return a button that, on click, loads the edit page for coachID.
   */
  getEditButton(coachID) {
    return (
      <div className="search-table-edit">
        <button onClick={() => this.props.handleEditRequest(coachID)}>
          Edit
        </button>
      </div>
    );
  }

  /**
   * Return a button that, on click, initiates the delete process for coachID
   */
  getDeleteButton(coachID) {
    return (
      <div className="search-table-delete">
        <button onClick={() => this.getDeleteConfirmCheck(coachID)}>
          Delete
        </button>
      </div>
    );
  }

  /**
   * Return a single row of a table with coachDetails entered
   */
  formatCoach(coachDetails) {
    return {
      name: coachDetails.name,
      birth_year: coachDetails.birth_year,
      gender: coachDetails.gender,
      available: coachDetails.available ? "true" : "false",
      editButton: this.getEditButton(coachDetails.coachID),
      deteleButton: this.getDeleteButton(coachDetails.coachID),
    };
  }

  /**
   * Return the data for the table.
   *
   * Return tableData formatted to only include name, age, gender and
   * availability.
   */
  getData() {
    return this.props.tableData.map(this.formatCoach, this);
  }

  /**
   * Return HTML for a table listing the name, age, gender and availability of
   * the coach, along with buttons to edit and delete the entry.
   */
  render() {
    const columns = this.getColumns();
    const data = this.getData();
    console.log(columns);
    console.log(data);
    return (
      <div>
        <div className="search-table-display">
          <DataTable title="Coaches" columns={columns} data={data} />
        </div>
        <div className="search-table-cancel">
          <button onClick={this.props.handleTableCancel}>
            Return to search
          </button>
        </div>
      </div>
    );
  }
}
