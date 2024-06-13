- Add token verification for the rest of the endpoints, like it was done on the GET /entries. (client must send Authorization header with bearer token retrieved from /login). Server must accept a third parameter which passes the token verification function.

- instead of creating the backup.zip file on the client, send the right name from the server via headers, or something else.

- review if backup files created on writes (create/update/delete) are actually recovered back to the original files whenever an error is catched.

- a token is set to be valid for 1h. Though, if the username+password which are used for decrypt passwords are not set we can't unlock the passwords. Find a way to improve UX on these cases. Example: A user might be logged in (token is still valid) but the username and password are not set in the frontend. Happens for instance, when we refresh the page.

- take care of the usage of a deprecated function `btoa(data: string)` in favor of `Buffer.from(str, 'base64')` like suggested by documentation.

- check why in development bridging to mobile, sessionStorage is not working.
