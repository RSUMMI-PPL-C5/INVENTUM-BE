import { Request, Response } from "express";
import { IDivisionService } from "../services/interface/division.service.interface";
import DivisionService from "../services/division.service";
import AppError from "../utils/appError";

class DivisionController {
  private readonly divisionService: IDivisionService;

  constructor() {
    this.divisionService = new DivisionService();
  }

  public addDivision = async (req: Request, res: Response): Promise<void> => {
    try {
      const parentId = req.body.parentId;
  
      if (parentId !== undefined && parentId !== null && typeof parentId !== "number") {
        res.status(400).json({ message: "Parent ID must be a number or null" });
        return;
      }
  
      const divisionData = {
        divisi: req.body.divisi,
        parentId: parentId ?? null, // Jika undefined, set ke null
      };
  
      const newDivision = await this.divisionService.addDivision(divisionData);
      res.status(201).json(newDivision);
    } catch (error) {
      console.error("Error in addDivision controller:", error);
      if (error instanceof Error && error.message === "Parent divisi not found") {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: (error as Error).message });
      }
    }
  };

  public getDivisionsTree = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const divisions = await this.divisionService.getDivisionsHierarchy();
      res.status(200).json(divisions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public getAllDivisions = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const divisions = await this.divisionService.getAllDivisions();
      res.status(200).json(divisions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public getDivisionsWithUserCount = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const divisions = await this.divisionService.getDivisionsWithUserCount();
      res.status(200).json(divisions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public getDivisionById = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid division ID" });
        return;
      }

      const division = await this.divisionService.getDivisionById(id);

      if (!division) {
        res.status(404).json({ message: "Division not found" });
        return;
      }

      res.status(200).json(division);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public updateDivision = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid division ID" });
        return;
      }

      const { divisi, parentId } = req.body;

      // Validate input
      if (divisi === undefined && parentId === undefined) {
        res.status(400).json({ message: "No update data provided" });
        return;
      }

      // Convert parentId to number if it's a string, or null if it's null
      let parsedParentId: number | null | undefined = undefined;
      if (parentId !== undefined) {
        parsedParentId = parentId === null ? null : parseInt(parentId);

        // Validate parentId is a number if provided and not null
        if (
          parentId !== null &&
          parsedParentId !== null &&
          isNaN(parsedParentId)
        ) {
          res.status(400).json({ message: "Invalid parent ID" });
          return;
        }
      }

      const updateData = {
        divisi,
        parentId: parsedParentId,
      };
      const updatedDivision = await this.divisionService.updateDivision(
        id,
        updateData,
      );

      res.status(200).json({
        message: "Division updated successfully",
        division: updatedDivision,
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: "An unexpected error occurred" });
      }
    }
  };

  public deleteDivision = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const divisionId = parseInt(req.params.id, 10);

      if (isNaN(divisionId)) {
        res.status(400).json({ message: "Invalid division ID" });
        return;
      }

      const isDeleted = await this.divisionService.deleteDivision(divisionId);

      if (isDeleted) {
        res.status(200).json({ message: "Division deleted successfully" });
      } else {
        res.status(404).json({ message: "Division not found" });
      }
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: "An unexpected error occurred." });
      }
    }
  };
}

export default DivisionController;
