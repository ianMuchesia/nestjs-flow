import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryRepository } from './category.repository';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryRepository)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  public async getCategories() {
    try {
      return await this.categoryRepository.getCategories();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async getCategoryById(id: string) {
    try {
      const category = await this.categoryRepository.getCategoryById(id);
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      return category;
    } catch (error) {
      if (error.status == HttpStatus.NOT_FOUND) {
        throw error;
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  public async getCategoryByName(name: string) {
    try {
      const category = await this.categoryRepository.getCategoryByName(name);
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      return category;
    } catch (error) {
      if (error.status == HttpStatus.NOT_FOUND) {
        throw error;
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
  public async getCategoryBySlug(slug: string) {
    try {
      const category = await this.categoryRepository.getCategoryBySlug(slug);
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      return category;
    } catch (error) {
      if (error.status == HttpStatus.NOT_FOUND) {
        throw error;
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  public async getAllCategoriesByNameCaseSensitive(name: string) {
    try {
      return await this.categoryRepository.getAllCategoriesByNameCaseSensitive(
        name,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async createCategory(categoryDto: CreateCategoryDto) {
    const { name } = categoryDto;
    try {
      const check: any[] = await this.getAllCategoriesByNameCaseSensitive(name);
      if (check.length > 0) {
        throw new ConflictException(
          `Category with name ${name} already exists!`,
        );
      }
      const category = await this.categoryRepository.createCategory(
        categoryDto,
      );
      return category;
    } catch (error) {
      if (error.status == HttpStatus.CONFLICT) {
        throw error;
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  public async updateCategory(slug: string, categoryDto: UpdateCategoryDto) {
    try {
      const category = await this.getCategoryBySlug(slug);
      await this.categoryRepository.updateCategory(category, categoryDto);
      return category;
    } catch (error) {
      if (error.status == HttpStatus.NOT_FOUND) {
        throw error;
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  public async deleteCategory(slug: string) {
    try {
      const category = await this.getCategoryBySlug(slug);
      return await this.categoryRepository.deleteCategory(category.id);
    } catch (error) {
      if (error.status == HttpStatus.NOT_FOUND) {
        throw error;
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  public async getAllPostOfCategories(slug: string) {
    try {
      const category = await this.categoryRepository.findOne({
        where: { slug: slug },
        relations: ['posts'],
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      return category.posts;
    } catch (error) {
      if (error.status == HttpStatus.NOT_FOUND) {
        throw error;
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
