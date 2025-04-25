import fs from "fs";

export class FileHelperService {

    static cleanFiles(uploadPath: string) {
        if(!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        } else {
            const files = fs.readdirSync(uploadPath);
            files.forEach(file => {
                fs.unlinkSync(uploadPath + `/${ file }`);
            });
        }
    }
}