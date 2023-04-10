const keys = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
var player_entry_text_display_element = document.getElementById("player_entry_text_display");
var player_entry_text = "";
var player_state = {};
var time_left = 60 * 20; // 20 minutes
var entry_block = true;
var target_sentence = "the best things in life are free";
var obscured_target_sentence_array = [];
var known_words = [];
var game_started = false;
// a dictionary of characters and their counts
// const initialCharacterPool = {"a": 1, "b": 1, "c": 1, "d": 1, "e": 1, "f": 1, "g": 1, "h": 1, "i": 1, "j": 1, "k": 1, "l": 1, "m": 1, "n": 1, "o": 1, "p": 1, "q": 1, "r": 1, "s": 1, "t": 1, "u": 1, "v": 1, "w": 1, "x": 1, "y": 1, "z": 1, " ": 1}
// const initialCharacterPool = {"e": 1, "f": 1, "g": 1, "h": 1, "i": 1, "j": 1, "k": 1, "l": 1, "m": 1, "n": 1, "o": 1, "p": 1, "q": 1, "r": 1, "s": 1, "t": 1, "u": 1, "v": 1, "w": 1, "x": 1, "y": 1, "z": 1, " ": 1}
// const initialCharacterPool = { a: 0, b: 0, c: 0, d: 5, e: 1, f: 1, g: 1, h: 1, i: 1, j: 1, k: 1, l: 1, m: 1, n: 1, o: 1, p: 1, q: 1, r: 1, s: 1, t: 0, u: 0, v: 0, w: 0, x: 0, y: 0, z: 0 }
const initialCharacterPool = { a: 100, b: 1, c: 0, d: 0, e: 6, f: 2, g: 1, h: 2, i: 3, j: 0, k: 0, l: 1, m: 0, n: 2, o: 0, p: 0, q: 0, r: 2, s: 2, t: 3, u: 0, v: 0, w: 0, x: 0, y: 0, z: 0 }

var character_pool = Object.assign({}, initialCharacterPool);

const enabled_key_color = "#F5E28B";
const disabled_key_color = "#736E5D";

function update_target_sentence_display(obscured_array) {
  var target_text = document.getElementById("target_text");
  var target_sentence_display_text = "";
  for (var i = 0; i < obscured_array.length; i++) {
    target_sentence_display_text += obscured_array[i] + " ";
  }
  target_text.innerHTML = target_sentence_display_text;
}

function build_obscured_target_sentence_array() {
  var new_obscured_target_sentence_array = [];
  var target_sentence_words = target_sentence.split(" ");
  for (var i = 0; i < target_sentence_words.length; i++) {
    if (known_words.includes(target_sentence_words[i].toLowerCase())) {
      new_obscured_target_sentence_array.push(target_sentence_words[i]);
    } else {
      // number of underscores is equal to the length of the word
      var underscores = "";
      for (var j = 0; j < target_sentence_words[i].length; j++) {
        underscores += "_";
      }
      new_obscured_target_sentence_array.push(underscores);
    }
  }
  return new_obscured_target_sentence_array;
}

function update_key_count(key) {
  document.getElementById(key).getElementsByClassName("letter_count")[0].innerHTML = character_pool[key.toLowerCase()];
}

function reset_key_counts() {
  for (const key in character_pool) {
    update_key_count(key.toUpperCase());
  }
}

function apply_key_color(key) {
  if (character_pool[key.toLowerCase()] > 0) {
    document.getElementById(key).classList.add("enabled");
    document.getElementById(key).style.backgroundColor = enabled_key_color;
    document.getElementById(key).style.border = "2px solid #A89F77";
    // change the key color to grey
  } else {
    document.getElementById(key).classList.remove("enabled");
    document.getElementById(key).style.backgroundColor = disabled_key_color;
    document.getElementById(key).style.border = "2px solid #968F74";
  }
}

function reset_key_colors() {
  for (const key in character_pool) {
    apply_key_color(key.toUpperCase());
  }
}

function applyKey(key) {
  console.log(key);

  switch (key) {
    case "Delete":
      if (player_entry_text.length < 1) {
        return;
      }
      deleted_character = player_entry_text[player_entry_text.length - 1];
      if (deleted_character != " ") {
        character_pool[deleted_character.toLowerCase()] += 1;
        if (character_pool[deleted_character] == 1) {
          document.getElementById(deleted_character).classList.remove("disabled");
        }
        apply_key_color(deleted_character.toUpperCase());
        update_key_count(deleted_character.toUpperCase());
      }
      player_entry_text = player_entry_text.slice(0, -1);

      break;

    case "Submit":
      // send the guess to the game server for validation
      // retrieve the result of the guess:
      // 1. score -500 to 1000.
      // 2. the words that were correctly identified and their points
      // 3. the points for the number of letters
      // 4. the new player state:
      //    a. the player's total score
      //    b. the player's found words
      //    c. the player's remaining 

      // reset the guess text entry and keyboard colors
      document.getElementById('start_button_container').style.display = 'none';

      document.getElementById("score").innerHTML = validate_guess(player_entry_text.toLowerCase());
      character_pool = Object.assign({}, initialCharacterPool);
      reset_key_colors();
      reset_key_counts();
      obscured_target_sentence_array = build_obscured_target_sentence_array();
      update_target_sentence_display(obscured_target_sentence_array);
      player_entry_text = "";
      break;

    case "Space":
      if (player_entry_text.length > 0 && player_entry_text[player_entry_text.length - 1] !== " ") { // don't add a space if the last character is already a space
        player_entry_text += " ";
      }
      break;

    default:
      // if the length of the player entry text is too long, lets just not add the key
      if (player_entry_text.length >= 50) {
        return;
      }

      // verify that the key is can be added to the player entry text
      // are there enough characters in the character pool to add the key?
      if (character_pool[key.toLowerCase()] > 0) {
        // decrement the character count
        character_pool[key.toLowerCase()] -= 1;
        // add the key to the player entry text
        player_entry_text += key;
        apply_key_color(key.toUpperCase());
        update_key_count(key.toUpperCase());
      }
      break;
  }
  console.log(player_entry_text);
  document.getElementById("player_entry_text_display").innerHTML = player_entry_text.toLowerCase();
}



window.addEventListener('load', function () {
  reset_key_counts();
  reset_key_colors();
  obscured_target_sentence_array = build_obscured_target_sentence_array();
  update_target_sentence_display(obscured_target_sentence_array);
  // user_identifier = get_user_identifier();
  // get_game_state();
  // get_character_pool();
  // get_player_state();
});

const command_keys = ["Control", "Alt", "Shift", "Meta"];

// click and keydown both apply the key but under different circumstances
// var entry_block = false;
var last_key_pressed = null;

document.addEventListener("keydown", ({ key }) => {
  last_key_pressed = key;
  if (entry_block) {
    return;
  }

  console.log(key)
  var keyElementID = null;
  var keyElement = null;
  switch (key) {
    case "Enter":
      keyElementID = "Submit"
      last_key_pressed = keyElementID;
      if (!game_started) {
        start_game();
      }
      console.log("Key is Enter")
      break;
    case "Backspace":
      if (last_key_pressed == "submit") {
        character_pool = Object.assign({}, initialCharacterPool);
      }
      keyElementID = "Delete"
      console.log("Key is Backspace")
      break;
    case " ":
      console.log("Key is Space")
      keyElementID = "Space"
      if (!game_started) {
        start_game();
      }
      break;
    default:
      if (key.match(/^[a-z]$/i)) {
        keyElementID = key.toUpperCase();
        console.log("Key is alpha")
      }
      else {
        console.log("Key is not used")
        // if it is a command key like ctrl, alt, shift, etc. then 
        // turn on the entry block so that the keydown event doesn't
        // apply keys until the keyup event is triggered
        if (command_keys.includes(key)) {
          entry_block = true;
        }
        return;
      }
      break;
  }
  // is the key alpha ? a-z, A-Z

  keyElement = document.getElementById(keyElementID);

  if (game_started == false) {
    return;
  }
  keyElement.classList.add("hit")
  keyElement.addEventListener('animationend', () => {
    keyElement.classList.remove("hit")
  })
  applyKey(keyElementID);
})

// keyup event for when the user is holding down a command key, 
// we need to wait for the keyup event to apply the key
// the keyup will listen for command keys listed in the command_keys array

document.addEventListener("keyup", ({ key }) => {
  if (entry_block) {
    entry_block = false;
  }
})

keys.push("Delete");
keys.push("Submit");
// keys.push("Space");

const keyElements = keys.map((key) => document.getElementById(key));
for (const keyElement of keyElements) {
  keyElement.addEventListener("click", () => {
    keyElement.classList.add("hit")
    keyElement.addEventListener('animationend', () => {
      keyElement.classList.remove("hit")
    })
    applyKey(keyElement.id);
  })
}

space_keyElement = document.getElementById("Space");

space_keyElement.addEventListener("click", () => {
  space_keyElement.classList.add("hit")
  space_keyElement.addEventListener('animationend', () => {
    space_keyElement.classList.remove("hit")
  })
  if (!game_started) {
    start_game();
  }
  else { applyKey("Space"); }
})




function validate_guess(guess) {
  var res = "correct words: ";
  var correct_count = 0;
  var target_sentence_words = target_sentence.split(" ");
  console.log(guess);
  var guess_words = guess.split(" ");
  console.log(guess_words);
  if (guess_words.length < 3) {
    return "not enough words";
  }
  if (guess == target_sentence) {
    for (var i = 0; i < target_sentence_words.length; i++) {
      if (!known_words.includes(target_sentence_words[i])) {
        known_words.push(target_sentence_words[i]);
      }
    }
    return "You win!";
  } else {
    for (var i = 0; i < target_sentence_words.length; i++) {
      if (guess_words.includes(target_sentence_words[i])) {
        res += target_sentence_words[i] + " ";
        correct_count += 1;
        if (!known_words.includes(target_sentence_words[i])) {
          known_words.push(target_sentence_words[i]);
        }
        console.log(known_words);
      } else {
        res += ",";
      }
    }
    if (correct_count == 0) {
      return "no correct words";
    }
    return res;
  }
}


// document.addEventListener("click", ({ key }) => {
//   console.log(key)

//   keyElement.classList.add("hit")
//   keyElement.addEventListener('animationend', () => {
//     keyElement.classList.remove("hit")
//   })
// })


// targetRandomKey();

// if (keyPressed === highlightedKey.innerHTML) {
//   timestamps.unshift(getTimestamp());
//   const elapsedTime = timestamps[0] - timestamps[1];
//   console.log(`Character per minute ${60/elapsedTime}`)
//   highlightedKey.classList.remove("selected");
//   targetRandomKey();
// }

function start_timer() {
  var timer = setInterval(function () {
    var minutes = Math.floor(time_left / 60);
    var seconds = time_left - minutes * 60;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    document.getElementById("timer").innerHTML = minutes + ":" + seconds;
    time_left -= 1;
    if (time_left < 0) {
      clearInterval(timer);
      document.getElementById("timer").innerHTML = "0:00";
    }
  }, 1000);
}

// listen for the start button to be clicked

document.getElementById('start-button').addEventListener('click', function () {
  start_game();
});

function start_game() {
  document.getElementById('start_button_container').style.display = 'none';
  start_timer();
  game_started = true;
}