import { AxiosResponse } from 'axios';
import * as fs from 'fs';
import * as FormData from 'form-data';
import * as path from 'path';
import BaseController from './base.controller';
import { files } from '../fixtures/data';

export default class PhotoController extends BaseController {
  readonly PHOTO_ENDPOINT: string = '/photo';

  readonly UPLOAD_ENDPOINT: string = '/photo/upload';

  readonly BASE_DIR: string = `${__dirname}/../fixtures/files`;

  public async uploadPhoto(filename: string = files.defaultAvatar): Promise<AxiosResponse> {
    const formData = new FormData();
    const readStream = fs.createReadStream(path.join(this.BASE_DIR, filename));
    formData.append('photo', readStream);
    readStream.on('error', (err) => {
      Promise.reject(err);
    });
    return this.formDataRequest('POST', this.UPLOAD_ENDPOINT, formData);
  }

  public async uploadEmpty(): Promise<AxiosResponse> {
    const formData = new FormData();
    formData.append('photo', '');
    return this.formDataRequest('POST', this.UPLOAD_ENDPOINT, formData);
  }
}
