import { Request, Response } from "express";
import SparepartService from "../services/sparepart.service";
import { FilterSparepartDTO } from "../dto/sparepart.dto";
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

      // Make sure query is defined before destructuring
      const query = req.query || {};

      // Check if there are any filter parameters
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
        priceMin ||
        priceMax ||
        toolLocation
      ) {
        // Create filter object
        const filters: FilterSparepartDTO = {
          partsName,
          purchaseDateStart,
          purchaseDateEnd,
          priceMin,
          priceMax,
          toolLocation,
        };

        const filteredSpareparts =
          await this.sparepartService.getFilteredSpareparts(filters);
        res.status(200).json(filteredSpareparts);
        return;
      }

      // If no filters, get all spareparts
      const spareparts = await this.sparepartService.getSpareparts();
      res.status(200).json(spareparts);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  public getSparepartById = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const sparepart = await this.sparepartService.getSparepartById(
        req.params.id,
      );
      if (!sparepart) {
        res.status(404).json({ message: "Sparepart not found" });
        return;
      }
      res.status(200).json(sparepart);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };
}

export default SparepartController;
