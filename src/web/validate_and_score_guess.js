

function validate_guess(guess) {
    console.log(guess);
    var guess_words = guess.split(" ");
    console.log(guess_words);
    if (guess_words.length < 3) {
        return "not enough words";
    }
    if (guess == target_sentence) {
        return "You win!";
    } else {
        var res = "correct words: ";
        var correct_count = 0;
        var target_sentence_words = target_sentence.split(" ");
        for (var i = 0; i < target_sentence_words.length; i++) {
            if (guess_words.includes(target_sentence_words[i])) {
                res += target_sentence_words[i] + " ";
                correct_count += 1;
                known_words.push(target_sentence_words[i]);
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



