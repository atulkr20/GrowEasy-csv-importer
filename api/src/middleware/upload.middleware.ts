import multer from "multer";

// Storing the uploaded file in memory as a Buffer instead of writing to disk

const storage = multer.memoryStorage();


// only accept csv files and reject everything else

    function fileFilter(
        req: Express.Request,
        file: Express.Multer.File,
        cb: multer.FileFilterCallback
    ) {

        const isCsv = 
        file.mimetype === "text/csv" ||
        file.mimetype === "application/vnd.ms-excel" ||
        file.originalname.toLowerCase().endsWith(".csv");

        if(isCsv) {
            cb(null, true);
        } else {
            cb(new Error("Only CSV files are allowed"));
        }
    }

    export const uploadMiddleware = multer({
        storage,
        fileFilter,
        limits: {
            fileSize: 10 * 1024 * 1024,   // 10 MB ca for csv import
        },
    });