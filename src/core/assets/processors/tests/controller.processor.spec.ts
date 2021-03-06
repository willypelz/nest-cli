import {Processor} from '../../../../common/asset/interfaces/processor.interface';
import {AssetGenerator} from '../../generators/asset.generator';
import * as sinon from 'sinon';
import * as path from 'path';
import {Asset} from '../../../../common/asset/interfaces/asset.interface';
import {ControllerProcessor} from '../controller.processor';
import {ModuleUpdaterImpl} from '../../module-updaters/module.updater';
import {ModuleFinderImpl} from '../../module-finders/module.finder';
import {AssetEnum} from '../../../../common/asset/enums/asset.enum';

describe('ControllerProcessor', () => {
  const name: string = 'name';
  const extension: string= 'ts';
  let moduleName: string;

  let sandbox: sinon.SinonSandbox;
  beforeEach(() => sandbox = sinon.sandbox.create());
  afterEach(() => sandbox.restore());

  let findStub: sinon.SinonStub;
  let generateStub: sinon.SinonStub;
  let updateStub: sinon.SinonStub;
  beforeEach(() => {
    findStub = sandbox.stub(ModuleFinderImpl.prototype, 'find');
    generateStub = sandbox.stub(AssetGenerator.prototype, 'generate').callsFake(() => Promise.resolve());
    updateStub = sandbox.stub(ModuleUpdaterImpl.prototype, 'update').callsFake(() => Promise.resolve());
  });

  describe('#process()', () => {
    context('generate controller in app module', () => {
      let processor: Processor;
      beforeEach(() => {
        moduleName = 'app';
        findStub.callsFake(() => Promise.resolve('src/app/app.module.ts'));
        processor = new ControllerProcessor(name, moduleName, extension);
      });

      const assets: Asset[] = [
        {
          type: AssetEnum.CONTROLLER,
          filename: path.join(
            process.cwd(),
            'src/app',
            'controllers',
            'name',
            'name.controller.ts'
          ),
          className: 'NameController',
          template: {
            filename: path.resolve(__dirname, '../../../../assets/ts/controller/controller.ts.template'),
            replacer: {
              __CLASS_NAME__: 'NameController',
              __DIR_NAME__: `'./controllers/name/name.controller'`
            }
          }
        },
        {
          type: AssetEnum.CONTROLLER,
          filename: path.join(
            process.cwd(),
            'src/app',
            'controllers',
            'name',
            'name.controller.spec.ts'
          ),
          className: 'NameController',
          template: {
            filename: path.resolve(__dirname, '../../../../assets/ts/controller/controller.spec.ts.template'),
            replacer: {
              __CLASS_NAME__: 'NameController',
              __IMPORT__: 'name.controller'
            }
          }
        }
      ];

      it('should find the moduleName filename', () => {
        return processor.process()
          .then(() => {
            sinon.assert.calledOnce(findStub);
            sinon.assert.calledWith(findStub, moduleName);
          });
      });

      it('should generate controller assets', () => {
        return processor.process()
          .then(() => {
            sinon.assert.calledWith(generateStub, assets[0]);
            sinon.assert.calledWith(generateStub, assets[1]);
          });
      });

      it('should update the module', () => {
        return processor.process()
          .then(() => {
            sinon.assert.calledOnce(updateStub);
            sinon.assert.calledWith(updateStub, path.join(process.cwd(), 'src/app/app.module.ts'), assets[0]);
          });
      });
    });
  });
});


