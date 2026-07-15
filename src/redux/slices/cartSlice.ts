import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartState {
  itemCount: number;
}

const initialState: CartState = {
  itemCount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItemCount: (state, action: PayloadAction<number>) => {
      state.itemCount = action.payload;
    },
  },
});

export const { setCartItemCount } = cartSlice.actions;
export default cartSlice.reducer;

export const selectCartItemCount = (state: { cart: CartState }) => state.cart.itemCount;
