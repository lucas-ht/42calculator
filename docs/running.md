# Running 42calculator locally

## Prerequisites

Before you begin, ensure you have the following installed on your system:

* [Docker](https://www.docker.com/)


## 1. Create a 42 API key

To use 42 OAuth and retrieve user projects, you need to create an API key from the 42 intra.

1. Visit the 42 API [OAuth page](https://profile.intra.42.fr/oauth/applications).

2. Create a new application and use the following callback URL:

```
http://localhost:3000/auth/callback/42
```


## 2. Configure environment variables

Create a `.env` file using the provided `.env.example` template and fill it accordingly.

### Example `.env` file:

```makefile
# A randomly generated string used in the authentication process
AUTH_SECRET="secret"

# The UID and SECRET of the 42 API application
AUTH_42_SCHOOL_ID="u-s4t2ud..."
AUTH_42_SCHOOL_SECRET="s-s4t2ud..."

# The URL and token of the Redis HTTP API
KV_REST_API_URL="http://redis-http"
KV_REST_API_TOKEN="secret"
```

> [!TIP]
> For a local deployment, you only need to set `AUTH_42_SCHOOL_ID` and `AUTH_42_SCHOOL_SECRET`.


## 3. Run 42calculator

With everything set up, you can now run 42calculator:

```bash
docker compose up --build
```

Access 42calculator by navigating to http://localhost:3000 in your browser.
