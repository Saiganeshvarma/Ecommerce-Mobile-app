import * as Yup from 'yup';

export const productSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string().min(20, 'Description must be at least 20 characters').required('Description is required'),
  category: Yup.string().required('Category is required'),
  price: Yup.number().min(1, 'Price must be greater than 0').required('Price is required'),
  discountPrice: Yup.number()
    .optional()
    .test('less-than-price', 'Discount price must be less than price', function (val) {
      if (!val) return true;
      return val < this.parent.price;
    }),
  brand: Yup.string().required('Brand is required'),
  stock: Yup.number().min(0, 'Stock cannot be negative').required('Stock is required'),
  featured: Yup.boolean().optional(),
});

export type ProductFormData = Yup.InferType<typeof productSchema>;
