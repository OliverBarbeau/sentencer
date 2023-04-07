
# import modules
import sentencer
import player_state
from todays_letter_bank import todays_target_sentence


class GameState:
    def __init__(self, _target_sentence="Game State Default Sentence", _player_states={}):
        self.target_sentence = _target_sentence
        self.player_id_to_player_state = _player_states
        self.guesser = sentencer.Guesser(sentence=_target_sentence)
        # dictionary of user state objects
        # flush this daily ^^^ at midnight
        # or when the server is restarted

    def remove_player_state(self, player_id):
        del self.player_id_to_player_state[player_id]

    def get_player_state(self, player_id):
        if player_id not in self.player_id_to_player_state:  # we have no player state for this player yet
            # create a new player state object
            self.player_id_to_player_state[player_id] = player_state.PlayerState(
                _userID=player_id)
        return self.player_id_to_player_state[player_id]

    def flush_player_states(self):
        self.player_id_to_player_state = {}

    def set_target_sentence(self, sentence):
        self.target_sentence = sentence

    # can be reused for anytime the server needs to check for misc things, like a daily reset
    def check_for_daily_housekeeping(self):
        # housekeeping
        pass

    def housekeeping(self):
        self.flush_player_states()
        new_target_sentence = todays_target_sentence()
        self.set_target_sentence(new_target_sentence)
        self.guesser = sentencer.Guesser(sentence=new_target_sentence)

    # update and return the player state object
    def process_guess(self, player_id, guess_sentence):
        # do some regular daily housekeeping, like flushing player states, recording to the the score history, etc
        if self.check_for_daily_housekeeping():
            self.housekeeping()
        # check for special developer reset command

        if guess_sentence == "?":
            self.housekeeping()
        # do we have a player state for this player?

        # try the guess and get the score, considering there may be spelling mistakes, grammar mistakes, etc
        guess_score, guess_correct_words, letter_points, p_state, validity_complaint = self.guesser.guess(
            guess_sentence, self.player_id_to_player_state[player_id])  # this will update the player state and return it upon a successful guess
        self.player_id_to_player_state[player_id] = p_state
        return (guess_score, guess_correct_words, letter_points, p_state, validity_complaint)


if __name__ == "__main__":
    # create a list of sentences
    # or import a list of sentences from a file
    sentences = ["The best things in life are free",
                 "Welcome to the new world", "I am become death, destroyer of words"]
