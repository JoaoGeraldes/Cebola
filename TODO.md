- Add token verification for the rest of the endpoints, like it was done on the GET /entries. (client must send Authorization header with bearer token retrieved from /login). Server must accept a third parameter which passes the token verification function.

- instead of creating the backup.zip file on the client, send the right name from the server via headers, or something else.

- review if backup files created on writes (create/update/delete) are actually recovered back to the original files whenever an error is catched.

- a token is set to be valid for 1h. Though, if the username+password which are used for decrypt passwords are not set we can't unlock the passwords. Find a way to improve UX on these cases. Example: A user might be logged in (token is still valid) but the username and password are not set in the frontend. Happens for instance, when we refresh the page.

- improve the logo. Redesign to a high quality SVG.

- make sure the first request (login) sends the payload already encrypted.

- improve pagination behavior on the client side.

- trim the other input fields. Currently, only the password is being trimmed (remove whitespace from both ends of the strings)

- create component for modal logic. Separate the _cebola guy_ from the main modal being used in the `<App />`

- fix message countdown whenever another message is the same as previous (ie: copy to clipboard), it's not updating the countdown on a new message pops (assuming the previous one was not closed)

- instead of storing plain text on session storage (ie: username+password) store it in cipher text.

- implement a searching feature, which searches by entry's description.
