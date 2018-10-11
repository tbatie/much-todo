import "./index.less";
import Marionette from "backbone.marionette";
import Backbone from "backbone";
import Router from "./components/router";

// Although applications will not do anything
// with a `container` option out-of-the-box, you
// could build an Application Class that does use
// such an option.
const app = new Marionette.Application();
app.addRegions({ router: "#router" });

app.on("start", function(options) {
  if (Backbone.history) {
    Backbone.history.start();
  }
});

const router = new Router({ app });

app.start();
router.navigate(location.hash, { trigger: true });
