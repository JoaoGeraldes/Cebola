import express from "express";
import cors from "cors";
import { Entry, RequestPayload } from "../../types.ts";
import { CebolaServer } from "./CebolaServer.ts";

const app = express();
const PORT = process.env.PORT || 9000;

// Enable CORS for all requests
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

/* -------------------------------- */
/* --------- GET /entries --------- */
/* -------------------------------- */
app.get("/entries", async (req, res) => {
  const errors = {
    missingFields: { error: "Missing fields" },
    noEntries: { error: "Oops. No entries were found!" },
    internal: { error: "Something went wrong while retrieving entries." },
  };

  try {
    const query: RequestPayload.GET.Entries = {
      cursor: req.query.cursor as string,
      length: req.query.length as string,
    };

    let entry: Partial<Entry> | false = false;

    const entriesToSend: Entry[] = [];
    const entriesPerPage = parseInt(query.length) || 5;

    if (query.cursor) {
      entry = await CebolaServer.getEntry(query.cursor);
    } else {
      const lastEntryId = await CebolaServer.getTailId();
      if (!lastEntryId) {
        req.res.status(404).json([]);
        return;
      }
      entry = await CebolaServer.getEntry(lastEntryId);
    }

    if (entry) {
      for (let i = 0; i < entriesPerPage; i++) {
        /* const previous = await CebolaServer.getEntry(entry.id); */

        entriesToSend.push(entry as Entry);

        if (!entry.previousEntryId) {
          break;
        }

        entry = (await CebolaServer.getEntry(entry.previousEntryId)) as Entry;
      }

      req.res.status(200).json(entriesToSend);
      return;
    }

    req.res.status(200).json(entriesToSend);
  } catch {
    req.res.status(500).json(errors.internal);
  }
});

/* ------------------------------ */
/* --------- GET /entry --------- */
/* ------------------------------ */
app.get("/entry", (req, res) => {
  req;
  req.res.send("Hello Worldd!");
});

/* ------------------------------- */
/* --------- POST /entry --------- */
/* ------------------------------- */
app.post("/entry", async (req, res) => {
  const errors = {
    missingFields: { error: "Missing fields" },
    internal: { error: "Something went wrong while creating entry." },
  };

  try {
    const requestPayload: RequestPayload.POST.Entry["body"] = req.body;

    if (hasMissingFields(requestPayload)) {
      req.res.status(404).json(errors.missingFields);
      return;
    }

    const hasSucceeded = await CebolaServer.createEntry({
      ...requestPayload,
    });

    console.log("hasSucceeded", hasSucceeded);
    if (hasSucceeded) {
      req.res.status(200).send(requestPayload);
      return;
    } else {
      req.res.status(400).send(errors.missingFields);
      return;
    }
  } catch {
    req.res.status(500).json(errors.internal);
  }
});

/* -------------------------------- */
/* --------- PATCH /entry --------- */
/* -------------------------------- */
app.patch("/entry", async (req, res) => {
  const errors = {
    missingFields: {
      error: "Missing mandatory fields: 'password' or 'description' or 'id'",
    },
    internal: { error: "Something went wrong while creating entry." },
  };

  try {
    const requestPayload: RequestPayload.PATCH.Entry["body"] = req.body;

    if (
      !requestPayload?.id &&
      !requestPayload?.payload?.domain &&
      !requestPayload?.payload?.password
    ) {
      req.res.status(404).json(errors.missingFields);
      return;
    }

    const updatedEntry = await CebolaServer.updateEntry(
      requestPayload.id,
      requestPayload.payload
    );

    req.res.status(200).send(updatedEntry);
  } catch {
    req.res.status(500).json(errors.internal);
  }
});

/* ---------------------------------------- */
/* --------- DELETE /entry/delete --------- */
/* ---------------------------------------- */
app.delete("/entry", async (req, res) => {
  const errors = {
    missingFields: { error: "Missing entry id" },
    internal: { error: "Something went wrong while DELETING entry." },
  };

  try {
    const requestPayload: RequestPayload.DELETE.Entry["body"] = req.body;

    console.log("Attempt to delete entry: ", requestPayload);

    if (!requestPayload.id) {
      console.log("Will fail!");
      res.status(404).json(errors.missingFields);
      return;
    }

    const deletedEntry = await CebolaServer.deleteEntry(requestPayload.id);
    req.res.status(200).send(deletedEntry);
  } catch {
    req.res.status(500).json(errors.internal);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Utils
function hasMissingFields(entry: RequestPayload.POST.Entry["body"]) {
  try {
    console.log("hasMissingFields", entry);
    if (!entry || !entry.description || !entry.password) {
      return true;
    }

    return false;
  } catch {
    return true;
  }
}
