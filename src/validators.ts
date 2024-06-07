import { HttpException, HttpStatus } from "@nestjs/common";

export const mediaFileFilter = (req: Request, file: Express.Multer.File | any, callback: (error: Error | null, acceptFile: boolean) => void) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|mp4|mov)$/)) {
        return callback(new HttpException('Only image and video files are allowed!', HttpStatus.UNSUPPORTED_MEDIA_TYPE), false);
    }
    callback(null, true);
};

export const audioFileFilter = (req: Request, file: Express.Multer.File | any, callback: (error: Error | null, acceptFile: boolean) => void) => {
    if (!file.mimetype.match(/\/(mp3|mpeg|wav|ogg)$/)) {
        return callback(new HttpException('Only audio files are allowed!', HttpStatus.UNSUPPORTED_MEDIA_TYPE), false);
    }
    callback(null, true);
};