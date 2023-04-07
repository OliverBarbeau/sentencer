from string_combination_hash import combined_hash


class PlayerState:
    def __init__(self, _userID, _score=0, _guesses=[], _guesses_scores=[], _guesses_set=set(), _game_won=False) -> None:
        self.userID = _userID  # type - str an ip address or any unique identifier
        self.score = _score  # type - int
        self.guesses_list = _guesses  # type - list of str
        self.guesses_hash_set = _guesses_set  # type - set of str
        self.game_won = _game_won  # type - bool
        # self.validity_complaint = ""  # type - str
        self.guesses_scores = _guesses_scores  # type - list of int

    def __str__(self) -> str:
        return f"Player State: userID: {self.userID}, score: {self.score}, guesses_list: {self.guesses_list}, game_won: {self.game_won}"
    def to_json(self):
        return {"userID": self.userID, "score": self.score, "guesses_list": self.guesses_list, "game_won": self.game_won}