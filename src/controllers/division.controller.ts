import { Request, Response } from 'express';
import { IDivisionService } from '../services/interface/division.service.interface';
import DivisionService from '../services/division.service';


class DivisionController {
  private readonly divisionService: IDivisionService;
  
  constructor() {
    this.divisionService = new DivisionService();
  } 

  public addDivision = async (req: Request, res: Response): Promise<void> => {
    try {
      const parentId = req.body.parentId;
      if (parentId && typeof parentId !== 'number') {
        res.status(400).json({ message: 'Parent ID must be a number' });
        return;
      }

      const divisionData = {
        divisi: req.body.divisi,
        parentId: parentId,
      };

      const newDivision = await this.divisionService.addDivision(divisionData);
      res.status(201).json(newDivision);
    } catch (error) {
      console.error('Error in addDivision controller:', error);
      if (error instanceof Error && error.message === 'Parent divisi not found') {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: (error as Error).message });
      }
    }
  }
}

export default DivisionController;