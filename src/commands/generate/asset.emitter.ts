import { Asset } from './asset.generator';
import * as path from 'path';
import * as fs from 'fs';
import { Logger, LoggerService } from '../../logger/logger.service';
import { ColorService } from '../../logger/color.service';

export class AssetEmitter {
  private ROOT_PATH = 'src/modules';

  constructor(
    private logger: Logger = LoggerService.getLogger()
  ) {}

  public async emit(name: string, assets: Asset[]) {
    this.logger.debug(ColorService.blue('[DEBUG]'), 'emit assets', name, JSON.stringify(assets, null, 2));
    await assets.forEach(async (asset: Asset) => {
      const folder: string = path.join(process.cwd(), this.ROOT_PATH, name);
      await new Promise((resolve, reject) => {
        fs.mkdir(folder, (error: NodeJS.ErrnoException) => {
          if (error !== undefined && error !== null) {
            return reject(error);
          } else {
            const filename: string = path.join(folder, asset.path);
            fs.writeFile(filename, asset.template.content, (error: NodeJS.ErrnoException) => {
              if (error !== undefined && error !== null) {
                return reject(error);
              } else {
                this.logger.info(ColorService.green('create'), path.join(folder, asset.path));
                return resolve();
              }
            });
          }
        });
      });
    });
  }
}