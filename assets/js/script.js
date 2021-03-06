var elem = document.querySelector('.collapsible.expandable');
var instance = M.Collapsible.init(elem, { accordion: false });
var elemSavedList = document.querySelector('#saved-character-list.collapsible.expandable');
var instanceSavedList = M.Collapsible.init(elemSavedList, { accordion: false });
var generateBtn = document.querySelector('#generate');
var randomRace = 'https://www.dnd5eapi.co/api/races';
var randomClass = 'https://www.dnd5eapi.co/api/classes';
var nameGen = 'https://s3-us-west-2.amazonaws.com/atomicthoughts.com/dnd/dndnames.json';
var savedCharacterList = document.getElementById("saved-character-list");
var charList = document.querySelector(".character-results");
var raceList;
var classList;
var imgList;
var retryList = [0, 0, 0, 0, 0];
var characters = [];
const mystChar = "./assets/images/web-ready/mystery-character-image.gif";

//pulls random race and class
function generateCharacter() {
  raceList = [];
  classList = [];
  imgList = [];
   $('.collapsible-body .row img').attr("src", mystChar);
  for (var j = 0; j < 5; j++) {
    var counter = 0
    fetch(randomRace)
      .then(function (response) {
        return response.json();
      })
      .then(function (races) {
        //randomizes race
        var raceName = races.results[Math.floor(Math.random() * races.results.length)]
        raceList.push(raceName.index);
        return fetch(randomClass)
          .then(function (response) {
            return response.json();
          })
          .then(function (classes) {
            //randomizes class
            var className = classes.results[Math.floor(Math.random() * classes.results.length)]
            //triggers class features function
            classFeatures(className, counter);
            classList.push(className.index);
            var raceAndClass = document.querySelector("[data-char-header='" + counter + "']");
            //puts race/class names together
            raceAndClass.textContent = raceName.name + "  " + className.name;
            charName(raceName.name, className.name, counter);
            // calls function to get racial features. passes race and counter
            charRaceFeatures(raceName.index, counter);
            counter++
            generateImages()
          })
      })
  }
}

//generate random character name
function charName(raceName, className, counter) {
  fetch(nameGen)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {

      for (var j = 0; j < 5; j++) {
        //randomizes male names
        var nameEl = data.races[j].male[Math.floor(Math.random() * data.races[j].male.length)]
        //randomizes clan names
        var clanEl = data.races[j].clan[Math.floor(Math.random() * data.races[j].clan.length)]
        var genEl = document.querySelector("[data-char-header='" + counter + "']");
        genEl.textContent = nameEl + "  " + clanEl + " the " + raceName + "  " + className
      }
    })
}


function classFeatures(className, counter) {
  // fetch the random class details
  fetch(randomClass + "/" + className.index)
    .then(function (response) {
      return response.json();
    })
    .then(function (classDetails) {
      //calls hit die information
      var hitDie = document.querySelector("[data-char-hit-die='" + counter + "']")
      hitDie.innerHTML = "<strong>Hit Die: </strong>"
      var classEl = document.createElement('p');
      classEl.classList = "class-feature"
      classEl.textContent = "1d" + classDetails.hit_die;
      hitDie.appendChild(classEl);

      //calls saving throw
      var saveThrow = document.querySelector("[data-char-saving-throw='" + counter + "']")
      saveThrow.innerHTML = "<strong>Saving Throw: </strong>"
      for (var j = 0; j < classDetails.saving_throws.length; j++) {
        var throwEl = document.createElement('p');
        var saveEl = classDetails.saving_throws[j].name;
        throwEl.classList = "class-feature"
        throwEl.textContent = saveEl + "  "
        saveThrow.appendChild(throwEl);
      }

      //calls skill proficiency
      var proficSkill = document.querySelector("[data-char-class-skill-prof='" + counter + "']")
      proficSkill.innerHTML = "<strong>Skill Proficiencies: </strong>"
      for (var j = 0; j < classDetails.proficiency_choices.length; j++) {
        for (var k = 0; k < classDetails.proficiency_choices[j].choose; k++) {
          var randomProf = classDetails.proficiency_choices[0].from[Math.floor(Math.random() * classDetails.proficiency_choices[j].from.length)].name;
          randomProf = randomProf.split(":");
          var profEl = document.createElement('p');
          profEl.classList = "proficiency"
          profEl.textContent = randomProf[1] + " ";
          proficSkill.appendChild(profEl);
        }
      }
      //calls weapon & armor proficiences
      var wepAndArmor = document.querySelector("[data-char-class-weap-prof='" + counter + "']")
      wepAndArmor.innerHTML = "<strong>Weapon & Armor Proficiencies: </strong>"
      for (var j = 0; j < classDetails.proficiencies.length; j++) {
        var wepArmEl = classDetails.proficiencies[j].name
        var wepEl = document.createElement('p');
        wepEl.classList = "proficiency"
        wepEl.textContent = wepArmEl + " ";
        wepAndArmor.appendChild(wepEl);
      }

      //calls starting equipment
      var equip = document.querySelector("[data-char-equip='" + counter + "']")
      equip.innerHTML = "<h4>Starting Equipment</h4>"
      for (var j = 0; j < classDetails.starting_equipment.length; j++) {
        var equipEl = classDetails.starting_equipment[j].equipment.name
        var amount = classDetails.starting_equipment[j].quantity
        var starterEl = document.createElement('p');
        starterEl.classList = "equipment"
        starterEl.textContent = equipEl + " (" + amount + ")"
        equip.appendChild(starterEl);
      }
    })
}

// checks if race and class list are filled before running the fetch function
function generateImages(options = {}, time = 8000) {
  if (classList.length < 5) {
    return;
  }
  for (j = 0; j < 5; j++) {
    imgFetch(j);
  }

  //fetch function grabs and places images for their respective class and race
  function imgFetch(j) {
    //shims the fetch call with an 8 second timeout function that triggers a unique named error that we can catch
    //the error is created using the AbortController and signal: controller.signal parameters.
    const controller = new AbortController()
    const config = { ...options, signal: controller.signal }
    setTimeout(() => {
      controller.abort()
    }, time)
    //runs the series of fetch calls based on j
    fetch(
      'https://api.serpstack.com/search' +
      '?access_key=35320024a8400cca6f311123b3fce677' +
      '&type=images' +
      '&num=5' +
      '&query=' +
      raceList[j] +
      '+' +
      classList[j], config
    )
    //returns the data in json format
      .then(function (response) {
        return response.json();
      })
      //grabs a relative and random image to be stored and displayed
      .then(function (response) {
        var charImg = response.image_results[Math.floor(Math.random() * 3)].image_url;
        imgList.push(charImg);
        var charImgEl = document.querySelector("[data-char-img='" + j + "']");
        charImgEl.setAttribute('src', charImg);
        charImgEl.setAttribute('width', '300px');
      })
      //catches both the timeout error and api errors and handles them
      .catch(function (error) {
        //this is the unique named error, 'AbortError', handled in nested if statements
        if (error.name === 'AbortError') {
          if (retryList[j] > 1) {
            $("[data-char-img='" + j + "']").attr("src", './assets/images/web-ready/missing-image.jpg');
            return;
          }
            retryList[j]++;
            imgFetch(j);
        } else {
          //handles api errors
          console.log(error)
        }
      })
  }
}

// function to get racial features
var charRaceFeatures = function (race, counter) {

  // api for specific race
  var apiRaceUrl = 'https://www.dnd5eapi.co/api/races/' + race;
  fetch(apiRaceUrl).then(function (response) {
    response.json().then(function (data) {
      // updates race
      var charRace = document.querySelector("[data-char-race='" + counter + "']");
      charRace.innerHTML = "<strong>Race: </strong>" + data.name;

      // updates race speed
      var charSpeed = document.querySelector("[data-char-speed='" + counter + "']");
      charSpeed.innerHTML = "<strong>Speed: </strong>" + data.speed;

      // updates race ability bonues
      var charAbilitiesEl = document.querySelector("[data-char-ability-bonus='" + counter + "']");
      charAbilitiesEl.innerHTML = "<strong>Ability Bonuses: </strong>";

      // checks to see if race is a half-elf
      if (data.name === "Half-Elf") {
        for (var i = 0; i < 2; i++) {
          var ability = data.ability_bonus_options.from[Math.floor(Math.random() * data.ability_bonus_options.from.length)].ability_score.name;
          var bonus = data.ability_bonus_options.from[Math.floor(Math.random() * data.ability_bonus_options.from.length)].bonus;
          var abilityEl = document.createElement('p');
          abilityEl.classList = "ability-bonus"
          abilityEl.textContent = "+" + bonus + " " + ability + " ";
          charAbilitiesEl.appendChild(abilityEl);
        }
      }
      else {
        for (var i = 0; i < data.ability_bonuses.length; i++) {
          var ability = data.ability_bonuses[i].ability_score.name;
          var bonus = data.ability_bonuses[i].bonus;
          var abilityEl = document.createElement('p');
          abilityEl.classList = "ability-bonus"
          abilityEl.textContent = "+" + bonus + " " + ability + " ";
          charAbilitiesEl.appendChild(abilityEl);
        }
      }

      // updates race alignment
      var charAlignment = document.querySelector("[data-char-alignment='" + counter + "']");
      charAlignment.innerHTML = "<strong>Alignment: </strong>" + data.alignment;

      // updates race age
      var charAge = document.querySelector("[data-char-age='" + counter + "']");
      charAge.innerHTML = "<strong>Age: </strong>" + data.age;

      // updates race size
      var charSize = document.querySelector("[data-char-size='" + counter + "']");
      var sizeDes = data.size_description.split("Your");
      charSize.innerHTML = "<strong>Size: </strong>" + data.size + ". " + sizeDes[0];

      getRaceProf(data, counter);
      getRaceTraits(data, counter);
    })
  })
};

var getRaceProf = function (race, counter) {
  var charSkillProf = document.querySelector("[data-char-race-skill-prof='" + counter + "']");
  var charWeapProf = document.querySelector("[data-char-race-weapon-prof='" + counter + "']");
  var charToolProf = document.querySelector("[data-char-race-tool-prof='" + counter + "']");
  var charLanguageEl = document.querySelector("[data-char-race-lang='" + counter + "']");

  charSkillProf.innerHTML = "<strong>Skill Proficiencies: </strong>" + "-";
  charWeapProf.innerHTML = "<strong>Weapon & Armor Proficiencies: </strong>" + "-";
  charToolProf.innerHTML = "<strong>Tool Proficiencies: </strong>" + "-";
  charLanguageEl.innerHTML = "<strong>Languages: </strong>";

  for (var i = 0; i < race.languages.length; i++) {
    var language = race.languages[i].name;
    var langEl = document.createElement('p');
    langEl.classList = "proficiency"
    langEl.textContent = language + "   ";
    charLanguageEl.appendChild(langEl);
  }

  if (race.index === "dwarf") {
    // dwarf weapon proficiences
    charWeapProf.innerHTML = "<strong>Weapon & Armor Proficiencies: </strong>";
    for (var i = 0; i < race.starting_proficiencies.length; i++) {
      var prof = race.starting_proficiencies[i].name;
      var profEl = document.createElement('p');
      profEl.classList = "proficiency"
      profEl.textContent = prof + "   ";
      charWeapProf.appendChild(profEl);
    }

    // dwarf tool proficiences
    charToolProf.innerHTML = "<strong>Tool Proficiencies: </strong>";
    for (var i = 0; i < race.starting_proficiency_options.choose; i++) {
      var prof = race.starting_proficiency_options.from[Math.floor(Math.random() * race.starting_proficiency_options.from.length)].name;
      var profEl = document.createElement('p');
      profEl.classList = "proficiency"
      profEl.textContent = prof + "   ";
      charToolProf.appendChild(profEl);
    }
  }

  else if (race.index === "elf") {
    // elf skill proficiences
    charSkillProf.innerHTML = "<strong>Skill Proficiencies: </strong>";
    var prof = race.starting_proficiencies[0].name;
    prof = prof.split(":");
    var profEl = document.createElement('p');
    profEl.classList = "proficiency"
    profEl.textContent = prof[1] + "   ";
    charSkillProf.appendChild(profEl);
  }

  else if (race.index === "half-elf") {
    // half-elf skill proficiences
    charSkillProf.innerHTML = "<strong>Skill Proficiencies: </strong>";
    for (var i = 0; i < race.starting_proficiency_options.choose; i++) {
      var prof = race.starting_proficiency_options.from[Math.floor(Math.random() * race.starting_proficiency_options.from.length)].name;
      prof = prof.split(":");
      var profEl = document.createElement('p');
      profEl.classList = "proficiency"
      profEl.textContent = prof[1] + "   ";
      charSkillProf.appendChild(profEl);
    }

    // half-elf language options
    for (var i = 0; i < race.language_options.choose; i++) {
      var prof = race.language_options.from[Math.floor(Math.random() * race.language_options.from.length)].name;
      var profEl = document.createElement('p');
      profEl.classList = "proficiency"
      profEl.textContent = prof + "   ";
      charLanguageEl.appendChild(profEl);
    }
  }

  else if (race.index === "half-orc") {
    // half-orc skill proficiences
    charSkillProf.innerHTML = "<strong>Skill Proficiencies: </strong>";
    var prof = race.starting_proficiencies[0].name;
    prof = prof.split(":");
    var profEl = document.createElement('p');
    profEl.classList = "proficiency"
    profEl.textContent = prof[1] + "   ";
    charSkillProf.appendChild(profEl);
  }

  else if (race.index === "human") {
    // human language options
    for (var i = 0; i < race.language_options.choose; i++) {
      var prof = race.language_options.from[Math.floor(Math.random() * race.language_options.from.length)].name;
      var profEl = document.createElement('p');
      profEl.classList = "proficiency"
      profEl.textContent = prof + "   ";
      charLanguageEl.appendChild(profEl);
    }
  }
};

var getRaceTraits = function (race, counter) {
  var count = 0;
  if (race.traits.length === 0) {
    var charRaceTrait = document.querySelector("[data-char-race-trait-" + count + "='" + counter + "']");
    charRaceTrait.innerHTML = "<strong>None</strong>";
  }
  else {
    for (var i = 0; i < race.traits.length; i++) {
      var apiRaceUrl = 'https://www.dnd5eapi.co/api/traits/' + race.traits[i].index;

      fetch(apiRaceUrl).then(function (response) {
        response.json().then(function (traits) {
          var charRaceTrait = document.querySelector("[data-char-race-trait-" + count + "='" + counter + "']");
          charRaceTrait.innerHTML = "<strong>" + traits.name + ": " + "</strong>" + traits.desc;
          count++
        })
      })
    }
  }
};

// when the generate character button is clicked it generates random information
generateBtn.addEventListener("click", function (e) {
  e.preventDefault()
  charList.classList.remove("hide");
  generateCharacter();
})

const SAVED_CHARACTER_KEY = "savedCharacter"

// save character to local storage
function saveCharacter(characterNum) {
  // get previously saved characters from local storage
  var previouslySavedCharsString = localStorage.getItem(SAVED_CHARACTER_KEY);
  var previouslySavedChars;
  if (previouslySavedCharsString == null) {
    previouslySavedChars = [];
  } else {
    previouslySavedChars = JSON.parse(previouslySavedCharsString);
  }

  // get new character to be saved and add it to existing saved characters
  var characterItem = document.getElementById("character-" + characterNum + "-item").outerHTML;
  characterItem = characterItem.replace('id="character-' + characterNum + '-item"', '');
  previouslySavedChars.push(encodeURI(characterItem));

  // set updated saved characters back to local storage
  localStorage.setItem(SAVED_CHARACTER_KEY, JSON.stringify(previouslySavedChars));
}

// loads character and displays it in collapsible
function loadCharacter() {
  var saveCharBtn = document.getElementById("show-saved-char");

  if (saveCharBtn.textContent === "SHOW SAVED CHARACTERS") {
    saveCharBtn.textContent = "HIDE SAVED CHARACTERS";
    savedCharacterList.classList.remove("hide");
  }
  else {
    saveCharBtn.textContent = "SHOW SAVED CHARACTERS";
    savedCharacterList.classList.add("hide");
  } 
  
  var loadedCharacters = JSON.parse(localStorage.getItem(SAVED_CHARACTER_KEY));
  savedCharacterList.innerHTML = "<li><div class='collapsible-header'><h2 class='section-header'>Saved Characters</h2></div></li>";

  for (var i = 0; i < loadedCharacters.length; i++) {
    savedCharacterList.innerHTML = (savedCharacterList.innerHTML + decodeURI(loadedCharacters[i]));
  }
  
}

// clears local storage and removes displayed saved characters
function clearStorage() {
  localStorage.clear();
  savedCharacterList.innerHTML = "<li><div class='collapsible-header'><h2 class='section-header'>Saved Characters</h2></div></li>";
}

function saveCharacter1() {
  saveCharacter(1);
}

function saveCharacter2() {
  saveCharacter(2);
}

function saveCharacter3() {
  saveCharacter(3);
}

function saveCharacter4() {
  saveCharacter(4);
}
function saveCharacter5() {
  saveCharacter(5);
}

// click listeners for all storage-related buttons
document.getElementById("dlt-saved-char").addEventListener("click", clearStorage);
document.getElementById("show-saved-char").addEventListener("click", loadCharacter);
document.getElementById("save-btn1").addEventListener("click", saveCharacter1);
document.getElementById("save-btn2").addEventListener("click", saveCharacter2);
document.getElementById("save-btn3").addEventListener("click", saveCharacter3);
document.getElementById("save-btn4").addEventListener("click", saveCharacter4);
document.getElementById("save-btn5").addEventListener("click", saveCharacter5);

