export interface Entry {
  /** Should correspond to the file's name i.e.: (`entryId123.json` should contain an id of `entryId123`) */
  id: string;
  domain?: string;
  description: string;
  /**
   * username or e-mail
   */
  username?: string;
  password: string;
  /**
   * Date as ISO string format - when the entry was added.
   */
  date: string;
  keywords: string[];
  previousEntryId: string | null;
  nextEntryId: string | null;
  /** Initialization vector (IV) as string - used for encryption */
  iv?: string;
}

export type UpdateEntry = Pick<Entry, "description" | "password"> &
  Pick<Partial<Entry>, "domain" | "username">;

export type NewEntry = Partial<Pick<Entry, "domain" | "username">> &
  Pick<Entry, "description" | "password" | "iv">;

export namespace RequestPayload {
  export namespace GET {
    export interface Entries {
      length: string;
      cursor: string;
    }
  }

  export namespace POST {
    export interface Entry {
      body: NewEntry;
    }
  }

  export namespace PATCH {
    export interface Entry {
      body: {
        id: string;
        payload: Partial<UpdateEntry>;
      };
    }
  }

  export namespace DELETE {
    export interface Entry {
      body: {
        /** Entry id */
        id: string;
      };
    }
  }
}

export interface Endpoints {
  base: string;
  GET: {
    entries: {
      path: string;
      params: {
        cursor: string | null;
        length: number | null;
      };
    };
  };
  DELETE: {
    entry: {
      path: string;
      body: {
        id: string | null;
      };
    };
  };
  POST: {
    entry: {
      path: string;
      body: NewEntry;
    };
  };
}

export interface User {
  username: string;
  password: string;
}
