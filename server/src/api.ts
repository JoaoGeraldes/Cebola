import express from "express";
import cors from "cors";
import { Entry, RequestPayload } from "../../types.ts";
import { CebolaServer } from "./CebolaServer.ts";
import { auth } from "./config.ts";
import jwt from "jsonwebtoken";
import { getFileSize, hasMissingFields, zipDirectory } from "./utils/utils.ts";
import { existsSync } from "fs";

const app = express();
const PORT = process.env.PORT || 9000;

// Enable CORS for all requests
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to verify JWT from headers
function verifyJWTToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(403).json({ error: "No token provided" });
  }

  const tokenParts = token.split(" ");
  if (tokenParts[0] !== "Bearer" || !tokenParts[1]) {
    return res.status(403).json({ error: "Invalid token format" });
  }

  jwt.verify(tokenParts[1], auth.secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Failed to authenticate token" });
    }
    req.userId = decoded.id;
    next();
  });
}

/* ------------------------------------- */
/* --------- GET /VERIFY_TOKEN --------- */
/* ------------------------------------- */
app.post("/verify-token", verifyJWTToken, (req, res) => {
  try {
    res.status(200).json({ valid: true });
  } catch {
    res.status(401).json({ error: "invalid token" });
  }
});

/* ------------------------------- */
/* --------- GET /backup --------- */
/* ------------------------------- */
app.get("/backup", verifyJWTToken, async (req, res) => {
  try {
    const zipFilePath = await zipDirectory();

    const fileExists = existsSync(zipFilePath);

    if (!fileExists) {
      res.status(404).json({ error: ".zip backup file not found." });
      return;
    }

    const fileSize = getFileSize(zipFilePath);

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Length", fileSize);

    res.download(zipFilePath);
  } catch {
    res.status(500).json({ error: "Something went wrong." });
  }
});

/* ------------------------------ */
/* --------- GET /login --------- */
/* ------------------------------ */
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if the provided username and password match admin credentials
  if (
    username === auth.adminCredentials.username &&
    password === auth.adminCredentials.password
  ) {
    // Create a token with the admin id
    const token = jwt.sign({ id: auth.adminCredentials.id }, auth.secretKey, {
      expiresIn: auth.tokenExpiresIn,
    });

    // Set HttpOnly cookie
    /*   res.cookie("authToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    }); */

    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid username or password" });
  }
});

/* -------------------------------- */
/* --------- GET /entries --------- */
/* -------------------------------- */
app.get("/entries", verifyJWTToken, async (req, res) => {
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

    const privateKey = `${auth.adminCredentials.username}+${auth.adminCredentials.password}`;

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
app.get("/entry", verifyJWTToken, (req, res) => {
  req.res.send("To be implemented...");
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

    const hasSucceeded = await CebolaServer.createEntry(
      {
        ...requestPayload,
      },
      null
    );

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

/* --------------------------------- */
/* --------- DELETE /entry --------- */
/* --------------------------------- */
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
