import { getTextExtractor } from "office-text-extractor";
import * as fs from "fs"

// the function that input the mine-type and check that it is an pdf or docx file and return true or false
const pdfMineType = ["application/pdf"];
const docxMineType = ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"];
const xlsxMineType = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"];
const pptxMineType = ["application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/vnd.ms-powerpoint"];
const mimeTypes = [...pdfMineType, ...docxMineType, ...xlsxMineType, ...pptxMineType];
export const isPdfOrDocx = (mimeType: string): boolean => {
  return mimeTypes.includes(mimeType) || mimeType.startsWith("text/");
};

export const getContentOfFile = async (file: File): Promise<string> => {
  const extractor = getTextExtractor()

  if (docxMineType.includes(file.type)) {
    return await extractor.extractText({
      input: Buffer.from(await file.arrayBuffer()),
      type: "buffer",
    });
  } else if (xlsxMineType.includes(file.type)) {
    return await extractor.extractText({
      input: Buffer.from(await file.arrayBuffer()),
      type: "buffer",
    });
  } else if (pptxMineType.includes(file.type)) {
    return await extractor.extractText({
      input: Buffer.from(await file.arrayBuffer()),
      type: "buffer",
    });
  } else if (pdfMineType.includes(file.type)) {
    return await extractor.extractText({
      input: Buffer.from(await file.arrayBuffer()),
      type: "buffer",
    });
  } else if (file.type.startsWith("text/")) {
    return await file.text()
  }
  throw new Error("Invalid file type");
};
