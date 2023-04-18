import express, { Express } from 'express';

export function configureOther(app: Express) {
  app.use(express.urlencoded({extended: false}));
  app.use(express.json());
}