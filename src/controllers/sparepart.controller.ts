import { Request, Response } from "express";
import SparepartService from "../services/sparepart.service";
import { SparepartsDTO } from "../dto/sparepart.dto";
import { validationResult } from "express-validator";

class SparepartController {
  private readonly sparepartService: SparepartService;

  constructor() {
    this.sparepartService = new SparepartService();
  }

  public addSparepart = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const sparepartData: SparepartsDTO = req.body;
      const newSparepart =
        await this.sparepartService.addSparepart(sparepartData);
      res.status(201).json(newSparepart);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  public deleteSparepart = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const sparepart = await this.sparepartService.deleteSparepart(
        req.params.id,
      );
      if (!sparepart) {
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
