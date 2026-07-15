import * as Yup from 'yup';

export const addressSchema = Yup.object({
  fullName: Yup.string().required('Full name is required'),
  mobile: Yup.string()
    .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number')
    .required('Mobile number is required'),
  houseNo: Yup.string().required('House/Flat No is required'),
  street: Yup.string().required('Street is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  country: Yup.string().required('Country is required'),
  pincode: Yup.string()
    .matches(/^\d{6}$/, 'Enter a valid 6-digit pincode')
    .required('Pincode is required'),
  isDefault: Yup.boolean().optional(),
});

export type AddressFormData = Yup.InferType<typeof addressSchema>;
