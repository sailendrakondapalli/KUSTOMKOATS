/**
 * Unit of Work — single import point for all repositories.
 * Services receive this object and call e.g. uow.products.findById(id)
 * rather than importing repositories directly.
 */
import { productRepository }  from './repositories/productRepository.js';
import { orderRepository }    from './repositories/orderRepository.js';
import { cartRepository }     from './repositories/cartRepository.js';
import { categoryRepository } from './repositories/categoryRepository.js';
import { promoRepository }    from './repositories/promoRepository.js';

const uow = {
  products:   productRepository,
  orders:     orderRepository,
  cart:       cartRepository,
  categories: categoryRepository,  // also includes subcategory + banner methods
  promo:      promoRepository,
};

export default uow;
