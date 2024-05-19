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
}

const example = {};
