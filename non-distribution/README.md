# non-distribution

This milestone aims (among others) to refresh (and confirm) everyone's
background on developing systems in the languages and libraries used in this
course.

By the end of this assignment you will be familiar with the basics of
JavaScript, shell scripting, stream processing, Docker containers, deployment
to AWS, and performance characterization—all of which will be useful for the
rest of the project.

Your task is to implement a simple search engine that crawls a set of web
pages, indexes them, and allows users to query the index. All the components
will run on a single machine.

## Getting Started

To get started with this milestone, run `npm install` inside this folder. To
execute the (initially unimplemented) crawler run `./engine.sh`. Use
`./query.js` to query the produced index. To run tests, do `npm run test`.
Initially, these will fail.

### Overview

The code inside `non-distribution` is organized as follows:

```
.
├── c            # The components of your search engine
├── d            # Data files like the index and the crawled pages
├── s            # Utility scripts for linting and submitting your solutions
├── t            # Tests for your search engine
├── README.md    # This file
├── crawl.sh     # The crawler
├── index.sh     # The indexer
├── engine.sh    # The orchestrator script that runs the crawler and the indexer
├── package.json # The npm package file that holds information like JavaScript dependencies
└── query.js     # The script you can use to query the produced global index
```

### Submitting

To submit your solution, run `./scripts/submit.sh` from the root of the stencil. This will create a
`submission.zip` file which you can upload to the autograder.

## Summary
My implementation consists of 4 components addressing T1-8, including getText.js for HTML text extraction, getURLs.js for URL identification, process.sh for text normalization, and query.js for search functionality. The most challenging aspect was implementing the text processing in process.sh because it required careful handling of different input formats and ensuring consistent output formatting for the search system to work correctly. This component needed to properly convert text to lowercase, remove special characters, and maintain proper word separation to match the expected test output format. Most importantly, the shell command is quite abstract, making it difficult to identify bugs. I spent around 2 hours completing this component but couldn't determine why it fails on Gradescope, showing the error message: Error: Command failed: /autograder/source/staging_main/t/test-process.sh 1d0 < C.

## Wild Guess
I estimate that the fully distributed, scalable version of the search engine will take around 5000 lines of code.