// Each entry is stored in a directory with unique name (hashed)

interface DatabaseModel {}

export interface Entry {
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
  tail: string | null;
  head?: string | null;
}

export interface DatabaseState {
  last_entry_id: string;
  first_entry_id?: string;
}

const example = {};
