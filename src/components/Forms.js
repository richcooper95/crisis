import React from "react";
import { Multiselect } from "multiselect-react-dropdown";
import { confirmAlert } from "react-confirm-alert";

import * as cmn from "../cmn.js";

/*
 * Defines a form base class that can be used for accessing coaches.
 */
export class CoachForm extends React.Component {
  constructor(props) {
    super(props);
    this.renderLanguageProficiencies = this.renderLanguageProficiencies.bind(
      this
    );
    this.handleSubmitFullForm = this.handleSubmitFullForm.bind(this);
    this.handleSubmitPartialForm = this.handleSubmitPartialForm.bind(this);
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

    /*
     * Set state to default empty state.
     */
    this.state = {
      languages: {},
      need: null,
      housing: null,
      rights: null,
      birth_year: 0,
      name: "",
      gender: null,
      available: null,
      bio: null,
    };
  }

  /*
   * Add "enter proficiency" message for each language selected.
   */
  renderLanguageProficiencies() {
    let languageFragments = [];
    languageFragments.push(<p key="desc">Enter the proficiency level(s).</p>);
    for (const language in this.state.languages) {
      if (this.state.languages.hasOwnProperty(language)) {
        /*
         * If the proficiency already been entered, display this.
         */
        if (this.state.languages[language] !== null) {
          /*
           * Get text for language proficiency
           */
          for (const proficiencyText of cmn.langProficiencyOpts) {
            if (this.state.languages[language] === proficiencyText.type) {
              var displayText = proficiencyText;
            }
          }
          console.log(`Proficiency for ${language} is ${displayText.desc}`);

          /*
           * Add proficiency level selecton.
           */
          languageFragments.push(
            <div key={language}>
              <div className="proficiency-label">
                <p style={{ textAlign: "left" }}>{cmn.capitalise(language)}:</p>
              </div>

              <div className="proficiency-choice">
                <Multiselect
                  options={cmn.langProficiencyOpts}
                  displayValue="desc"
                  closeIcon="cancel"
                  selectedValues={[displayText]}
                  avoidHighlightFirstOption
                  singleSelect
                  onSelect={this.onProficiencyChange.bind(this, language)}
                  onRemove={this.onProficiencyChange.bind(this, language)}
                />
              </div>
            </div>
          );
          /*
           * Else display a placeholder "Select Proficiency"
           */
        } else {
          console.log(`Proficiency for ${language} is unset`);
          /*
           * Add proficiency level selecton.
           */
          languageFragments.push(
            <div key={language}>
              <div className="proficiency-label">
                <p style={{ textAlign: "left" }}>{cmn.capitalise(language)}:</p>
              </div>

              <div className="proficiency-choice">
                <Multiselect
                  options={cmn.langProficiencyOpts}
                  displayValue="desc"
                  closeIcon="cancel"
                  placeholder="Select Proficiency"
                  avoidHighlightFirstOption
                  singleSelect
                  onSelect={this.onProficiencyChange.bind(this, language)}
                  onRemove={this.onProficiencyChange.bind(this, language)}
                />
              </div>
            </div>
          );
        }
      }
    }
    return languageFragments;
  }

  /**
   * Get display for the expliernce level for the language.
   */
  getExperienceDisplay(experience) {
    var experience_str = "";

    for (let i = 0; i < experience.length; i++) {
      const obj = experience[i];
      experience_str += `${obj.desc}\n`;
    }

    return experience_str;
  }

  /**
   * Check all entires in this.state are filled (other than bio)
   */
  unfilledElements() {
    var unfilledItems = [];
    Object.entries(this.state).forEach((entry) => {
      console.dir(entry);
      if (!entry[1] || (Array.isArray(entry[1]) && entry[1].length === 0)) {
        // Allow the "available" value to be false
        // Allow the biography to be empty
        // Allow coachID to be empty (this should only be filled by edit forms)
        let nullableEntries = ["available", "bio", "coachID"];
        if (!nullableEntries.includes(entry[0])) {
          unfilledItems.push(entry[0]);
        }
      }
    });

    /*
     * Only return list of errors if any are present.
     */
    if (unfilledItems.length > 0) {
      return unfilledItems;
    } else {
      return null;
    }
  }

  /**
   * Check that each language in this.state.languages has a proficiency set.
   */
  checkLanguageProficiency() {
    var badLanguages = [];
    Object.entries(this.state.languages).forEach((entry) => {
      if (!entry[1]) {
        badLanguages.push(entry[0]);
      }
    });

    /*
     * Only return list of errors if any are present.
     */
    if (badLanguages.length > 0) {
      return badLanguages;
    } else {
      return null;
    }
  }

  /**
   * Return all invalid elements from this.state
   */
  invalidFormElements() {
    var invalidItems = [];
    var letters = /^[A-Za-z]+$/;

    /*
     * Check each language has a proficiency.
     */
    Object.entries(this.state.languages).forEach((entry) => {
      if (!entry[1]) {
        invalidItems.push(this.state.languages);
      }
    });

    /*
     * Check name is of valid form.
     */
    if (this.state.name !== "" && !this.state.name.match(letters)) {
      invalidItems.push(this.state.name);
    }

    /*
     * Only return list of errors if any are present.
     */
    if (invalidItems.length > 0) {
      return invalidItems;
    } else {
      return null;
    }
  }

  /**
   * Obtain confirmation message.
   */
  getFormConfirmationMessage() {
    var message = "";

    if (this.state.name) {
      message += `First name: ${this.state.name}\n\n`;
    }

    if (this.state.birth_year) {
      message += `Birth year: ${this.state.birth_year}\n\n`;
    }

    if (this.state.gender) {
      message += `Gender: ${this.state.gender}\n\n`;
    }

    if (this.state.available !== null) {
      message +=
        "Availability: " +
        (this.state.available ? "Available" : "Not available") +
        "\n\n";
    }

    if (Object.keys(this.state.languages).length !== 0) {
      message +=
        "Languages:\n" + cmn.getLanguagesDisplay(this.state.languages) + "\n";
    }

    if (this.state.need) {
      message +=
        "Experience in Level of Need:\n" +
        this.getExperienceDisplay(this.state.need) +
        "\n";
    }

    if (this.state.rights) {
      message +=
        "Experience in Rights Status:\n" +
        this.getExperienceDisplay(this.state.rights) +
        "\n";
    }

    if (this.state.housing) {
      message +=
        "Experience in Housing Status:\n" +
        this.getExperienceDisplay(this.state.housing) +
        "\n";
    }

    return message;
  }

  /**
   * Return the object that should be passed to the handleSubmitConfirm
   * function.
   *
   * Filters out entires that haven't been defined.
   */
  getConfirmObject() {
    var form = {};

    if (this.state.coachID) {
      form.coachID = this.state.coachID;
    }

    if (this.state.name) {
      form.name = this.state.name;
    }

    if (this.state.bio) {
      form.bio = this.state.bio;
    }

    if (this.state.available) {
      form.available = this.state.available;
    }

    if (this.state.birth_year) {
      form.birth_year = this.state.birth_year;
    }

    if (this.state.gender) {
      form.gender = this.state.gender;
    }

    if (Object.keys(this.state.languages).length > 0) {
      console.log("Deducing language entry for form");
      form.languages = this.state.languages;
    }

    if (this.state.need) {
      console.log("Deducing need entry for form");
      form.need = this.state.need.map((obj) => obj.type);
    }

    if (this.state.rights) {
      console.log("Deducing rights entry for form");
      form.rights = this.state.rights.map((obj) => obj.type);
    }

    if (this.state.housing) {
      console.log("Deducing housing entry for form");
      form.housing = this.state.housing.map((obj) => obj.type);
    }

    return form;
  }

  /*
   * Confirm the completed entered information and send event.
   *
   * Used for adding and editting entires.
   */
  handleSubmitFullForm(event) {
    event.preventDefault();

    var unfilledElements = this.unfilledElements();
    var invalidElements = this.invalidFormElements();

    if (unfilledElements === null && invalidElements === null) {
      confirmAlert({
        title: "Confirm Coach Details",
        message: this.getFormConfirmationMessage(),
        buttons: [
          {
            label: "Confirm",
            onClick: () => {
              this.props.handleSubmitConfirm(this.getConfirmObject());
            },
          },
          {
            label: "Go back",
          },
        ],
      });
    } else {
      console.log(`Unfilled elements: ${unfilledElements}`);
      console.log(`Invalid elements: ${invalidElements}`);
      confirmAlert({
        title: "Invalid Form",
        message:
          "The data form is invalid or incomplete.\n\nPlease check the fields of the form again.",
        buttons: [
          {
            label: "Go back",
          },
        ],
      });
    }
  }

  /*
   * Confirm the partially entered information and send event.
   *
   * Used for searching for matching entries.
   */
  handleSubmitPartialForm(event) {
    event.preventDefault();

    var message = this.getFormConfirmationMessage();
    if (message === "") {
      message = "All entires";
    }

    var invalidElements = this.invalidFormElements();
    var badLanguages = this.checkLanguageProficiency();
    if (invalidElements === null && badLanguages === null) {
      confirmAlert({
        title: "Confirm Coach Filter",
        message: message,
        buttons: [
          {
            label: "Confirm",
            onClick: () => {
              this.props.handleSubmitConfirm(this.getConfirmObject());
            },
          },
          {
            label: "Go back",
          },
        ],
      });
    } else {
      console.log(`Invalid elements: ${invalidElements}`);
      console.log(`Invalid language proficiencies: ${badLanguages}`);
      confirmAlert({
        title: "Invalid Form",
        message:
          "The data form is invalid.\n\nPlease check the fields of the form again.",
        buttons: [
          {
            label: "Go back",
          },
        ],
      });
    }
  }

  onNameChange(event) {
    this.setState({ name: event.target.value });
  }

  onAvailableChange(e) {
    this.setState({ available: e.target.checked });
    console.log("Availability change: " + e.target.checked);
  }

  onBioChange(e) {
    this.setState({ bio: e.target.value });
    console.log("Bio change: " + e.target.value);
  }

  onLanguagesAdd(selectedList, currentItem) {
    let languagesCopy = JSON.parse(JSON.stringify(this.state.languages));
    languagesCopy[currentItem.toLowerCase()] = null;
    this.setState({ languages: languagesCopy });
    console.log(selectedList);
  }

  onLanguagesRemove(selectedList, currentItem) {
    let languagesCopy = JSON.parse(JSON.stringify(this.state.languages));
    delete languagesCopy[currentItem.toLowerCase()];
    this.setState({ languages: languagesCopy });
    console.log(selectedList);
  }

  onProficiencyChange(language, selectedList, currentItem) {
    let languagesCopy = JSON.parse(JSON.stringify(this.state.languages));
    languagesCopy[language.toLowerCase()] = currentItem.type;
    this.setState({ languages: languagesCopy });
    console.log(selectedList);
  }

  onNeedChange(selectedList, currentItem) {
    this.setState({ need: selectedList.slice() });
    console.log(selectedList);
  }

  onRightsChange(selectedList, currentItem) {
    this.setState({ rights: selectedList.slice() });
    console.log(selectedList);
  }

  onHousingChange(selectedList, currentItem) {
    this.setState({ housing: selectedList.slice() });
    console.log(selectedList);
  }

  onYearOfBirthChange(selectedList, currentItem) {
    this.setState({ birth_year: currentItem });
    console.log(currentItem);
  }

  onGenderChange(selectedList, currentItem) {
    this.setState({ gender: currentItem.toLowerCase() });
    console.log(currentItem);
  }
}

/*
 * Defines a blank form that can be used for adding a new coach or filtering
 * for existing coaches.
 */
export class BlankForm extends CoachForm {
  /*
   * Initialise a CoachForm object.
   *
   * If full==True, then the form must be full before submitting. Else a
   * partially completed form will be accepted.
   */
  constructor(props, full) {
    super(props);

    this.full = full;

    // All inheritting classes must set this attribute to a function that
    // handles an event.
    //
    // Options are:
    //  - this.handleSubmitFullForm
    //  - this.handleSubmitPartialForm
    this.onSubmit = null;
  }

  /*
   * Return HTML for the edit form with values empty.
   *
   * Call this.onSubmit on form submission.
   */
  render() {
    var yearOfBirthList = [];
    let currentYear = new Date().getFullYear();
    for (let i = currentYear; i > currentYear - 80; i--) {
      yearOfBirthList.push(i);
    }
    var availableChecked;
    if (this.state.available === null) {
      availableChecked = true;
    } else {
      availableChecked = this.state.available;
    }

    return (
      <div>
        <form
          onSubmit={this.onSubmit}
          onKeyPress={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
        >
          <div className="add-form-left">
            <label htmlFor="name">
              <h4>Name:</h4>
              <p>Enter the Coach's name.</p>
              <input
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
                placeholder="Select Year of Birth"
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
                checked={availableChecked}
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
                placeholder="Select Gender"
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
                placeholder="Select Languages"
                avoidHighlightFirstOption
                style={{ chips: { background: "rgba(236, 34, 41, 0.934)" } }}
              />
            </label>
            <label htmlFor="proficiencies">
              {Object.keys(this.state.languages).length === 0 ? (
                <p> No language selected. </p>
              ) : (
                this.renderLanguageProficiencies()
              )}
            </label>
          </div>
          <div className="add-form-right">
            <label htmlFor="need">
              <h4>Level of Need:</h4>
              <p>Enter levels of need the Coach has experience with.</p>
              <Multiselect
                options={cmn.levelOfNeedOpts}
                displayValue="desc"
                onSelect={this.onNeedChange}
                onRemove={this.onNeedChange}
                closeIcon="cancel"
                placeholder="Select Levels of Need"
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
                placeholder="Select Rights Statuses"
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
                placeholder="Select Housing Statuses"
                avoidHighlightFirstOption
                style={{ chips: { background: "rgba(236, 34, 41, 0.934)" } }}
              />
            </label>
            <label>
              <h4>Biography:</h4>
              Enter a short biography about the Coach (optional):
              <textarea onBlur={this.onBioChange} />
            </label>
          </div>
          <div className="add-form-submit">
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>
    );
  }
}
