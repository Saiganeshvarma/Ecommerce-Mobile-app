import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WishlistState {
  productIds: string[];
}

const initialState: WishlistState = {
  productIds: [],
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlistIds: (state, action: PayloadAction<string[]>) => {
      state.productIds = action.payload;
    },
    toggleWishlistId: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.productIds.includes(id)) {
        state.productIds = state.productIds.filter((pid) => pid !== id);
      } else {
        state.productIds.push(id);
      }
    },
  },
});

export const { setWishlistIds, toggleWishlistId } = wishlistSlice.actions;
export default wishlistSlice.reducer;

export const selectWishlistIds = (state: { wishlist: WishlistState }) =>
  state.wishlist.productIds;
export const selectIsInWishlist = (productId: string) => (state: { wishlist: WishlistState }) =>
  state.wishlist.productIds.includes(productId);
