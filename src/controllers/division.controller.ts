import { Request, Response, NextFunction } from "express";
import { IDivisionService } from "../services/interface/division.service.interface";
import DivisionService from "../services/division.service";

class DivisionController {
  private readonly divisionService: IDivisionService;

  constructor() {
    this.divisionService = new DivisionService();
  }

  public addDivision = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parentId = req.body.parentId;

      if (
        parentId !== undefined &&
        parentId !== null &&
        typeof parentId !== "number"
      ) {
        res.status(400).json({
          status: "error",
          message: "Parent ID must be a number or null",
        });
        return;
      }

      const divisionData = {
        divisi: req.body.divisi,
        parentId: parentId ?? null,
      };

      const newDivision = await this.divisionService.addDivision(divisionData);
      res.status(201).json(newDivision);
    } catch (error) {
      next(error);
    }
  };

  public getDivisionsTree = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const divisions = await this.divisionService.getDivisionsHierarchy();
      res.status(200).json(divisions);
    } catch (error) {
      next(error);
    }
  };

  public getAllDivisions = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const divisions = await this.divisionService.getAllDivisions();
      res.status(200).json(divisions);
    } catch (error) {
      next(error);
    }
  };

  public getDivisionsWithUserCount = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const divisions = await this.divisionService.getDivisionsWithUserCount();
      res.status(200).json(divisions);
    } catch (error) {
      next(error);
    }
  };

  public getDivisionById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          status: "error",
          message: "Invalid division ID",
        });
        return;
      }

      const division = await this.divisionService.getDivisionById(id);

      if (!division) {
        res.status(404).json({
          status: "error",
          message: "Division not found",
        });
        return;
      }

      res.status(200).json(division);
    } catch (error) {
      next(error);
    }
  };

  public updateDivision = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          status: "error",
          message: "Invalid division ID",
        });
        return;
      }

      const { divisi, parentId } = req.body;

      // Validate input
      if (divisi === undefined && parentId === undefined) {
        res.status(400).json({
          status: "error",
          message: "No update data provided",
        });
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
          res.status(400).json({
            status: "error",
            message: "Invalid parent ID",
          });
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
        status: "success",
        message: "Division updated successfully",
        division: updatedDivision,
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteDivision = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const divisionId = parseInt(req.params.id, 10);

      if (isNaN(divisionId)) {
        res.status(400).json({
          status: "error",
          message: "Invalid division ID",
        });
        return;
      }

      const isDeleted = await this.divisionService.deleteDivision(divisionId);

      if (isDeleted) {
        res.status(200).json({
          status: "success",
          message: "Division deleted successfully",
        });
      } else {
        res.status(404).json({
          status: "error",
          message: "Division not found",
        });
      }
    } catch (error) {
      next(error);
    }
  };
}

export default DivisionController;
