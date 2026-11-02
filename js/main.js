import { FamilyModel } from "./model.js";
import { FamilyView } from "./view.js";
import { FamilyController } from "./controller.js";

const controller = new FamilyController(new FamilyModel(), new FamilyView(document.getElementById("app")));
const page = document.body.dataset.page;
if (page === "member") controller.initMember();
else if (page === "directory") controller.initDirectory();
else controller.initIndex();