import { useCallback } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import { toggleWishlistId, selectWishlistIds } from '@redux/slices/wishlistSlice';
import { useAddToWishlistMutation, useRemoveFromWishlistMutation } from '@api/wishlistApi';
import { useToast } from './useToast';
import { extractErrorMessage } from '@utils/index';

export const useWishlist = () => {
  const dispatch = useAppDispatch();
  const wishlistIds = useAppSelector(selectWishlistIds);
  const { showError } = useToast();

  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const isInWishlist = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      const inWishlist = wishlistIds.includes(productId);
      // Optimistic update
      dispatch(toggleWishlistId(productId));
      try {
        if (inWishlist) {
          await removeFromWishlist(productId).unwrap();
        } else {
          await addToWishlist(productId).unwrap();
        }
      } catch (err) {
        // Revert on failure
        dispatch(toggleWishlistId(productId));
        showError(extractErrorMessage(err));
      }
    },
    [wishlistIds, dispatch, addToWishlist, removeFromWishlist, showError]
  );

  return { wishlistIds, isInWishlist, toggleWishlist };
};
