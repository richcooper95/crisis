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

export default class Assign extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onLanguagesChange = this.onLanguagesChange.bind(this);
    this.onNeedChange = this.onNeedChange.bind(this);
    this.onRightsChange = this.onRightsChange.bind(this);
    this.onHousingChange = this.onHousingChange.bind(this);
    this.onAgeChange = this.onAgeChange.bind(this);
    this.onGenderChange = this.onGenderChange.bind(this);
    this.state = {
      languages: null,
      need: null,
      housing: null,
      rights: null,
      age: 0,
      gender: null,
    };
  }

  handleSubmit(event) {
    event.preventDefault();
    //const data = new FormData(event.target);
    let invalidElements = this.invalidFormElements();

    if (!invalidElements) {
      confirmAlert({
        title: 'Confirm Member Details',
        message: ('Age: ' + this.state.age +
                  '\nGender: ' + this.state.gender +
                  '\nLanguages: ' + this.state.languages.join(", ") +
                  '\nLevel of Need: ' + this.state.need +
                  '\nRights Status: ' + this.state.rights +
                  '\nHousing Status: ' + this.state.housing),
        buttons: [
          {
            label: 'Confirm',
            onClick: () => {
              // TODO: Generate URL with params (make sure to use a proper API
              //       so that spaces etc. are properly handled!).
              // TODO: Hardcode to localhost:8000 for development mode.
              fetch('/api/v1/coach-matches?birth_year=1979&gender=male&languages=english:1,french:3&need=1&rights=2&housing=3')
                .then(response => response.json())
                .then(data => console.log(data))
              console.log("Confirmed form: " + JSON.stringify(this.state));
            }
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
    if (invalidItems.length > 0) {
      return(invalidItems);
    } else {
      return(null);
    }
  }

  onLanguagesChange(selectedList, currentItem) {
    var lowerList = selectedList.map(v => v.toLowerCase());
    this.setState({languages: lowerList.slice()});
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

  onAgeChange(selectedList, currentItem) {
    this.setState({age: currentItem.toLowerCase().replace(/-/g, "_").replace(/ /g, "")});
    console.log(currentItem);
  }

  onGenderChange(selectedList, currentItem) {
    this.setState({gender: currentItem.toLowerCase()});
    console.log(currentItem);
  }

  render() {
    let numArray = new Array(10);
    for (let i=0; i < numArray.length; i++) {
      numArray[i] = i + 1;
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
            <label htmlFor="age"><h4>Age Group:</h4>
              <p>
                Enter the Member's age group.
              </p>
              <Multiselect
                options={["Under 18", "18 - 24", "25 - 29", "30 - 39", "40 - 49", "50 - 65", "Over 65"]}
                isObject={false}
                closeIcon="cancel"
                placeholder="Select Age Group"
                avoidHighlightFirstOption
                singleSelect
                onSelect={this.onAgeChange}
                onRemove={this.onAgeChange}
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
                Enter all languages spoken by the Member, in order of proficiency.
              </p>
              <Multiselect
                options={["English", "French", "German"]}
                isObject={false}
                onSelect={this.onLanguagesChange}
                onRemove={this.onLanguagesChange}
                closeIcon="cancel"
                placeholder="Select Languages"
                avoidHighlightFirstOption
                style={{chips: {background: 'rgba(236, 34, 41, 0.934)'}}}
              />
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
                options={levelOfNeedOpts}
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
                options={rightsStatusOpts}
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
                options={housingStatusOpts}
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