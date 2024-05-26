import { Cebola } from "./Cebola.ts";

/* Cebola.deleteEntry("nwpxaji7hr2mxbu7akr9e18s"); */

// Utils

/* Cebola.createEntry(
  {
    domain: "entry1",
    password: "entry1",
    username: "entry1",
    description: "entry1",
  },
  "entry1"
).then(() => {
  Cebola.createEntry(
    {
      domain: "entry2",
      password: "entry2",
      username: "entry2",
      description: "entry2",
    },
    "entry2"
  ).then(() => {
    Cebola.createEntry(
      {
        domain: "entry3",
        password: "entry3",
        username: "entry3",
        description: "entry3",
      },
      "entry3"
    );
  });
}); */

/* Cebola.deleteEntry("entry1").then(() => {
  Cebola.deleteEntry("entry2").then(() => {
    Cebola.deleteEntry("entry3");
  });
}); */
/* Cebola.deleteEntry("entry1"); */

export async function start_now() {
  const id = await Cebola.getTailId();
  console.log("getTailId", id);
}
start_now();
