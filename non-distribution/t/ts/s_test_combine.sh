#!/bin/bash
# This is a student test

# This script tests `combine.sh` by providing a simple inline input containing
# multiple tokens. We then check that the output contains the expected 1-grams,
# 2-grams, and 3-grams.

set -e  # Exit immediately if a command exits with a non-zero status

# 1. Define a test input that should produce well-known n-grams
TEST_INPUT="apple banana carrot apple"

# 2. Run `combine.sh` on this test input
OUTPUT=$(echo "$TEST_INPUT" | ./c/combine.sh)

# 3. Define the n-grams we expect to find in the output
#    - The script outputs lines with each n-gram or partial combination
#      typically sorted. We only check for the presence of these n-grams.
EXPECTED_1GRAMS=("apple" "banana" "carrot")
EXPECTED_2GRAMS=("apple banana" "banana carrot" "carrot apple")
EXPECTED_3GRAMS=("apple banana carrot")

# 4. Function to check for an array of expected items in the OUTPUT
check_grams() {
  local -n GRAMS=$1
  local FAIL_COUNT=0
  for gram in "${GRAMS[@]}"; do
    # Each line from combine.sh may use tabs or spaces as separators,
    # but we just check if the substring is present.
    if ! grep -q "$gram" <<< "$OUTPUT"; then
      echo "ERROR: '$gram' not found in combine.sh output"
      FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
  done
  return $FAIL_COUNT
}

# 5. Perform checks
FAIL_SUM=0
check_grams EXPECTED_1GRAMS || ((FAIL_SUM+= $?))
check_grams EXPECTED_2GRAMS || ((FAIL_SUM+= $?))
check_grams EXPECTED_3GRAMS || ((FAIL_SUM+= $?))

# 6. If any expected n-gram was missing, exit with an error
if [[ $FAIL_SUM -ne 0 ]]; then
  echo "FAILURE: Some expected n-grams were not produced by combine.sh."
  exit 1
fi

# 7. Otherwise, report success
echo "SUCCESS: combine.sh produced all expected 1-grams, 2-grams, and 3-grams."
exit 0