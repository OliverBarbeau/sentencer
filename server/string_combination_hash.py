import hashlib


def sha256_hash(string):
    return hashlib.sha256(string.encode('utf-8')).hexdigest()


def combined_hash(sentence):
    words = sentence.split()
    sorted_words = sorted(words)
    combined_string = ' '.join(sorted_words)
    return sha256_hash(combined_string)
