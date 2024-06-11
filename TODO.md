- Add token verification for the rest of the endpoints, like it was done on the GET /entries. (client must send Authorization header with bearer token retrieved from /login). Server must accept a third parameter which passes the token verification function.

- instead of creating the backup.zip file on the client, send the right name from the server via headers, or something else.
