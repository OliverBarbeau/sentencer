# import random
import re
import subprocess
import player_state
from string_combination_hash import combined_hash
import enchant
enchant.dict_exists("en_US")

def input_parse(input):
    # parse input into a list of words
    # remove punctuation
    input = re.sub(r'[^\w\s]', '', input)
    # remove extra spaces
    input = re.sub(r'\s+', ' ', input)
    # convert to lowercase
    input = input.lower()
    # convert to list
    input = input.split()
    return input


class Guesser:
    def __init__(self, sentence="life is like a box of chocolates"):
        self.target_sentence = sentence
        self.words = []
        self.word_to_count = {}
        self.word_count = 0
        self.letter_to_count = {}
        self.letter_count = 0
        self.set_word_count()
        self.set_letter_count()
        self.dictionary = enchant.Dict("en_US")
        self.dictionary.list_dicts()

    def choose_random_sentence(self, sentence_file_loc):
        # TODO: load sentences from a file
        # pick a random line (sentence) from the file
        pass

    def choose_next_sentence_in_sequence(self, sentence_file_loc):
        pass

    def set_letter_count(self):
        c = 0
        for word in self.words:
            for letter in word:
                c += 1
                if letter in self.letter_to_count:
                    self.letter_to_count[letter] += 1
                else:
                    self.letter_to_count[letter] = 1
        self.letter_count = c

    def set_word_count(self):
        self.words = input_parse(self.target_sentence)
        for word in self.words:
            if word in self.word_to_count:
                self.word_to_count[word] += 1
            else:
                self.word_to_count[word] = 1
        self.word_count = len(self.words)

    def is_guess_valid(self, guess, p_state):
        # a guess is valid if:
        # - it is not empty
        # - it is not a duplicate of a previous guess
        # - it only contains letters in the target sentence
        #   - each letter can only be used up to the number of times it appears in the target sentence
        if guess == "":
            validity_complaint = "Guess cannot be empty"
            return None, None, validity_complaint
        if combined_hash(guess) in p_state.guesses_hash_set:
            validity_complaint = "A guess with those words was already made"
            return None, None, validity_complaint
        guess_word_list = input_parse(guess)
        guess_word_count = len(guess_word_list)
        for word in guess_word_list:
            if word.isalpha() is False:
                validity_complaint = "Guess can only contain letters"
                return None, None, validity_complaint
        if guess_word_count < 3:
            validity_complaint = "Guess sentence must be at least 3 words"
            return None, None, validity_complaint
        guess_letter_to_count = {}
        guess_letter_count = 0
        guess_word_to_count = {}

        # tabulate the letter and word counts in the guess
        for word in guess_word_list:
            if word in guess_word_to_count:
                guess_word_to_count[word] += 1
            else:
                guess_word_to_count[word] = 1
            for letter in word:
                if letter in guess_letter_to_count:
                    guess_letter_to_count[letter] += 1
                else:
                    guess_letter_to_count[letter] = 1
                guess_letter_count += 1
        if guess_letter_count > self.letter_count:
            validity_complaint = "Guess contains too many letters"
            return None, None, validity_complaint
        # the browser should validate these, but just in case we'll check them here too
        for letter in guess_letter_to_count:
            if letter not in self.letter_to_count:
                validity_complaint = "Guess contains letters not in the target sentence: " + letter
                return None, None, validity_complaint
            if guess_letter_to_count[letter] > self.letter_to_count[letter]:
                validity_complaint = "Guess contains too many of a letter: " + letter
                return None, None, validity_complaint

        # spellcheck, any incorrectly spelled word will invalidate the guess
        # I think we need to filter more words out from being correct english words

        for word in guess_word_list:
            if self.dictionary.check(word) is False:
                validity_complaint = "Guess contains an invalid word: " + word
                return None, None, validity_complaint

        # if we got here the sentence has valid spelling, outside of grammar

        # now lets check for grammar??
        # TODO: check for grammar and add a score penalty for grammar errors

        validity_complaint = ""
        return (guess_word_list,  guess_word_to_count, validity_complaint)

    def guess(self, guess_sentence, p_state):
        validity_complaint = ""
        guess_decomposition = self.is_guess_valid(guess_sentence, p_state)
        (guess_word_list,  guess_word_to_count,
         validity_complaint) = guess_decomposition
        if guess_word_list is None:
            # the guess must be invalid so return 0 and no correct words
            # the object's new validity complaint should be set by is_guess_valid
            return 0, [], 0, p_state, validity_complaint

        # all words correct is 500 points
        # all letters correct is 500 points
        # split the points among the number of words and letters
        # a correct word is worth 500 * letters correct / letters total
        # any letter is worth 500 / number of letters
        # any guess using all of the letters (an anagram) is automatically 1000 points, regardless to it being the target sentence

        correct_guess_words = []
        score = 0

        word_match_points_total = 0
        for word in guess_word_to_count:
            if word in self.word_to_count:
                num_correct_occurences = min(
                    guess_word_to_count[word], self.word_to_count[word])
                word_match_points = (len(word)/self.letter_count) * 500
                word_match_points_total += word_match_points * num_correct_occurences
                correct_guess_words.extend(
                    [(word, word_match_points)] * num_correct_occurences)

        points_per_letter = 500/self.letter_count
        letter_points = 0
        for word in guess_word_list:  # if we got here all the letters are valid and the words are correctly spelled
            letter_points += points_per_letter * len(word)

        score = word_match_points_total + letter_points

        p_state.guesses_hash_set.add(combined_hash(guess_sentence))
        p_state.guesses_list.append(guess_sentence)
        p_state.guesses_scores.append(score)
        p_state.validity_complaint = ""
        score = round(score)
        if score == 1000:
            p_state.game_won = True
            # p_state.validity_complaint = "You win!"
        return (score, correct_guess_words, letter_points, p_state, validity_complaint)


if __name__ == "__main__":
    # create a list of sentences
    # or import a list of sentences from a file
    sentences = ["The best things in life are free",
                 "Welcome to the new world", "I am become death, destroyer of words"]
    # create a Guesser object
    G = Guesser(sentence=sentences[0])
    P = player_state.PlayerState(_userID="test_user")
    print(G.target_sentence)
    print(G.letter_to_count)
    print(G.letter_count)
    guess_count = 0
    guess_sentence = input(
        f"Guess {guess_count+1} - Enter a sentence or phrase: \n")
    while guess_sentence != "!":
        guess_score, correct_guess_words, letter_points, p_state, validity_complaint = G.guess(
            guess_sentence, P)
        print("p_state:", p_state)
        print("validity_complaint:", validity_complaint)
        print("Guess Score:", guess_score)
        P.score += guess_score
        print("Total Score:", P.score)
        if len(correct_guess_words) > 0:
            print("Correct words:", correct_guess_words)
            print("Letter points:", letter_points)
        if P.game_won:
            print("You won!")
            print("The target sentence was:", G.target_sentence)
            print("Feel free to keep racking up points, or enter '!' to quit")
        if guess_score > 0:
            guess_count += 1
        guess_sentence = input(f"Guess {guess_count+1} - Enter a sentence: \n")
    print("Thanks for playing!")
    print("Your final score was:", P.score)
