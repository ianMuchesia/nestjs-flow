import { HttpException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PublicFileService } from '../services/public-file.service';
import { PublicFileRepository } from '../repositories/public-file.repository';
import { S3PublicFileService } from '../services/s3-public-file.service';

const oneFile = {
  key: 'any key',
  url: 'any url',
};
const s3File = {
  key: 'any key',
  url: 'any url',
};

describe('PublicFileService', () => {
  let publicFileService: PublicFileService;
  let s3PublicFileService;
  let publicFileRepo;

  const mockPublicFileRepo = () => ({
    createPublicFile: jest.fn(),
    getFileById: jest.fn(),
    deleteFile: jest.fn(),
  });

  const mockS3Service = () => ({
    uploadResult: jest.fn(),
    deleteFile: jest.fn(),
  });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        PublicFileService,
        {
          provide: PublicFileRepository,
          useFactory: mockPublicFileRepo,
        },

        {
          provide: S3PublicFileService,
          useFactory: mockS3Service,
        },
      ],
    }).compile();
    publicFileService = module.get<PublicFileService>(PublicFileService);
    s3PublicFileService = module.get<S3PublicFileService>(S3PublicFileService);
    publicFileRepo = module.get<PublicFileRepository>(PublicFileRepository);
  });

  it('Should be defined', () => {
    expect(publicFileService).toBeDefined();
  });

  describe('uploadPublicFile', () => {
    it('Throw an error when create file at repository failed', async () => {
      publicFileRepo.createPublicFile.mockReturnValue(null);
      s3PublicFileService.uploadResult.mockResolvedValue(s3File);
      try {
        const dataBuffer = {} as Buffer;
        const filename = 'any filename';

        await publicFileService.uploadPublicFile(dataBuffer, filename);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
      }
    });
    it('Should upload public file successfully', async () => {
      publicFileRepo.createPublicFile.mockReturnValue(oneFile);
      s3PublicFileService.uploadResult.mockResolvedValue(s3File);
      const dataBuffet = {} as Buffer;
      const filename = 'any filename';
      const result = await publicFileService.uploadPublicFile(
        dataBuffet,
        filename,
      );
      expect(s3PublicFileService.uploadResult).toHaveBeenCalledWith(
        dataBuffet,
        filename,
      );
      expect(result).toEqual(oneFile);
    });
  });

  describe('deleteFile', () => {
    it('Should delete file successfully', async () => {
      publicFileRepo.getFileById.mockReturnValue(oneFile);
      publicFileRepo.deleteFile.mockReturnValue({ deleted: true });
      s3PublicFileService.deleteFile.mockReturnValue({ deleted: true });
      const result = await publicFileService.deletePublicFile('some file id');
      expect(s3PublicFileService.deleteFile).toHaveBeenCalledWith({
        key: oneFile.key,
      });
      expect(result).toEqual({
        deleted: true,
      });
    });
  });
});
