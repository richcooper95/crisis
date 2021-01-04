import React from 'react';
import { Multiselect } from 'multiselect-react-dropdown';
import { confirmAlert } from 'react-confirm-alert';
import Loader from 'react-loader-spinner';
import Table from 'react-bootstrap/Table';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
//import 'react-confirm-alert/src/react-confirm-alert.css';

// @@@ Used in testing
//const dummyResults = [{"id":0,"name":"Bob","bio":"Hey, Bob here.","available":true,"birth_year":1992,"gender":"male","languages":{"english":1,"spanish":4},"need":[1,2,3],"rights":[2],"housing":[3],"match_score":35},{"id":4,"name":"Mike","bio":"","available":true,"birth_year":1970,"gender":"male","languages":{"spanish":1,"french":2},"need":[1,2,3],"rights":[2],"housing":[3],"match_score":5},{"id":1,"name":"Albert","bio":"","available":true,"birth_year":1990,"gender":"other","languages":{},"need":[1,2,3],"rights":[2],"housing":[3],"match_score":5},{"id":2,"name":"Kelly S.","bio":"","available":true,"birth_year":1988,"gender":"female","languages":{},"need":[1,2,3],"rights":[2],"housing":[3],"match_score":4}]

import * as cmn from "../cmn.js";

const displays = {
  FORM: "form",
  LOADING: "loading",
  RESULTS: "results",
}

export default class Assign extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmitConfirm = this.handleSubmitConfirm.bind(this);
    this.state = {
      display: displays.FORM,
      results: null,
      error: null,
    }
  }

  sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  handleSubmitConfirm(form_data, url) {
    console.log("Confirmed form: " + JSON.stringify(form_data));
    // TODO: Generate URL with params (make sure to use a proper API
    //       so that spaces etc. are properly handled!).
    // TODO: Hardcode to localhost:8000 for development mode.
    this.setState({ display: displays.LOADING }, () => {
      // TODO: Decide whether to keep this sleep (currently so I can see the loading wheel)
      this.sleep(2000).then(() => {fetch(url)
        .then(response => response.json())
        .then(data => this.setState({
          results: data,
          display: displays.RESULTS,
        }))
        .catch(error => this.setState({ // TODO: better error handling here?
          error: error,
          display: displays.FORM
        }))
      })
    })
  }

  render() {
    var display = null;

    switch (this.state.display) {
      case displays.FORM:
        display = <AssignForm
                    handleSubmitConfirm={this.handleSubmitConfirm}
                    error={this.state.error}
                  />;
        break;
      
      case displays.LOADING:
        display = <AssignLoader />;
        break;
      
      case displays.RESULTS:
        display = <AssignResults coachResults={this.state.results} />;
        break;
    
      default:
        // TODO: Sensible default here? Or maybe just make the form the default?
        break;
    }

    return (display);
  }
}

function AssignLoader(props) {
  return (
    // @@@ This doesn't seem to justify the spinner in the centre...
    <div
      style={{
        width: "100%",
        height: "300vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Loader 
        type="TailSpin"
        color="#EC2229"
        height={80}
        width={80}
      />
    </div>
  )
}

class AssignResults extends React.Component {
  constructor(props) {
    super(props);
    this.getTableFragments = this.getTableFragments.bind(this);
    this.getLanguagesTable = this.getLanguagesTable.bind(this);
  }

  /*
   * SUMMARY:
   * 1. Get 'this is undefined' when trying to call getLanguagesTable.
   */

  getTableFragments() {
    let tableFragments = [];

    this.props.coachResults.forEach(function (item, i) {
    //dummyResults.forEach(function (item, i) {
      //let languages = this.getLanguagesTable(item.languages);
      // @@@ 'languages' just below needs to be changed to use {}.
      // @@@ Need to change need, rights and housing to their desc.
      tableFragments.push(
        <tr>
          <td>{item.match_score}</td>
          <td>{item.id}</td>
          <td>{item.name}</td>
          <td>{item.birth_year}</td>
          <td>{item.gender}</td>
          <td>languages</td>
          <td>{item.need}</td>
          <td>{item.rights}</td>
          <td>{item.housing}</td>
          <td>{item.bio}</td>
        </tr>
      )
    });

    return tableFragments;
  }

  getLanguagesTable(languages) {
    var languages_str = "";

    Object.entries(languages).forEach((entry) => {
      languages_str += cmn.capitalise(entry[0]) + " (" + entry[1] + ")\n";
    })

    return languages_str.slice(0, -2);
  }

  render() {
    console.log(this.props.coachResults);
    return (
      <div>
        <Table striped border hover size="sm">
          <thead>
            <tr>
              <th>Score</th>
              <th>ID</th>
              <th>Name</th>
              <th>Year</th>
              <th>Gender</th>
              <th>Languages</th>
              <th>Need</th>
              <th>Rights</th>
              <th>Housing</th>
              <th>Bio</th>
            </tr>
          </thead>
          <tbody>
            {this.getTableFragments()}
          </tbody>
        </Table>
      </div>
    );
  }
}

class AssignForm extends React.Component {
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
              <p style={{textAlign:"left"}}>
                {language[0].toUpperCase()}{language.substr(1)}:
              </p>
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
        )
      }
    }
    return languageFragments;
  }

  format = function() {
    var s = arguments[0];

    for (var i = 0; i < arguments.length - 1; i++) {
      var regex = new RegExp("\\{" + i + "\\}", "gm");
      s = s.replace(regex, arguments[i + 1]);
    }

    return s;
  }

  getLanguagesForUrl() {
    var languages_str = "";

    Object.entries(this.state.languages).forEach((entry) => {
      languages_str += this.format("{0}:{1},", entry[0], entry[1]);
    })

    return languages_str.slice(0, -1);
  }

  getCoachMatchUrl() {
    var url_fmt = "http://localhost:8000/api/v1/coach-matches?birth_year={0}&gender={1}&languages={2}&need={3}&rights={4}&housing={5}";

    var url = this.format(url_fmt,
                          this.state.year,
                          this.state.gender,
                          this.getLanguagesForUrl(),
                          this.state.need,
                          this.state.rights,
                          this.state.housing);

    return url;
  }

  handleSubmit(event) {
    event.preventDefault();
    //const data = new FormData(event.target);
    let invalidElements = this.invalidFormElements();

    if (!invalidElements) {
      confirmAlert({
        title: 'Confirm Member Details',
        message: ('Year of Birth: ' + this.state.year +
                  '\nGender: ' + cmn.capitalise(this.state.gender) +
                  '\nLanguages: ' + cmn.getLanguagesDisplay(this.state.languages) +
                  '\nLevel of Need: ' + this.state.need +
                  '\nRights Status: ' + this.state.rights +
                  '\nHousing Status: ' + this.state.housing),
        buttons: [
          {
            label: 'Confirm',
            onClick: () => this.props.handleSubmitConfirm(
              this.state,
              this.getCoachMatchUrl(),
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
      if (!entry[1] || (Array.isArray(entry[1]) && entry[1].length === 0)) {
        invalidItems.push(entry[0]);
      }
    })

    Object.entries(this.state.languages).forEach((entry) => {
      if (!entry[1]) {
        invalidItems.push(this.state.languages)
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
    this.setState({need: currentItem.type});
    console.log(currentItem);
  }

  onRightsChange(selectedList, currentItem) {
    this.setState({rights: currentItem.type});
    console.log(currentItem);
  }

  onHousingChange(selectedList, currentItem) {
    this.setState({housing: currentItem.type});
    console.log(currentItem);
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
            <label htmlFor="age"><h4>Birth Year:</h4>
              <p>
                Enter the Member's year of birth.
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
                Enter the Member's gender.
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
                Enter all languages spoken by the Member.
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
                Enter the Member's level of need.
              </p>
              <Multiselect
                options={cmn.levelOfNeedOpts}
                displayValue="desc"
                closeIcon="cancel"
                placeholder="Select Level of Need"
                avoidHighlightFirstOption
                singleSelect
                onSelect={this.onNeedChange}
                onRemove={this.onNeedChange}
              />
            </label>
            <label htmlFor="rights"><h4>Rights Status:</h4>
              <p>
                Enter the Member's rights status.
              </p>
              <Multiselect
                options={cmn.rightsStatusOpts}
                displayValue="desc"
                closeIcon="cancel"
                placeholder="Select Rights Status"
                avoidHighlightFirstOption
                singleSelect
                onSelect={this.onRightsChange}
                onRemove={this.onRightsChange}
              />
            </label>
            <label htmlFor="housing"><h4>Housing Status:</h4>
              <p>
                Enter the Member's housing status.
              </p>
              <Multiselect
                options={cmn.housingStatusOpts}
                displayValue="desc"
                closeIcon="cancel"
                placeholder="Select Housing Status"
                avoidHighlightFirstOption
                singleSelect
                onSelect={this.onHousingChange}
                onRemove={this.onHousingChange}
              />
            </label>
          </div>
        </form>
      </div>
    )
  }

}