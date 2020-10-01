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

function joinLevels(levelArray) {
  let ret_string = '';
  for (const element of levelArray) {
    if (ret_string) {
      ret_string += ', '
    }
    ret_string += element.desc;
  }
  return(ret_string);
}

function capitalise(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export default class Add extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onLanguagesChange = this.onLanguagesChange.bind(this);
    this.onNeedChange = this.onNeedChange.bind(this);
    this.onRightsChange = this.onRightsChange.bind(this);
    this.onHousingChange = this.onHousingChange.bind(this);
    this.onBirthYearChange = this.onBirthYearChange.bind(this);
    this.onGenderChange = this.onGenderChange.bind(this);
    this.onNameChange = this.onNameChange.bind(this);
    this.onAvailableChange = this.onAvailableChange.bind(this);
    this.onBioChange = this.onBioChange.bind(this);
    this.state = {
      languages: null,
      needLevels: null,
      housingLevels: null,
      rightsLevels: null,
      birthYear: 0,
      firstName: null,
      gender: null,
      available: true,
      bio: null,
    };
  }

  handleSubmit(event) {
    event.preventDefault();
    let invalidElements = this.invalidFormElements();

    if (!invalidElements) {
      // TODO: Have some way of specifying language ability from the GUI -
      // forgot about this!
      let languageMap = {};
      for (const lang of this.state.languages) {
        languageMap[lang] = 1;
      }
      confirmAlert({
        title: 'Confirm Coach Details',
        message: ('First name: ' + this.state.firstName +
                  '\nBirth year: ' + this.state.birthYear +
                  '\nGender: ' + capitalise(this.state.gender) +
                  '\nAvailability: ' + (this.state.available ? 'Available' : 'Not available') +
                  '\nLanguages: ' + this.state.languages.map(capitalise).join(", ") +
                  '\nExperience in Level of Need: ' + joinLevels(this.state.needLevels) +
                  '\nExperience in Rights Status: ' + joinLevels(this.state.rightsLevels) +
                  '\nExperience in Housing Status: ' + joinLevels(this.state.housingLevels)),
        buttons: [
          {
            label: 'Confirm',
            onClick: () => {
              // Hardcode to localhost:8000 for development mode.
              // TODO: This is currently of content type "text/plain" as
              // "application/json" was sending an OPTIONS request first, 
              // which was screwing stuff up. May just be a case of allowing
              // OPTIONS from the server side?
              // https://stackoverflow.com/questions/1256593/why-am-i-getting-an-options-request-instead-of-a-get-request
              fetch('http://localhost:8000/api/v1/coaches', {
                method: 'POST',
                headers: {'Content-Type': 'text/plain'},
                body: JSON.stringify({
                  'name': this.state.firstName,
                  'bio': this.state.bio,
                  'available': this.state.available,
                  'birth_year': this.state.birthYear,
                  'gender': this.state.gender,
                  'languages': languageMap,
                  'need': this.state.needLevels.map(obj => obj.type),
                  'rights': this.state.rightsLevels.map(obj => obj.type),
                  'housing': this.state.housingLevels.map(obj => obj.type)
              })
              })
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
    this.setState({needLevels: selectedList});
    console.log("Need levels now: " + selectedList);
    console.dir(selectedList);
    for (const element of selectedList) {
      console.log(element.desc);
    }
  }

  onRightsChange(selectedList, currentItem) {
    this.setState({rightsLevels: selectedList});
    console.log("Rights levels now: " + selectedList);
  }
  
  onHousingChange(selectedList, currentItem) {
    this.setState({housingLevels: selectedList});
    console.log("Housing levels now: " + selectedList);
  }

  onBirthYearChange(e) {
    this.setState({birthYear: e.target.value});
    console.log("Birth year change: " + e.target.value);
  }

  onNameChange(e) {
    this.setState({firstName: e.target.value});
    console.log("Name change: " + e.target.value);
  }

  onAvailableChange(e) {
    this.setState({available: e.target.checked});
    console.log("Availability change: " + e.target.checked);
  }

  onBioChange(e) {
    this.setState({bio: e.target.value});
    console.log("Bio change: " + e.target.value);
  }

  onGenderChange(selectedList, currentItem) {
    this.setState({gender: currentItem.toLowerCase()});
    console.log("Gender change: " + currentItem);
  }

  render() {
    return (
      <div>
        <form
          onSubmit={this.handleSubmit}
          onKeyPress={e => {
            if (e.key === 'Enter') e.preventDefault();
          }}
        >
          <div className="assign-form-left">
            <label><h4>First Name:</h4>
              <p>
                Enter the Coach's first name.
              </p>
              <label>
                <input onBlur={this.onNameChange} />
              </label>
            </label>
            <label htmlFor="age"><h4>Birth Year:</h4>
              <p>
                Enter the Coach's year of birth.
              </p>
              <label>
                <input type="year" onBlur={this.onBirthYearChange} />
              </label>
            </label>
            <label><h4>Available?:</h4>
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
                placeholder="Select Gender"
                avoidHighlightFirstOption
                singleSelect
                onSelect={this.onGenderChange}
                onRemove={this.onGenderChange}
              />
            </label>
            <label htmlFor="languages"><h4>Languages:</h4>
              <p>
                Enter all languages spoken by the Coach, in order of proficiency.
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
          <div className="add-form-right">
            <label htmlFor="need"><h4>Level of Need:</h4>
              <p>
                Enter the types of need level that the Coach is experienced with.
              </p>
              <Multiselect
                options={levelOfNeedOpts}
                displayValue="desc"
                placeholder="Select Level of Need"
                avoidHighlightFirstOption
                onSelect={this.onNeedChange}
                onRemove={this.onNeedChange}
              />
            </label>
            <label htmlFor="rights"><h4>Rights Status:</h4>
              <p>
                Enter the types of rights status that the Coach is experienced with.
              </p>
              <Multiselect
                options={rightsStatusOpts}
                displayValue="desc"
                closeIcon="cancel"
                placeholder="Select Rights Status"
                avoidHighlightFirstOption
                onSelect={this.onRightsChange}
                onRemove={this.onRightsChange}
              />
            </label>
            <label htmlFor="housing"><h4>Housing Status:</h4>
              <p>
                Enter the types of housing status that the Coach is experienced with.
              </p>
              <Multiselect
                options={housingStatusOpts}
                displayValue="desc"
                closeIcon="cancel"
                placeholder="Select Housing Status"
                avoidHighlightFirstOption
                onSelect={this.onHousingChange}
                onRemove={this.onHousingChange}
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