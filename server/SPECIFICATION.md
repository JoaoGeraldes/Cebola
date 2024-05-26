# SPECIFICATION

Data structures and sorting algorithms must be optimized for quick searches, and storage should prioritize ordering by date from most recent to oldest.

- Search an entry by its domain, description or username/email.
- (default) The entries must be displayed by date in DESCENDING order. (most recent first).
- Entries can be updated and deleted.
- Each entry is stored in its own directory, in its own file (`.json`)

  ```js
  // Directories should be hashed and unique. These names (below) are provided as examples for the sake of clarity.

  /entries
  |
  └─── /dir1
  │    └─── entry1.json
  │
  └─── /dir2
  |    └─── entry2.json
  |
  └─── /dir3
       └─── entry3.json

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

- Each insertion, MUST update the `last-insertion-entry-id.json` with the last entry id added.
- Each node has two pointers: one to the next node (entry id) and one to the previous node (entry id).
- This allows traversal in both directions (forward and backward).

```js
// Example of the structure and their connections
// null <- Entry 1 <-> Entry 2 <-> Entry 3 -> null
```

- When inserting a new entry, each word, taken from the description, creates a new `.json` file within the `/keywords` directory on the server (if not present yet), where the name of `.json` file is the keyword itself. Only letters and numbers are allowed to be written in the description. Within that directory, lives a `.json` file that stores information about which entries. Only words or numbers with >= 3 length should be stored.

**IMPORTANT**: When removing an entry, the property of the _Entry_ should also be removed from the keywords file where it is present. Once a file is created for a keyword (ie: `banana.json` for the word _banana_) should be kept in storage, even though it might become empty `{}`

### Use-cases while inserting a new entry:

1. It's the very first item:
   - creates an entry, where previous is `null` and next is `null`
1. It's the last item (any entry being inserted is always the last):
   - updates previous entry to point to this last entry. Current entry next points to `null`.
1. A fallback should be in place in case of an insertion or deletion goes wrong. The updates to the database must be atomic, if anything fails within the chain of an insertion or deletion, the system must rollback to previous state before the failure. Before each insertion, update or delete we must create copy of the `/database/database_state.json` and as many `/database/entries/<entry-id>.json` files as required on each action. Each action can touch (modify) up to 3 files.

### Use-cases while removing an entry:

1.  It's the first entry:

- Has to update the entry on the right, set the `previousEntryId` to `null`

1.  It's somewhere in the middle.

- Has to update the entries on the left, and right to new `previousEntryId` and `nextEntryId`.

1. It's the very last entry:

- updates the previous entry to point to next (`nextEntryId`) `null`.

```js
// entry1.json
{
   domain: "domain.com";
   description: "banana and strawberry";
   username: "john";
   password: "admin";
   date: "2024-05-18T19:53:19.814Z";
   keywords: ["banana", "and", "strawberry"];
}

// /keywords directory, after creating entry1.json
/keywords
|
└─── banana.json
│
└─── and.json
|
└─── strawberry.json

// banana.json, and.json, strawberry.json, would be created in the /keywords dir and, would have stored the following data:
{
   entry1: true,
}

// Deleting entry1.json from the database, would reset all the keyword files (banana.json, and.json, strawberry.json) to:
{}
```
