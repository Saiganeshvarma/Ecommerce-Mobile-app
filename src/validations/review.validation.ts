import * as Yup from 'yup';

export const reviewSchema = Yup.object({
  rating: Yup.number().min(1, 'Rating required').max(5).required('Rating is required'),
  comment: Yup.string().min(10, 'Comment must be at least 10 characters').required('Comment is required'),
});

export type ReviewFormData = Yup.InferType<typeof reviewSchema>;
