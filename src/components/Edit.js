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
   * Log error and set display state.
   *
   * @param error
   * @param dispalyState
   */
  reset_state_log_error(error, dispalyState) {
    alert(error);
    console.log(error);
    console.log(error.stack);
    this.setState({ display: dispalyState });
  }

  /**
   * Convert a list of coaches into a dictionary, from coachID:coachDetails
   */
  coachArrayToObject(coachArray) {
    var coachObjects = {};
    coachArray.forEach((coach) => {
      coachObjects[coach["id"]] = coach;
    });
    return coachObjects;
  }

  /**
   * Remove a coach from the table and set state to TABLE.
   *
   * @param coachID  the coach to remove from the table
   */
  removeCoachFromTable(coachID) {
    console.log(`removed coach ${coachID} from the table`);

    var newTableData = this.state.tableData;
    delete newTableData[coachID];
    this.setState({ tableData: newTableData });

    // Set state to table
    this.setState({ display: displays.TABLE });
  }

  /**
   * Update a coach's data in tableData and set state to TABLE.
   *
   * @param coachID  the coach to remove from the table
   */
  upadteCoachInTable(form_data) {
    console.log(`Updated coach ${form_data["id"]}`);

    var newTableData = this.state.tableData;
    newTableData[form_data["id"]] = form_data;
    this.setState({ tableData: newTableData });

    // Set state to table
    this.setState({ display: displays.TABLE });
  }

  /**
   * Obtain the URL to poll for coach data using the filter coachFilter.
   *
   * @param coachFilter the coach filter
   */
  get_search_url(coachFilter) {
    // XXX url hardcoded to localhost for development.
    var url = "http://localhost:8000/api/v1/coaches?";

    // simple_keys is the list of keys that do not need formatting.
    var simple_keys = ["available", "birth_year", "gender", "name"];
    simple_keys.forEach((key) => {
      if (key in coachFilter) {
        url += `&${key}=${coachFilter[key]}`;
      }
    });

    // experience_keys is the list of keys that need formatting similarly for a
    // list of ints.
    var experience_keys = ["housing", "need", "rights"];
    experience_keys.forEach((key) => {
      if (key in coachFilter) {
        url += `&${key}=${cmn.getExperienceForUrl(coachFilter[key])}`;
      }
    });

    // Special casing for language as the only dict
    if ("languages" in coachFilter) {
      url += `&languages=${cmn.getLanguagesForUrl(coachFilter.languages)}`;
    }

    return url;
  }

  /**
   * Handle the user selecting to edit the coach with coachID from the table.
   *
   * @param {Number} coachID The ID of the coach to edit.
   */
  handleEditRequest(coachID) {
    // Set state to LOADING while getting coach details from server.
    // Set state to EDIT after receiving details.

    // XXX url hardcoded to localhost for development.
    var url = `http://localhost:8000/api/v1/coaches/${coachID}`;
    this.setState({ display: displays.LOADING }, () => {
      fetch(url)
        .then((response) => response.json())
        .then((data) =>
          this.setState({
            editID: coachID,
            display: displays.EDIT,
          })
        )
        .catch((error) => this.reset_state_log_error(error, displays.TABLE));
    });
  }

  /**
   * Cancel the edit request and return to the table.
   */
  handleEditCancel() {
    console.log("Cancelling edit");
    this.setState({ display: displays.TABLE });
  }

  /**
   * Edit an existing coach, then set display to the TABLE showing all searched
   * for coaches.
   *
   * @param {Number} coachID The ID of the coach to edit.
   * @param {Object} form_data The updated form data for the coach.
   */
  handleEditConfirm(form_data) {
    console.log("Confirmed form: " + JSON.stringify(form_data));
    this.setState({ display: displays.LOADING });

    // XXX url hardcoded to localhost for development.
    var url = `http://localhost:8000/api/v1/coaches/${form_data["id"]}`;
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form_data),
    })
      .then(this.upadteCoachInTable(form_data))
      .catch((error) => this.reset_state_log_error(error, displays.TABLE));
  }

  /**
   *
   * Delete a coach from the database and return display to the table.
   *
   * @param {Number} coachID The ID of the coach to remove.
   */
  handleDeleteConfirm(coachID) {
    console.log("Confirmed delete" + coachID);

    // XXX url hardcoded to localhost for development.
    var url = `http://localhost:8000/api/v1/coaches/${coachID}`;

    // Set state to LOADING while getting coach details from server.
    // Set state to TABLE after receiving details.
    this.setState({ display: displays.LOADING }, () => {
      fetch(url, { method: "delete" })
        .then((response) => console.log(response))
        .then((data) => this.removeCoachFromTable(coachID))
        .catch((error) => this.reset_state_log_error(error, displays.TABLE));
    });
  }

  /**
   * Search for all coaches matching form_data and set display to table
   *
   * @param {Object} form_data The updated form data for the coach.
   */
  handleSearchConfirm(form_data) {
    console.log("Confirmed search form: " + JSON.stringify(form_data));
    var url = this.get_search_url(form_data);

    // Set state to LOADING while getting coach details from server.
    // Set state to TABLE after receiving details.
    this.setState({ display: displays.LOADING }, () => {
      fetch(url)
        .then((response) => response.json())
        .then((data) =>
          this.setState({
            tableData: this.coachArrayToObject(data),
            searchFields: form_data,
            display: displays.TABLE,
          })
        )
        .catch((error) => this.reset_state_log_error(error, displays.SEARCH));
    });
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
            coachDetails={this.state.tableData[this.state.editID]}
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
     *
     * stringigy/parse so this.props.coachDetails aren't altered before
     * clicking submit.
     */
    this.state = JSON.parse(JSON.stringify(this.props.coachDetails));

    // If bio is null, set it to empty string. This prevents React from
    // complaining about displaying null values.
    if (this.state.bio === null) {
      this.state.bio = "";
    }

    // Covert need, rights and housing to the form to display on screen.
    // Need
    if (this.state.need !== null) {
      this.state.need = this.state.need.map((need) =>
        this.get_need_from_int(need)
      );
    }

    // Rights
    if (this.state.rights !== null) {
      this.state.rights = this.state.rights.map((rights) =>
        this.get_rights_from_int(rights)
      );
    }

    // Housing
    if (this.state.housing !== null) {
      this.state.housing = this.state.housing.map((housing) =>
        this.get_housing_from_int(housing)
      );
    }
  }

  /**
   * Return a type:desc object for need level.
   * @param need
   */
  get_need_from_int(need) {
    for (const need_obj of cmn.levelOfNeedOpts) {
      if (need_obj.type === need) {
        return need_obj;
      }
    }

    // If reaching here, unknow need encountered.
    alert(`Unknown need level ${JSON.stringify(need)}`);
  }

  /**
   * Return a type:desc object for rights level.
   * @param rights
   */
  get_rights_from_int(rights) {
    for (const rights_obj of cmn.rightsStatusOpts) {
      if (rights_obj.type === rights) {
        return rights_obj;
      }
    }

    // If reaching here, unknow rights encountered.
    alert(`Unknown rights level ${JSON.stringify(rights)}`);
  }

  /**
   * Return a type:desc object for housing level.
   * @param housing
   */
  get_housing_from_int(housing) {
    for (const housing_obj of cmn.housingStatusOpts) {
      if (housing_obj.type === housing) {
        return housing_obj;
      }
    }

    // If reaching here, unknow housing encountered.
    alert(`Unknown housing level ${JSON.stringify(housing)}`);
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
            <button type="submit" onClick={this.onSubmit}>
              Submit
            </button>
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
 * traits.
 */
class SearchForm extends BlankForm {
  constructor(props) {
    super(props);

    // Allow for form to only be partially completed. This allows users to only
    // specify the fields they care about.
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
    var msg = "Are you sure you want to delete coach ";
    msg += `${this.props.tableData[coachID]["name"]} from the database?`;
    return msg;
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
      editButton: this.getEditButton(coachDetails.id),
      deteleButton: this.getDeleteButton(coachDetails.id),
    };
  }

  /**
   * Return the data for the table.
   *
   * Return tableData formatted to only include name, age, gender and
   * availability.
   */
  getData() {
    return Object.values(this.props.tableData).map(this.formatCoach, this);
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
