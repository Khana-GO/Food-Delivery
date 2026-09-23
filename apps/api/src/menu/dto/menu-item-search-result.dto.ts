import { ApiProperty } from '@nestjs/swagger';
import type { MenuItem } from '../../db/schema';

/**
 * A menu item search hit enriched with everything the UI needs to render the
 * result and navigate straight to the selling restaurant, so a food result never
 * leads to a broken page.
 */
export class MenuItemSearchResultDto {
  @ApiProperty() id!: string;
  @ApiProperty() restaurantId!: string;
  @ApiProperty() categoryId!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ required: false }) description?: string;
  @ApiProperty() price!: number;
  @ApiProperty({ required: false }) imageUrl?: string;
  @ApiProperty() isAvailable!: boolean;

  /** Restaurant context (required for search results). */
  @ApiProperty() restaurantName!: string;
  @ApiProperty({ required: false }) restaurantSlug?: string;
  @ApiProperty({ required: false }) restaurantLogoUrl?: string;
  @ApiProperty({ required: false }) restaurantCoverImageUrl?: string;
  @ApiProperty({ required: false }) restaurantCuisineType?: string;
  @ApiProperty() restaurantIsOpen!: boolean;
  @ApiProperty() restaurantRating!: number;
  @ApiProperty() restaurantTotalReviews!: number;
  @ApiProperty() restaurantDeliveryFee!: number;
  @ApiProperty({ required: false }) restaurantEstimatedDeliveryTime?: number;
  @ApiProperty({ required: false }) restaurantAddress?: string;

  @ApiProperty({ required: false }) categoryName?: string;

  /** Highest relevance score across the batch — used for discovery ordering. */
  @ApiProperty({ required: false }) relevanceScore?: number;
  @ApiProperty({ required: false }) popularity?: number;

  constructor(
    item: MenuItem,
    restaurant: {
      id: string;
      name: string;
      slug?: string | null;
      logoUrl?: string | null;
      coverImageUrl?: string | null;
      cuisineType?: string | null;
      isOpen?: boolean | null;
      averageRating?: unknown;
      totalReviews?: unknown;
      deliveryFee?: unknown;
      estimatedDeliveryTime?: number | null;
      address?: string | null;
    },
    extras: {
      categoryName?: string | null;
      relevanceScore?: number;
      popularity?: number;
    } = {},
  ) {
    this.id = item.id;
    this.restaurantId = item.restaurantId;
    this.categoryId = item.categoryId;
    this.name = item.name;
    this.description = item.description ?? undefined;
    this.price = Number(item.price);
    this.imageUrl = item.imageUrl ?? undefined;
    this.isAvailable = item.isAvailable;

    this.restaurantName = restaurant.name;
    this.restaurantSlug = restaurant.slug ?? undefined;
    this.restaurantLogoUrl = restaurant.logoUrl ?? undefined;
    this.restaurantCoverImageUrl = restaurant.coverImageUrl ?? undefined;
    this.restaurantCuisineType = restaurant.cuisineType ?? undefined;
    this.restaurantIsOpen = Boolean(restaurant.isOpen);
    this.restaurantRating = Number(restaurant.averageRating ?? 0) || 0;
    this.restaurantTotalReviews = Number(restaurant.totalReviews ?? 0) || 0;
    this.restaurantDeliveryFee = Number(restaurant.deliveryFee ?? 0) || 0;
    this.restaurantEstimatedDeliveryTime =
      restaurant.estimatedDeliveryTime ?? undefined;
    this.restaurantAddress = restaurant.address ?? undefined;

    this.categoryName = extras.categoryName ?? undefined;
    this.relevanceScore = extras.relevanceScore;
    this.popularity = extras.popularity;
  }
}
