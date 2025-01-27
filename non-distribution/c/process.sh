#!/bin/bash

# Convert input to a stream of non-stopword terms
# Usage: ./process.sh < input > output

# Convert each line to one word per line, **remove non-letter characters**, make lowercase, convert to ASCII; then remove stopwords (inside d/stopwords.txt)
# Commands that will be useful: tr, iconv, grep

STOPWORDS_FILE="./d/stopwords.txt"

# Ensure the stopwords file exists
if [ ! -f "$STOPWORDS_FILE" ]; then
  echo "Error: The specified stopwords file '$STOPWORDS_FILE' cannot be found."
  exit 1
fi

# Process the input
tr -d '\r' |                              # Remove Windows-style carriage returns
tr '[:upper:]' '[:lower:]' |              # Convert all uppercase letters to lowercase
iconv -c -t ASCII//TRANSLIT |             # Transcode to ASCII, removing non-ASCII characters
tr -c '[:alpha:]' ' ' |                   # Replace non-letter characters with spaces
tr -s ' ' '\n' |                          # Squeeze spaces and convert to newline-separated words
grep -vFx -f <(grep -v '^$' "$STOPWORDS_FILE") | # Remove stopwords (after cleaning stopword file)
grep -v '^$'                              # Remove empty lines