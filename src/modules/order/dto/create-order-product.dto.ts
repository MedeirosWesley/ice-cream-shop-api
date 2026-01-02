import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, Validate, validateSync, IsInt, IsOptional, IsString, IsBoolean } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateAcaiDto } from 'src/modules/acai/dto/create-acai.dto';
import { CreateMilkShakeDto } from 'src/modules/milk-shake/dto/create-milk-shake.dto';
import { CreateDrinkDto } from 'src/modules/drink/dto/create-drink.dto';
import { CreateIceCreamOrderDto } from 'src/modules/ice-cream-order/dto/create-ice-cream-order.dto';
import { CreateIceCreamPotOrderDto } from 'src/modules/ice-cream-pot-order/dto/create-ice-cream-pot-order.dto';
import { CreatePopsicleDto } from 'src/modules/popsicle/dto/create-popsicle.dto';
import { CreateProductDto } from './product.dto';
import { CreateOnSaleAcaiOrderDto } from 'src/modules/on-sale-acai-order/dto/create-on-sale-acai-order.dto';
import { CreateOtherProductOrderDto } from 'src/modules/other-product-order/dto/create-other-product-order.dto';
import { CreatePopsiclesOrderDto } from 'src/modules/popsicle-order/dto/create-popsicle-order.dto';

// Validação personalizada para determinar o tipo de produto e fazer a validação correspondente
@ValidatorConstraint({ name: 'isProductValid', async: false })
class IsProductValidConstraint implements ValidatorConstraintInterface {
  validate(product: any, args: ValidationArguments) {
    switch (product.type) {
      case 'acai':
        return this.validateProduct(product.details, CreateAcaiDto);
      case 'milk_shake':
        return this.validateProduct(product.details, CreateMilkShakeDto);
      case 'drink':
        return this.validateProduct(product.details, CreateDrinkDto);
      case 'ice_cream':
        return this.validateProduct(product.details, CreateIceCreamOrderDto);
      case 'ice_cream_pot':
        return this.validateProduct(product.details, CreateIceCreamPotOrderDto);
      case 'popsicle':
        return this.validateProduct(product.details, CreatePopsiclesOrderDto);
      case 'on_sale_acai':
        return this.validateProduct(product.details, CreateOnSaleAcaiOrderDto);
      case 'other_product':
        return this.validateProduct(product.details, CreateOtherProductOrderDto);
      default:
        return false;
    }
  }

  private validateProduct(details: any, ProductClass: any) {
    const productInstance = plainToInstance(ProductClass, details);
    const errors = validateSync(productInstance);
    return errors.length === 0;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Invalid product details';
  }
}

// Classe para definir o produto no pedido
export class CreateOrderProduct {
  @IsInt()
  quantity: number;

  @IsOptional()
  @IsString()
  observation?: string;

  @IsBoolean()
  status: boolean;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  // @Validate(IsProductValidConstraint)
  product: CreateProductDto;
}