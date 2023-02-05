const functions = require("firebase-functions");
const express = require("express");
const admin = require("firebase-admin");

const app = express();
admin.initializeApp({
  credential: admin.credential.cert("./permission.json"),
});

app.use(require("./routes/campaigns.routes"));
app.use(require("./routes/campaigns2.routes"));
app.use(require("./routes/campaigns.api3.routes"));
app.use(require("./routes/campaigns.dev.routes"));
app.use(require("./routes/token.routes"));
app.use(require("./routes/token.api3.route"));
app.use(require("./routes/token.dev.routes"));

exports.app = functions.https.onRequest(app);
