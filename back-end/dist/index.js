"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_server_1 = require("./api-server");
const config = require("config");
const mongoose = require("mongoose");
const PORT = config.get('api.port');
async function launch() {
    await mongoose.connect('mongodb://localhost/myapp');
    await api_server_1.app.listen(PORT);
    console.log('Running Server on port ' + PORT);
}
launch();
//# sourceMappingURL=index.js.map