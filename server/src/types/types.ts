export interface Entry {
  /** Should correspond to the file's name i.e.: (`entryId123.json` should contain an id of `entryId123`) */
  id: string;
  domain: string;
  description?: string;
  /**
   * username or e-mail
   */
  username: string;
  password: string;
  /**
   * Date as ISO string format - when the entry was added.
   */
  date: string;
  keywords: string[];
  previousEntryId: string | null;
  nextEntryId: string | null;
}

export namespace RequestPayload {
  export namespace GET {
    export interface Entries {
      length: string;
      entry: string;
    }
  }

  export namespace POST {
    export interface Entry {
      body: Pick<Entry, "description" | "domain" | "password" | "username">;
    }
  }
}
