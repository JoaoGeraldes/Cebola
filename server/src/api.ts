import express from "express";
import cors from "cors";
import { Entry } from "./types/types.ts";
import { Cebola } from "./Cebola.ts";

namespace ClientRequest {
  export interface Payload {
    POST: Pick<Entry, "description" | "domain" | "password" | "username">;
  }
}

const app = express();
const PORT = process.env.PORT || 9000;

// Enable CORS for all requests
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

/* ------------------------------ */
/* --------- GET /entry --------- */
/* ------------------------------ */
app.get("/entry", (req, res) => {
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
    const requestPayload: ClientRequest.Payload["POST"] = req.body;

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
    const requestPayload: ClientRequest.Payload["POST"] = req.body;

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
function hasMissingFields(entry: ClientRequest.Payload["POST"]) {
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
