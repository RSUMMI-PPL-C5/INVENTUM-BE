import { Request, Response } from "express";
import DivisionService from "../services/division.service";

class DivisionController {
  private readonly divisionService: DivisionService;

  constructor() {
    this.divisionService = new DivisionService();
  }

  /**
   * Get all divisions in hierarchical form for tree display
   */
  public getDivisionsTree = async (req: Request, res: Response): Promise<void> => {
    try {
      const divisions = await this.divisionService.getDivisionsHierarchy();
      res.status(200).json(divisions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  /**
   * Get all divisions as a flat list
   */
  public getAllDivisions = async (req: Request, res: Response): Promise<void> => {
    try {
      const divisions = await this.divisionService.getAllDivisions();
      res.status(200).json(divisions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  /**
   * Get divisions with user count information
   */
  public getDivisionsWithUserCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const divisions = await this.divisionService.getDivisionsWithUserCount();
      res.status(200).json(divisions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
}

export default DivisionController;