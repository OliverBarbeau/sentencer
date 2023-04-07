def todays_target_sentence():
    return "Todays Target Sentence"


def todays_target_sentence_letter_bank():
    target_sentence = get_todays_target_sentence()
    letter_to_count = {}
    for letter in target_sentence:
        if letter in letter_to_count:
            letter_to_count[letter] += 1
        else:
            letter_to_count[letter] = 1
    return letter_to_count
