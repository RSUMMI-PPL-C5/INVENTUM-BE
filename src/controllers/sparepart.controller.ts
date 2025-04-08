import { Request, Response } from "express";
import SparepartService from "../services/sparepart.service";
import { SparepartsDTO, FilterSparepartDTO } from "../dto/sparepart.dto";
import { validationResult } from "express-validator";

class SparepartController {
  private readonly sparepartService: SparepartService;

  constructor() {
    this.sparepartService = new SparepartService();
  }

  public getSpareparts = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const query = req.query || {};
      const partsName = query.partsName as string | undefined;
      const purchaseDateStart = query.purchaseDateStart as string | undefined;
      const purchaseDateEnd = query.purchaseDateEnd as string | undefined;
      const priceMin = query.priceMin ? Number(query.priceMin) : undefined;
      const priceMax = query.priceMax ? Number(query.priceMax) : undefined;
      const toolLocation = query.toolLocation as string | undefined;

      if (
        partsName ||
        purchaseDateStart ||
        purchaseDateEnd ||
        priceMin !== undefined ||
        priceMax !== undefined ||
        toolLocation
      ) {
        const filters: FilterSparepartDTO = {
          partsName,
          purchaseDateStart,
          purchaseDateEnd,
          priceMin,
          priceMax,
          toolLocation,
        };

        const filteredSpareparts = await this.sparepartService.getFilteredSpareparts(filters);
        res.status(200).json(filteredSpareparts);
        return;
      }

      const spareparts = await this.sparepartService.getSpareparts();
      res.status(200).json(spareparts);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  public getSparepartById = async (req: Request, res: Response): Promise<void> => {
    try {
      const sparepart = await this.sparepartService.getSparepartById(req.params.id);
      if (!sparepart) {
        res.status(404).json({ message: "Sparepart not found" });
        return;
      }
      res.status(200).json(sparepart);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  public addSparepart = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const sparepartData: SparepartsDTO = req.body;
      const newSparepart = await this.sparepartService.addSparepart(sparepartData);
      res.status(201).json(newSparepart);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  public updateSparepart = async (req: Request, res: Response): Promise<void> => {
    try {
      const sparepart = await this.sparepartService.updateSparepart(req.params.id, req.body);

      if (!sparepart) {
        res.status(404).json({ message: "Sparepart not found or invalid data" });
        return;
      }
      res.status(200).json(sparepart);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  public deleteSparepart = async (req: Request, res: Response): Promise<void> => {
    try {
      const deleted = await this.sparepartService.deleteSparepart(req.params.id);
      if (!deleted) {
        res.status(404).json({ message: "Sparepart not found" });
        return;
      }
      res.status(200).json({ message: "Sparepart deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };
}

export default SparepartController;
