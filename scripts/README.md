# Running the project fetching script

This script facilitates fetching available projects using the 42 API and saves the data into `/data/projects_{id}.json`.


## 1. Setting up the environment

Ensure you follow steps 1, 3, and 4 outlined in the [running locally guide](https://github.com/lucas-ht/42calculator/blob/main/docs/running.md).


### Poetry Requirement

Make sure you have [Poetry](https://python-poetry.org/docs/) installed before proceeding, as it is required for managing Python dependencies.


## 2. Installing the dependencies

Navigate to the project fetching script directory:
```bash
cd ./scripts/
```

Install Python dependencies:
```bash
poetry install
poetry shell
```


## 3. Running the project fetching script:

Since the script reads the API key from the .env file in the execution directory, return to the root of the project:
```bash
cd ..
```

Now execute the script:
```bash
python ./scripts/fetch_projects.py
```
