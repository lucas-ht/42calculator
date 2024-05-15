# Running 42calculator locally

## 1. Create a 42 API key

To use 42 OAuth and retrieve user projects, you need to create an API key.

You will need to provide the following callback:

```
http://localhost:3000/auth/callback/42-school
```

## 2. Set up a bucket

For this project, I used Vercel's Blob since it's built with Next.js.
You can use other providers or a database, but it will require some modifications.

The bucket will store `/data/projects_{id}.json` and `/data/experience_{id}.json` files.


## 3. Clone the repository

Clone the 42calculator repository with the following command:

```bash
git clone https://github.com/lucas-ht/42calculator.git
```


## 4. Configure environment variables

Create a `.env` file using the provided `.env.example` template and fill it accordingly:
* `AUTH_SECRET`: A randomly generated string.
* `AUTH_42_SCHOOL_ID`: Your 42 API's UID.
* `AUTH_42_SCHOOL_SECRET`: Your 42 API's secret.
* `BLOB_READ_WRITE_TOKEN`: The Vercel bucket API key.


## 5. Install the dependencies

Install Node dependencies using:
```bash
npm install
```


## 6. Run the Application

With everything set up, you can now run the application:

```bash
npm run dev
```

Access it by navigating to http://localhost:3000 in your browser.
