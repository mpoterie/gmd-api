/* eslint-disable require-jsdoc */
import * as bodyParser from "body-parser";
import * as express from "express";
import { Logger } from "../logger/logger";
import * as faker from "faker";

export const categories = ["c1", "c2", "c3", "c4", "c5", "c6", "c7"] as const;

export type Category = typeof categories;

export interface Workout {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  category: Category;
  img: string;
}

const generateWorkoutsData = () => {
  const workouts: Workout[] = [];
  const workoutsName = [
    "Sweat",
    "Power Hour",
    "Curls n’ Crunches",
    "Fab & Fit & Fun",
    "Abs Fab / Fab Abs",
    "Walk this Weigh",
    "Wishful Shrinking",
    "Move it, Shake it, Lift it",
    "F-abs Fridays",
    "2020 Strong",
    "Sanity Session",
    "Werk It!",
    "Transform",
    "Sweat Fest",
    "Lunch Crunch / Lunch Lunge",
    "Fierce",
    "Power Up",
    "Ex-Press",
  ];

  for (let index = 0; index < 1000; index++) {
    // eslint-disable-next-line max-len
    const category = (categories[
      Math.floor(Math.random() * categories.length)
    ] as unknown) as Category;
    const workout: Workout = {
      id: faker.datatype.uuid(),
      name: workoutsName[Math.floor(Math.random() * workoutsName.length)],
      startDate: faker.date.soon(365),
      category,
      description: faker.lorem.paragraph(4),
      img: faker.image.sports(),
    };
    workouts.push(workout);
  }
  return workouts;
};

class Class {
  public express: express.Application;
  public logger: Logger;

  // array to hold users
  public workouts: any[];

  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
    this.workouts = generateWorkoutsData();
    this.logger = new Logger();
  }

  // Configure Express middleware.
  private middleware(): void {
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
  }

  private routes(): void {
    // request to get all the users
    this.express.get("/workouts", (req, res) => {
      this.logger.info("url:" + req.url);
      const offset = Number(req.query.offset) ?? 0;
      const limit = Number(req.query.limit) ?? 20;
      const pageCount = Math.ceil(this.workouts.length / limit);
      res.json({
        pageCount,
        data: this.workouts.slice(offset, offset + limit),
      });
    });

    // request to get all the users by userName
    this.express.get("/workouts/:workoutId", (req, res) => {
      this.logger.info("url:::::" + req.url);
      const workout = this.workouts.filter(function (workout) {
        if (req.params.workoutId === workout.id) {
          return workout;
        }
      });

      res.json(workout);
    });
  }
}

export default new Class().express;
