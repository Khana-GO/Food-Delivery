// dto/restaurant-stats.dto.ts
export class RestaurantStatsDto {
  total!: number;
  active!: number;
  inactive!: number;
  verified!: number;
  unverified!: number;
  open!: number;
  closed!: number;
  deleted!: number;
}
