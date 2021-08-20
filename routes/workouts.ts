/* eslint-disable require-jsdoc */
import * as bodyParser from "body-parser";
import * as express from "express";
import { Logger } from "../logger/logger";
import * as faker from "faker";

export const categories = [
  "c1",
  "c2",
  "c3",
  "c4",
  "c5",
  "c6",
  "c7",
] as string[];

// This function handles filters our fixture using our two filters: monthSelected and categoriesSelected
const getFilteredWorkouts = (
  workouts: Workout[],
  filters: {
    monthSelected: string;
    categoriesSelected: string[];
  }
) => {
  return workouts.filter((workout) => {
    let workoutPassDateFilter = true;
    let workoutPassCategoryFilter = true;
    if (filters.monthSelected) {
      const workoutYear = workout.startDate.getFullYear();
      const workoutMonth = workout.startDate.getMonth();
      const yearFilter = new Date(filters.monthSelected).getFullYear();
      const monthFilter = new Date(filters.monthSelected).getMonth();
      if (workoutYear === yearFilter && monthFilter === workoutMonth) {
        workoutPassDateFilter = true;
      } else {
        workoutPassDateFilter = false;
      }
    }
    if (filters.categoriesSelected.length) {
      workoutPassCategoryFilter = filters.categoriesSelected.reduce(
        (acc, category) => {
          if (workout.category === category) {
            return true;
          }
          return acc;
        },
        false
      );
    }
    return workoutPassDateFilter && workoutPassCategoryFilter;
  });
};

export interface Workout {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  category: "c1" | "c2" | "c3" | "c4" | "c5" | "c6" | "c7";
  img: string;
}

function isValidDate(d: any) {
  return !isNaN(Date.parse(d));
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
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const in12Months = new Date(year + 1, month);

  for (let index = 0; index < 1000; index++) {
    // eslint-disable-next-line max-len
    const category = categories[
      Math.floor(Math.random() * categories.length)
    ] as "c1" | "c2" | "c3" | "c4" | "c5" | "c6" | "c7";
    const workout: Workout = {
      id: faker.datatype.uuid(),
      name: workoutsName[Math.floor(Math.random() * workoutsName.length)],
      startDate: faker.date.between(today, in12Months),
      category,
      description: faker.lorem.paragraph(20),
      img: faker.image.abstract(1000, 400),
    };
    workouts.push(workout);
  }
  return workouts;
};

class Class {
  public express: express.Application;
  public logger: Logger;

  // array to hold workouts
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
    // Workouts list api endpoint
    this.express.get("/workouts", (req, res) => {
      this.logger.info("url:" + req.url);
      const offset = Number(req.query.offset) ?? 0;
      const limit = Number(req.query.limit) ?? 20;

      const monthSelected: string | undefined = isValidDate(
        req.query.monthSelected
      )
        ? (req.query.monthSelected as string)
        : undefined;

      let categoriesSelected: string[] = [];
      if (
        req.query.categoriesSelected &&
        req.query.categoriesSelected.length > 0
      ) {
        categoriesSelected = (req.query.categoriesSelected as string)
          .split(",")
          .filter((category) => categories.includes(category));
      }

      const filteredWorkouts = getFilteredWorkouts(this.workouts, {
        monthSelected,
        categoriesSelected,
      });

      const pageCount = Math.ceil(filteredWorkouts.length / limit);
      res.json({
        pageCount,
        data: filteredWorkouts.slice(offset, offset + limit),
      });
    });

    // Single workout api endpoint
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
