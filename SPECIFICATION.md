# SPECIFICATION

Data structures and sorting algorithms must be optimized for quick searches, and storage should prioritize ordering by date from most recent to oldest.

- Search an entry by its domain, description or username/email.
- (default) The entries must be displayed by date in DESCENDING order. (most recent first).
- Entries can be updated and deleted.
- Each entry is stored in its own directory, in its own file (`.json`)

  ```js
  // Directories should be hashed and unique. These names (below) are provided as examples for the sake of clarity.
  /database
  |
  └─ /entries
     └─ entry1.json
     └─ entry2.json
     └─ entry3.json

  // The structure of an entry would look something like and must follow a doubly linked list to keep insertion ordered by previous/next. Assuming there's no previous node (entry), the previousEntryId is null.


  {
     domain: "domain.com",
     description: "banana and strawberry",
     username: "john",
     password: "admin",
     date: "2024-05-18T19:53:19.814Z",
     keywords: string["banana", "and", "strawberry"],
     previousEntryId: null,
     nextEntryId: null,
  }
  ```

- Each write operation, MUST update the `tail.json` which is a clone of the last entry (tail) added to the database.
- Each node has two pointers: one to the next node (entry id) and one to the previous node (entry id).
- This allows traversal in both directions (forward and backward).

