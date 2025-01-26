#!/bin/bash

# Convert input to a stream of non-stopword terms
# Usage: ./process.sh < input > output

# Convert each line to one word per line, **remove non-letter characters**, make lowercase, convert to ASCII; then remove stopwords (inside d/stopwords.txt)
# Commands that will be useful: tr, iconv, grep

STOPWORDS_FILE="./d/stopwords.txt"

# Ensure that the stopwords file exists.
if [ ! -f "$STOPWORDS_FILE" ]; then
  echo "Error: The specified stopwords file '$STOPWORDS_FILE' cannot be found."
  exit 1
fi

# 1. Convert all uppercase letters to lowercase.
tr '[:upper:]' '[:lower:]' |
# 2. Transcode input to ASCII, removing or transliterating non-ASCII characters.
iconv -c -t ASCII//TRANSLIT |
# 3. Replace anything that isn't a letter with a single space.
tr -c '[:alpha:]' ' ' |
# 4. Squeeze repeated spaces into one, then turn them into newlines, ensuring one word per line.
tr -s ' ' '\n' |
# 5. Omit any lines that match a stopword in the specified file.
grep -vFx -f "$STOPWORDS_FILE" |
# 6. Finally, remove empty lines to clean up the output.
grep -v '^$'