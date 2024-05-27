import express from "express";
import cors from "cors";
import { Entry, RequestPayload } from "./types/types.ts";
import { Cebola } from "./Cebola.ts";

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
    internal: { error: "Something went wrong while retrieving entries." },
  };

  try {
    const query: RequestPayload.GET.Entries = {
      entry: req.query.entry as string,
      length: req.query.length as string,
    };

    let entry: Partial<Entry> | false = false;

    const entriesToSend: Entry[] = [];
    const entriesPerPage = parseInt(query.length) || 5;

    if (query.entry) {
      entry = await Cebola.getEntry(query.entry);
    } else {
      const lastEntryId = await Cebola.getTailId();
      entry = await Cebola.getEntry(lastEntryId);
    }

    if (entry) {
      for (let i = 0; i < entriesPerPage; i++) {
        /* const previous = await Cebola.getEntry(entry.id); */

        entriesToSend.push(entry as Entry);

        if (!entry.previousEntryId) {
          break;
        }

        entry = (await Cebola.getEntry(entry.previousEntryId)) as Entry;
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

    const hasSucceeded = await Cebola.createEntry({
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
app.patch("/entry", (req, res) => {
  const errors = {
    missingFields: { error: "Missing fields" },
    internal: { error: "Something went wrong while creating entry." },
  };

  try {
    const requestPayload: RequestPayload.POST.Entry["body"] = req.body;

    if (
      !requestPayload.description &&
      !requestPayload.domain &&
      !requestPayload.password &&
      !requestPayload.username
    ) {
      req.res.status(404).json(errors.missingFields);
      return;
    }

    req.res.status(200).send(requestPayload);
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
    if (
      !entry ||
      !entry.description ||
      !entry.domain ||
      !entry.password ||
      !entry.username
    ) {
      return true;
    }

    return false;
  } catch {
    return true;
  }
}
