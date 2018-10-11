import Backbone from "backbone";
import Requirements from "../requirements/requirements.view";
import Application from "../application/application.view";

export default Backbone.Router.extend({
  // "someMethod" must exist at controller.someMethod
  routes: {
    "(?*)": "home",
    requirements: "home",
    application: "application"
  },
  initialize(options) {
    this.options = options;
  },
  application() {
    this.options.app.router.show(new Application());
  },
  home() {
    this.options.app.router.show(new Requirements());
  }
});
