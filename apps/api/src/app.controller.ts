import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import type { HealthCheckResponse } from '@food_delivery/types';

@Controller()
export class AppController {
  [x: string]: any;
  constructor(private readonly appService: AppService) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date(),
      data: [
        { id: 1, name: 'Chicken Burger', price: 350, category: 'Burger' },
        { id: 2, name: 'Veg Burger', price: 280, category: 'Burger' },
        { id: 3, name: 'Cheese Pizza', price: 650, category: 'Pizza' },
        { id: 4, name: 'Pepperoni Pizza', price: 750, category: 'Pizza' },
        { id: 5, name: 'Chicken Momo', price: 220, category: 'Momo' },
        { id: 6, name: 'Buff Momo', price: 240, category: 'Momo' },
        { id: 7, name: 'Veg Momo', price: 180, category: 'Momo' },
        { id: 8, name: 'Chicken Chowmein', price: 250, category: 'Noodles' },
        { id: 9, name: 'Veg Chowmein', price: 200, category: 'Noodles' },
        { id: 10, name: 'Fried Rice', price: 230, category: 'Rice' },
        { id: 11, name: 'Chicken Fried Rice', price: 280, category: 'Rice' },
        { id: 12, name: 'Biryani', price: 420, category: 'Rice' },
        { id: 13, name: 'Chicken Sandwich', price: 260, category: 'Sandwich' },
        { id: 14, name: 'Club Sandwich', price: 320, category: 'Sandwich' },
        { id: 15, name: 'French Fries', price: 180, category: 'Snacks' },
        { id: 16, name: 'Chicken Wings', price: 380, category: 'Snacks' },
        { id: 17, name: 'Spring Roll', price: 190, category: 'Snacks' },
        { id: 18, name: 'Pasta Alfredo', price: 420, category: 'Pasta' },
        { id: 19, name: 'Spaghetti', price: 450, category: 'Pasta' },
        {
          id: 20,
          name: 'Grilled Chicken',
          price: 550,
          category: 'Main Course',
        },
        { id: 21, name: 'Paneer Curry', price: 390, category: 'Main Course' },
        { id: 22, name: 'Butter Naan', price: 80, category: 'Bread' },
        { id: 23, name: 'Cold Coffee', price: 180, category: 'Beverage' },
        { id: 24, name: 'Cappuccino', price: 220, category: 'Beverage' },
        {
          id: 25,
          name: 'Fresh Orange Juice',
          price: 200,
          category: 'Beverage',
        },
        { id: 26, name: 'Chocolate Shake', price: 240, category: 'Beverage' },
        { id: 27, name: 'Chocolate Cake', price: 300, category: 'Dessert' },
        { id: 28, name: 'Ice Cream Sundae', price: 250, category: 'Dessert' },
        { id: 29, name: 'Brownie', price: 220, category: 'Dessert' },
        { id: 30, name: 'Donut', price: 120, category: 'Dessert' },
      ],
    };
  }
}
