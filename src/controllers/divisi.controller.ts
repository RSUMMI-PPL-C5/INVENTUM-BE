import { Request, Response } from 'express';
import { IDivisiService } from '../services/interface/divisi.service.interface';
import DivisiService from '../services/divisi.service';


class DivisiController {
  private readonly divisiService: IDivisiService;
  
  constructor() {
    this.divisiService = new DivisiService();
  } 

  public addDivisi = async (req: Request, res: Response): Promise<void> => {
    try {
      const parentId = req.body.parentId;
      if (parentId && typeof parentId !== 'number') {
        res.status(400).json({ message: 'Parent ID must be a number' });
        return;
      }

      const divisiData = {
        divisi: req.body.divisi,
        parentId: parentId,
      };

      const newDivisi = await this.divisiService.addDivisi(divisiData);
      res.status(201).json(newDivisi);
    } catch (error) {
      console.error('Error in addDivisi controller:', error);
      if (error instanceof Error && error.message === 'Parent divisi not found') {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: (error as Error).message });
      }
    }
  }
}

export default DivisiController;