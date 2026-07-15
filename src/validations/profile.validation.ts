import * as Yup from 'yup';

export const editProfileSchema = Yup.object({
  name: Yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  phone: Yup.string()
    .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number')
    .optional(),
});

export type EditProfileFormData = Yup.InferType<typeof editProfileSchema>;
