// update the displayed obscured target sentence
// appears as ___ ____ _____ , blanks for where the words are, and if the word has been gueseed,
// it will be displayed


var current_target_sentence = target_sentence;
var current_obscured_target_sentence_array = obscured_target_sentence_array;
var current_known_words = known_words;


function update_target_sentence_display() {
    var target_sentence_display = document.getElementById("target_sentence_display");
    var target_sentence_display_text = "";
    for (var i = 0; i < current_obscured_target_sentence_array.length; i++) {
        target_sentence_display_text += current_obscured_target_sentence_array[i] + " ";
    }
    target_sentence_display.innerHTML = target_sentence_display_text;
}


function build_obscured_target_sentence_array() { // found words are shown, unfound words are blanked out
    var new_obscured_target_sentence_array = [];
    var target_sentence_words = current_target_sentence.split(" ");
    for (var i = 0; i < target_sentence_words.length; i++) {
        if (current_known_words.includes(target_sentence_words[i])) {
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