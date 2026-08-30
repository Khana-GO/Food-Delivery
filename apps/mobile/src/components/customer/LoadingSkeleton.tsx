import React from 'react';
import { CardSkeleton } from '@/components/ui/Skeleton';

interface Props {
  count?: number;
  variant?: 'grid' | 'list';
}
export const LoadingSkeleton = ({ count = 4, variant = 'grid' }: Props) => {
  return <CardSkeleton count={count} variant={variant} />;
};
