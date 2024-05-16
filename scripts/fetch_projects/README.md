# Running the project fetching script

This script facilitates fetching available projects using the 42 API and saves the data into `/data/projects_{id}.json`.


## 1. Setting up the environment

Ensure you follow steps 1, 3, and 4 outlined in the [running locally guide](https://github.com/lucas-ht/42calculator/blob/main/docs/running.md).


## 2. Installing the dependencies

Navigate to the project fetching script directory:
```bash
cd ./scripts/fetch_projects/
```

Create a Python virtual environment:
```bash
python3 -m venv ./venv
source ./venv/bin/activate
```

Install Python dependencies:
```bash
pip install -r ./requirements.txt
```


## 3. Running the project fetching script:

Since the script reads the API key from the .env.local file in the execution directory, return to the root of the project:
```bash
cd -
```

Now execute the script:
```bash
python ./scripts/fetch_projects/
```
