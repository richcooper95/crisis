// Common module for shared constants/functions

export const levelOfNeedOpts = [
    {"type": 1, "desc": "1 - No intervention necessary"},
    {"type": 2, "desc": "2 - Signpost to other resources"},
    {"type": 3, "desc": "3 - Information, advice and guidance (IAG)"},
    {"type": 4, "desc": "4 - Coaching and skills"},
    {"type": 5, "desc": "5 - Coaching engagement skills"},
    {"type": 6, "desc": "6 - Intensive support needed"},
  ]
  
export const rightsStatusOpts = [
    {"type": 1, "desc": "1 - No intervention necessary"},
    {"type": 2, "desc": "2 - No recourse to public funds"},
  ]
  
export const housingStatusOpts = [
    {"type": 1, "desc": "1 - No intervention necessary"},
    {"type": 2, "desc": "2 - At risk"},
    {"type": 3, "desc": "3 - Unsuitable temporary accommodation"},
    {"type": 4, "desc": "4 - Rough sleeping"},
  ]
  
export const langProficiencyOpts = [
    {"type": 1, "desc": "1 - Good"},
    {"type": 2, "desc": "2 - Bad"},
    {"type": 3, "desc": "3 - Ugly"},
  ]

export function capitalise(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getLanguagesDisplay(languages) {
    var languages_str = "";

    Object.entries(languages).forEach((entry) => {
      languages_str += capitalise(entry[0]) + " (" + entry[1] + "), ";
    })

    return languages_str.slice(0, -2);
}