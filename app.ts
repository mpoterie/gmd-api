/* eslint-disable require-jsdoc */
import * as bodyParser from "body-parser";
import * as express from "express";
import { Logger } from "./logger/logger";
import Routes from "./routes/routes";

class App {
  public express: express.Application;
  public logger: Logger;

  // array to hold users
  public workouts: any[];

  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
    this.workouts = [];
    this.logger = new Logger();
  }

  // Configure Express middleware.
  private middleware(): void {
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use(express.static(process.cwd() + "/my-app/build/"));
  }

  private routes(): void {
    this.express.get("/", (_req, res) => {
      res.sendFile(process.cwd() + "/my-app/build/index.html");
    });

    // class route
    this.express.use("/api", Routes);

    // handle undefined routes
    this.express.use("*", (_req, res) => {
      res.send("Make sure url is correct!!!");
    });
  }
}

export default new App().express;
