import { useCallback } from 'react';
import { useAddToCartMutation, useGetCartQuery } from '@api/cartApi';
import { useToast } from './useToast';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import { setCartItemCount } from '@redux/slices/cartSlice';
import { selectIsAuthenticated } from '@redux/slices/authSlice';
import { extractErrorMessage } from '@utils/index';

export const useCart = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  // Separate mutation instances so each button has its own independent loading state
  const [addToCartMutation, { isLoading: isAdding }] = useAddToCartMutation();
  const [buyNowMutation, { isLoading: isBuyingNow }] = useAddToCartMutation();
  const { refetch } = useGetCartQuery(undefined, { skip: !isAuthenticated });
  const { showSuccess, showError } = useToast();

  const addToCart = useCallback(
    async (productId: string, quantity: number = 1): Promise<boolean> => {
      try {
        const res = await addToCartMutation({ productId, quantity }).unwrap();

        // Update Redux badge count — safe fallback for both 'items' and 'products'
        const cartData = res.data.cart as any;
        const count = (cartData.items ?? cartData.products ?? []).length;
        dispatch(setCartItemCount(count));

        showSuccess('Item added to cart');
        // Force a fresh cart fetch so the UI stays in sync
        if (isAuthenticated) refetch();

        return true;
      } catch (err) {
        showError(extractErrorMessage(err));
        return false;
      }
    },
    [addToCartMutation, dispatch, showSuccess, showError, refetch, isAuthenticated]
  );

  const buyNow = useCallback(
    async (productId: string, quantity: number = 1): Promise<boolean> => {
      try {
        const res = await buyNowMutation({ productId, quantity }).unwrap();

        const cartData = res.data.cart as any;
        const count = (cartData.items ?? cartData.products ?? []).length;
        dispatch(setCartItemCount(count));

        if (isAuthenticated) refetch();

        return true;
      } catch (err) {
        showError(extractErrorMessage(err));
        return false;
      }
    },
    [buyNowMutation, dispatch, showError, refetch, isAuthenticated]
  );

  return { addToCart, isAdding, buyNow, isBuyingNow };
};