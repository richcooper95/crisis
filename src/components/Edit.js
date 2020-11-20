import React from "react";
import { Multiselect } from "multiselect-react-dropdown";
import { confirmAlert } from "react-confirm-alert";
//import 'react-confirm-alert/src/react-confirm-alert.css';

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

const langProficiencyOpts = [
  { type: 1, desc: "1 - Good" },
  { type: 2, desc: "2 - Bad" },
  { type: 3, desc: "3 - Ugly" },
];

const displays = {
  DELETE: "delete",
  EDIT: "edit",
  LOADING: "loading",
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
        return response.body
      }
    })
    .catch((error) => {
      console.error("There was a problem: " + error);
      alert(`An error occured: ${error}`);
    });
}



/**
 * Obtain all entries in database.
 */
function get_coach(coach_id) {
  fetch("http://localhost:8000/api/v1/coaches/" + coach_id, {
    method: "GET",
  })
    .then((response) => {
      if (!response.ok) {
        console.error(
          "Failed to get coaches information, got response code: " + response.status
        );
        response.text().then((text) => alert(`An error occured: ${text}`));
      } else {
        return response.body
      }
    })
    .catch((error) => {
      console.error("There was a problem: " + error);
      alert(`An error occured: ${error}`);
    });
}


export default class Edit extends React.Component {
  constructor(props) {
    super(props);
    this.handleDeleteConfirm = this.handleDeleteConfirm.bind(this);
    this.handleEditConfirm = this.handleEditConfirm.bind(this);
    this.state = {
      display: displays.TABLE,
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
   * Return the page to display.
   */
  render() {
    var display = null;

    switch (this.state.delete) {
      case displays.DELETE:
        // display = (
        //   <DeleteConfirmation handleDeleteConfirm={this.handleDeleteConfirm} />
        // );
        display = "delete"
        break;

      case displays.EDIT:
      default:
        display = <EditForm handleEditConfirm={this.handleEditConfirm} />;
        break;

      case displays.LOADING:
        display = <Loader />;
        break;

      case displays.TABLE:
        // display = <Table />;
        display = "table"
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
class EditForm extends React.Component {
  constructor(props, coach_id) {
    super(props);

    /**
     * Bind all desired functions.
     */
    this.renderLanguageProficiencies = this.renderLanguageProficiencies.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onLanguagesAdd = this.onLanguagesAdd.bind(this);
    this.onLanguagesRemove = this.onLanguagesRemove.bind(this);
    this.onProficiencyChange = this.onProficiencyChange.bind(this);
    this.onNeedChange = this.onNeedChange.bind(this);
    this.onRightsChange = this.onRightsChange.bind(this);
    this.onHousingChange = this.onHousingChange.bind(this);
    this.onYearOfBirthChange = this.onYearOfBirthChange.bind(this);
    this.onGenderChange = this.onGenderChange.bind(this);
    this.onNameChange = this.onNameChange.bind(this);
    this.onAvailableChange = this.onAvailableChange.bind(this);
    this.onBioChange = this.onBioChange.bind(this);

    /**
     * Set the starting state to the current coach information.
     * 
     * @@@ uncomment once server is running
     */
    // this.state = get_coach(coach_id)
    this.state = {
      languages: {"english": { type: 1, desc: "1 - Good" },
                  "french": { type: 2, desc: "2 - Good" }},
      needLevels: { type: 1, desc: "1 - No intervention necessary" },
      housingLevels: 3,
      rightsLevels: 4,
      birthYear: 1000,
      name: "hello",
      gender: "Male",
      available: true,
      bio: null,
    };
    this.state.coach_id = coach_id
  }
  
  renderLanguageProficiencies() {
    let languageFragments = [];
    languageFragments.push(<p key="desc">Enter the proficiency level(s).</p>);
    for (const language in this.state.languages) {
      if (this.state.languages.hasOwnProperty(language)) {
        languageFragments.push(
          <div key={language}>
            <div className="proficiency-label">
              <p style={{textAlign:"left"}}>
                {language[0].toUpperCase()}{language.substr(1)}:
              </p>
            </div>
            <div className="proficiency-choice">
              <Multiselect
                options={langProficiencyOpts}
                displayValue="desc"
                closeIcon="cancel"
                selectedValues={[this.state.languages[language]]}
                avoidHighlightFirstOption
                singleSelect
                onSelect={this.onProficiencyChange.bind(this, language)}
                onRemove={this.onProficiencyChange.bind(this, language)}
              />
            </div>
          </div>
        )
      }
    }
    return languageFragments;
  }

  getLanguagesDisplay() {
    var languages_str = "";

    Object.entries(this.state.languages).forEach((entry) => {
      languages_str += capitalise(entry[0]) + " (" + entry[1] + "), ";
    })

    return languages_str.slice(0, -2);
  }

  getExperienceDisplay(experience) {
    var experience_str = "";

    for (let i = 0; i < experience.length; i++) {
      const obj = experience[i];
      experience_str += obj.desc + " (" + obj.type + "), ";
    }

    return experience_str.slice(0, -2);
  }

  handleSubmit(event) {
    event.preventDefault();
    let invalidElements = this.invalidFormElements();
    console.log(invalidElements);
    if (!invalidElements) {
      confirmAlert({
        title: 'Confirm Coach Details',
        message: ('First name: ' + this.state.name +
                  '\nBirth year: ' + this.state.birthYear +
                  '\nGender: ' + capitalise(this.state.gender) +
                  '\nAvailability: ' + (this.state.available ? 'Available' : 'Not available') +
                  '\nLanguages: ' + this.getLanguagesDisplay(this.state.languages) +
                  '\nExperience in Level of Need: ' + this.getExperienceDisplay(this.state.needLevels) +
                  '\nExperience in Rights Status: ' + this.getExperienceDisplay(this.state.rightsLevels) +
                  '\nExperience in Housing Status: ' + this.getExperienceDisplay(this.state.housingLevels)),
        buttons: [
          {
            label: 'Confirm',
            onClick: () => {
              this.props.handleEditConfirm(
                this.state.coach_id,
                {
                  'name': this.state.name,
                  'bio': this.state.bio,
                  'available': this.state.available,
                  'birth_year': this.state.birthYear,
                  'gender': this.state.gender,
                  'languages': this.state.languages,
                  'need': this.state.needLevels.map(obj => obj.type),
                  'rights': this.state.rightsLevels.map(obj => obj.type),
                  'housing': this.state.housingLevels.map(obj => obj.type)
                }
              )
            }
          },
          {
            label: 'Go back',
          }
        ]
      })
    } else {
      confirmAlert({
        title: 'Invalid Form',
        message: ('The data form is invalid or incomplete.\n\nPlease check the fields of the form again.'),
        buttons: [
          {
            label: 'Go back'
          }
        ]
      })
    }
  }

  invalidFormElements() {
    var invalidItems = [];
    var letters = /^[A-Za-z]+$/;

    Object.entries(this.state).forEach((entry) => {
      console.dir(entry);
      if (!entry[1] || (Array.isArray(entry[1]) && entry[1].length === 0)) {
        // Allow the "available" value to be false
        // Allow the biography to be empty
        let nullableEntries = ["available", "bio"]
        if (!nullableEntries.includes(entry[0])) {
          invalidItems.push(entry[0]);
        }
      }
    })

    Object.entries(this.state.languages).forEach((entry) => {
      if (!entry[1]) {
        invalidItems.push(this.state.languages)
      }
    })

    if (!this.state.name.match(letters)) {
      invalidItems.push(this.state.name)
    }

    if (invalidItems.length > 0) {
      return(invalidItems);
    } else {
      return(null);
    }
  }

  onNameChange(event) {
    this.setState({name: event.target.value});
  }

  onAvailableChange(e) {
    this.setState({available: e.target.checked});
    console.log("Availability change: " + e.target.checked);
  }

  onBioChange(e) {
    this.setState({bio: e.target.value});
    console.log("Bio change: " + e.target.value);
  }

  onLanguagesAdd(selectedList, currentItem) {
    let languagesCopy = JSON.parse(JSON.stringify(this.state.languages));
    languagesCopy[currentItem.toLowerCase()] = null;
    this.setState({languages: languagesCopy});
    console.log(selectedList);
  }

  onLanguagesRemove(selectedList, currentItem) {
    let languagesCopy = JSON.parse(JSON.stringify(this.state.languages));
    delete languagesCopy[currentItem.toLowerCase()];
    this.setState({languages: languagesCopy});
    console.log(selectedList);
  }

  onProficiencyChange(language, selectedList, currentItem) {
    let languagesCopy = JSON.parse(JSON.stringify(this.state.languages));
    languagesCopy[language.toLowerCase()] = currentItem.type;
    this.setState({languages: languagesCopy});
    console.log(selectedList);
  }

  onNeedChange(selectedList, currentItem) {
    this.setState({needLevels: selectedList.slice()});
    console.log(selectedList);
  }

  onRightsChange(selectedList, currentItem) {
    this.setState({rightsLevels: selectedList.slice()});
    console.log(selectedList);
  }

  onHousingChange(selectedList, currentItem) {
    this.setState({housingLevels: selectedList.slice()});
    console.log(selectedList);
  }

  onYearOfBirthChange(selectedList, currentItem) {
    this.setState({birthYear: currentItem});
    console.log(currentItem);
  }

  onGenderChange(selectedList, currentItem) {
    this.setState({gender: currentItem.toLowerCase()});
    console.log(currentItem);
  }

  render() {
    var yearOfBirthList = [];
    let currentYear = new Date().getFullYear();
    for (let i=currentYear; i > currentYear - 80; i--) {
      yearOfBirthList.push(i);
    }

    return (
      <div>
        <form
          onSubmit={this.handleSubmit}
          onKeyPress={e => {
            if (e.key === 'Enter') e.preventDefault();
          }}
        >
          <div className="assign-form-left">
            <label htmlFor="name"><h4>Name:</h4>
              <p>
                Enter the Coach's name.
              </p>
              <input
                value={this.state.name}
                type="text"
                name="name"
                className="name-input"
                onChange={this.onNameChange}
              />
            </label>
            <label htmlFor="age"><h4>Birth Year:</h4>
              <p>
                Enter the Coach's year of birth.
              </p>
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
            <label><h4>Available:</h4>
              Tick the box if the Coach is available:
              <input
                name="isAvailable" type="checkbox"
                checked={this.state.available}
                onChange={this.onAvailableChange} />
            </label>
            <label htmlFor="gender"><h4>Gender:</h4>
              <p>
                Enter the Coach's gender.
              </p>
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
            <label htmlFor="languages"><h4>Languages:</h4>
              <p>
                Enter all languages spoken by the Coach.
              </p>
              <Multiselect
                options={["English", "French", "German"]}
                isObject={false}
                onSelect={this.onLanguagesAdd}
                onRemove={this.onLanguagesRemove}
                closeIcon="cancel"
                selectedValues={Object.keys(this.state.languages)}
                avoidHighlightFirstOption
                style={{chips: {background: 'rgba(236, 34, 41, 0.934)'}}}
              />
            </label>
            <label htmlFor="proficiencies">
              {Object.keys(this.state.languages).length === 0
                ? <p> No language selected. </p>
                : this.renderLanguageProficiencies()
              }
            </label>
          </div>
          <div className="add-form-right">
            <label htmlFor="need"><h4>Level of Need:</h4>
              <p>
                Enter levels of need the Coach has experience with.
              </p>
              <Multiselect
                options={levelOfNeedOpts}
                displayValue="desc"
                onSelect={this.onNeedChange}
                onRemove={this.onNeedChange}
                closeIcon="cancel"
                selectedValues={this.state.needLevels}
                avoidHighlightFirstOption
                style={{chips: {background: 'rgba(236, 34, 41, 0.934)'}}}
              />
            </label>
            <label htmlFor="rights"><h4>Rights Status:</h4>
              <p>
                Enter the rights statuses the Coach has experience with.
              </p>
              <Multiselect
                options={rightsStatusOpts}
                displayValue="desc"
                onSelect={this.onRightsChange}
                onRemove={this.onRightsChange}
                closeIcon="cancel"
                placeholder="Select Rights Statuses"
                avoidHighlightFirstOption
                style={{chips: {background: 'rgba(236, 34, 41, 0.934)'}}}
              />
            </label>
            <label htmlFor="housing"><h4>Housing Status:</h4>
              <p>
                Enter the housing statuses the Coach has experience with.
              </p>
              <Multiselect
                options={housingStatusOpts}
                displayValue="desc"
                onSelect={this.onHousingChange}
                onRemove={this.onHousingChange}
                closeIcon="cancel"
                placeholder="Select Housing Statuses"
                avoidHighlightFirstOption
                style={{chips: {background: 'rgba(236, 34, 41, 0.934)'}}}
              />
            </label>
            <label><h4>Biography:</h4>
              Enter a short biography about the Coach (optional):
              <textarea onBlur={this.onBioChange} />
            </label>
          </div>
          <div className="add-form-submit">
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>
    )
  }
}