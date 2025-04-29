import { RequestType } from "@prisma/client";

export interface RequestFilterOptions {
  requestType?: RequestType;
  createdOnStart?: Date;
  createdOnEnd?: Date;
  modifiedOnStart?: Date;
  modifiedOnEnd?: Date;
}
