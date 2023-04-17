import { Product } from './../products/product.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './order.entity';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly productService: ProductsService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const { products } = createOrderDto;
    let price = 0;
    products.forEach((p: any) => {
      price += p.price * p.quantity;
      this.productService.subtractQuantity(+p.id, p.quantity);
    });

    return this.orderRepository.save({ ...createOrderDto, price });
  }

  findAll() {
    return this.orderRepository.find();
  }

  async findOne(id: number) {
    const order: any = await this.orderRepository.findOneBy({ id });
    const productIds = order.products.map((p: any) => p.id);
    let products: any = await this.productService.findByIds(productIds);

    for (let i = 0; i < order.products.length; i++) {
      products[i].quantity = order.products[i].quantity;
      products[i].size = order.products[i].size;
    }

    products = products.map((p: any) => {
      const { id, name, brand, price, image, quantity, size } = p;
      return { id, name, brand, price, image, quantity, size };
    });

    order.products = products;

    return order;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return this.orderRepository.save({
      id,
      ...updateOrderDto,
    });
  }

  remove(id: number) {
    return this.orderRepository.delete({ id });
  }
}
