from flask import Flask, jsonify, render_template
from flask_cors import CORS, cross_origin
from game_state import GameState
from todays_letter_bank import todays_target_sentence_letter_bank, todays_target_sentence

app = Flask(__name__)
CORS(app)
# the game state is a singleton
GS = GameState(_target_sentence="the best things in life are free")


@app.route('/_ah/warmup')
def warmup():
    return '', 200


@app.route('/')
@cross_origin()
def index():
    return render_template('/site/index.html')


@app.route('/player_state/<player_id>', methods=['GET'])
@cross_origin()
def get_player_state(player_id):
    return GS.get_player_state(player_id).to_json()


@app.route('/letter_bank', methods=['GET'])
@cross_origin()
def get_todays_target_sentence_letter_bank():
    return jsonify(todays_target_sentence_letter_bank())


@app.route('/target_sentence', methods=['GET'])
@cross_origin()
def get_todays_target_sentence():
    return jsonify(todays_target_sentence())


@app.route('/submit_guess/<player_id>/<guess_entry>', methods=['GET'])
@cross_origin()
def submit_guess(player_id, guess_entry):
    guess_entry = guess_entry.replace("+", " ")
    print("submit_guess: player_id: " +
          player_id + " guess_entry: " + guess_entry)
    guess_score, guess_correct_words, letter_points, p_state, validity_complaint = GS.process_guess(
        player_id, guess_entry)
    return jsonify({"guess_score": guess_score, "guess_correct_words": guess_correct_words, "letter_points": letter_points, "p_state": p_state.to_json(), "validity_complaint": validity_complaint})


def main(request):
    from flask import request

    if request.path.startswith('/'):
        request.path = request.path[1:]

    with app.request_context(request.environ):
        try:
            response = app.preprocess_request()
            if response is None:
                response = app.dispatch_request()
            response = app.make_response(response)
            response = app.process_response(response)
            return response
        except Exception as e:
            response = app.handle_exception(e)
            return response


if __name__ == '__main__':
    # game_state = GameState(_target_sentence="the best things in life are free")
    ip = '0.0.0.0'
    port = 5000
    # app.run(host=ip, port=port, debug=True)
    app.run(host=ip, port=port, debug=True)
