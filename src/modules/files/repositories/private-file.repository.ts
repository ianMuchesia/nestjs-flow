import { EntityRepository, Repository } from 'typeorm';
import { CreatePrivateFileDto } from '../dto/create-private-file.dto';
import { PrivateFile } from '../private-file.entity';

@EntityRepository(PrivateFile)
export class PrivateFileRepository extends Repository<PrivateFile> {
  public async createPrivateFile(privateFileDto: CreatePrivateFileDto) {
    const newFile = this.create(privateFileDto);
    await this.save(newFile);
    return newFile;
  }
}
