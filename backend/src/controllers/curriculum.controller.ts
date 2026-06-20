import { Request, Response } from 'express';
import { CLASS_11 } from '../curriculum/class11';

export function getClass11Curriculum(_req: Request, res: Response): void {
  res.json(CLASS_11);
}
