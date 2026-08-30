import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto, CartItemDto } from './dto/cart-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user cart' })
  async getCart(
    @CurrentUser() user: JwtPayload,
  ): Promise<CartResponseDto | null> {
    return this.cartService.getCart(user.sub);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  async addItem(
    @CurrentUser() user: JwtPayload,
    @Body() dto: AddToCartDto,
  ): Promise<CartResponseDto> {
    return this.cartService.addItem(user.sub, dto);
  }

  @Put('items')
  @ApiOperation({ summary: 'Update item quantity (0 removes)' })
  async updateItem(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateCartItemDto,
  ): Promise<CartResponseDto | null> {
    return this.cartService.updateItem(user.sub, dto);
  }

  @Delete('items/:menuItemId')
  @ApiOperation({ summary: 'Remove an item from cart' })
  @ApiParam({ name: 'menuItemId', type: 'String' })
  async removeItem(
    @CurrentUser() user: JwtPayload,
    @Param('menuItemId', new ParseUUIDPipe({ version: '4' }))
    menuItemId: string,
  ): Promise<CartResponseDto | null> {
    return this.cartService.removeItem(user.sub, menuItemId);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear entire cart' })
  async clearCart(
    @CurrentUser() user: JwtPayload,
  ): Promise<{ message: string }> {
    await this.cartService.clearCart(user.sub);
    return { message: 'Cart cleared' };
  }

  // ─── Merge guest cart on login (call from frontend after login) ───
  @Post('merge')
  @ApiOperation({ summary: 'Merge guest cart with backend cart' })
  async mergeCart(
    @CurrentUser() user: JwtPayload,
    @Body() body: { items: CartItemDto[]; restaurantId: string },
  ): Promise<CartResponseDto | null> {
    return this.cartService.mergeCart(user.sub, body.items, body.restaurantId);
  }
}
