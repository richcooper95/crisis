import React from 'react';
import { Multiselect } from 'multiselect-react-dropdown';
import { confirmAlert } from 'react-confirm-alert';
//import 'react-confirm-alert/src/react-confirm-alert.css';

const levelOfNeedOpts = [
  {"type": 1, "desc": "1 - No intervention necessary"},
  {"type": 2, "desc": "2 - Signpost to other resources"},
  {"type": 3, "desc": "3 - Information, advice and guidance (IAG)"},
  {"type": 4, "desc": "4 - Coaching and skills"},
  {"type": 5, "desc": "5 - Coaching engagement skills"},
  {"type": 6, "desc": "6 - Intensive support needed"},
]

const rightsStatusOpts = [
  {"type": 1, "desc": "1 - No intervention necessary"},
  {"type": 2, "desc": "2 - No recourse to public funds"},
]

const housingStatusOpts = [
  {"type": 1, "desc": "1 - No intervention necessary"},
  {"type": 2, "desc": "2 - At risk"},
  {"type": 3, "desc": "3 - Unsuitable temporary accommodation"},
  {"type": 4, "desc": "4 - Rough sleeping"},
]

const langProficiencyOpts = [
  {"type": 1, "desc": "1 - Good"},
  {"type": 2, "desc": "2 - Bad"},
  {"type": 3, "desc": "3 - Ugly"},
]

export default class Add extends React.Component {
  constructor(props) {
    super(props);
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
    this.state = {
      languages: {},
      need: null,
      housing: null,
      rights: null,
      year: 0,
      gender: null,
    };
  }

  renderLanguageProficiencies() {
    let languageFragments = [];
    languageFragments.push(<p key="desc">Enter the proficiency level(s).</p>);
    for (const language in this.state.languages) {
      if (this.state.languages.hasOwnProperty(language)) {
        languageFragments.push(
          <div key={language}>
            <div className="proficiency-label">
              <p style={{textAlign:"right"}}>
                {language[0].toUpperCase()}{language.substr(1)}:
              </p>
            </div>
            <div className="proficiency-choice">
              <Multiselect
                options={langProficiencyOpts}
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
        )
      }
    }
    return languageFragments;
  }

  handleSubmit(event) {
    event.preventDefault();
    //const data = new FormData(event.target);
    let invalidElements = this.invalidFormElements();

    if (!invalidElements) {
      confirmAlert({
        title: 'Confirm Coach Details',
        message: ('Year of Birth: ' + this.state.year +
                  '\nGender: ' + this.state.gender +
                  '\nLanguages: ' + this.state.languages.values().join(", ") +
                  '\nLevel of Need: ' + this.state.need +
                  '\nRights Status: ' + this.state.rights +
                  '\nHousing Status: ' + this.state.housing),
        buttons: [
          {
            label: 'Confirm',
            onClick: () => console.log(
              "Confirmed form: " + JSON.stringify(this.state)
            )
          },
          {
            label: 'Go back',
          }
        ]
      })
    } else {
      confirmAlert({
        title: 'Incomplete Form',
        message: ('The data form is incomplete.\n\nPlease fill in the remaining fields.'),
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

    Object.entries(this.state).forEach((entry) => {
      if (!entry[1] || entry[1] === {}) {
        invalidItems.push(entry[0]);
      }
    })
    if (invalidItems.length > 0) {
      return(invalidItems);
    } else {
      return(null);
    }
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
    this.setState({need: selectedList.slice()});
    console.log(selectedList);
  }

  onRightsChange(selectedList, currentItem) {
    this.setState({rights: selectedList.slice()});
    console.log(selectedList);
  }

  onHousingChange(selectedList, currentItem) {
    this.setState({housing: selectedList.slice()});
    console.log(selectedList);
  }

  onYearOfBirthChange(selectedList, currentItem) {
    this.setState({year: currentItem});
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
              @@@ Add text box here
            </label>
            <label htmlFor="age"><h4>Birth Year:</h4>
              <p>
                Enter the Coach's year of birth.
              </p>
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
            <label htmlFor="gender"><h4>Gender:</h4>
              <p>
                Enter the Coach's gender.
              </p>
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
                placeholder="Select Languages"
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
          <div className="assign-form-submit">
            <button type="submit">Submit</button>
          </div>
          <div className="assign-form-right">
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
                placeholder="Select Levels of Need"
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
          </div>
        </form>
      </div>
    )
  }
}