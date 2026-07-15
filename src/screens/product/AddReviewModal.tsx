import React from 'react';
import {
  View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { reviewSchema, type ReviewFormData } from '@validations/review.validation';
import { useAddReviewMutation } from '@api/reviewApi';
import { useToast } from '@hooks/useToast';
import { extractErrorMessage } from '@utils/index';
import AppInput from '@components/common/AppInput';
import AppButton from '@components/common/AppButton';
import RatingStars from '@components/common/RatingStars';
import { Colors } from '@theme/colors';
import { BorderRadius, Spacing, Shadow } from '@theme/spacing';
import { FontSize, FontWeight } from '@theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { RATING_LABELS } from '@constants/index';

interface AddReviewModalProps {
  visible: boolean;
  productId: string;
  onClose: () => void;
}

const AddReviewModal: React.FC<AddReviewModalProps> = ({ visible, productId, onClose }) => {
  const { showSuccess, showError } = useToast();
  const [addReview, { isLoading }] = useAddReviewMutation();

  const { control, handleSubmit, setValue, watch, formState: { errors }, reset } =
    useForm<ReviewFormData>({
      resolver: yupResolver(reviewSchema),
      defaultValues: { rating: 0, comment: '' },
    });

  const rating = watch('rating');

  const onSubmit = async (data: ReviewFormData) => {
    try {
      await addReview({ productId, ...data }).unwrap();
      showSuccess('Review submitted!');
      reset();
      onClose();
    } catch (err) {
      showError(extractErrorMessage(err));
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Write a Review</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {/* Star rating picker */}
          <View style={styles.ratingSection}>
            <RatingStars
              rating={rating}
              size={36}
              interactive
              onRate={(r) => setValue('rating', r)}
            />
            {rating > 0 && (
              <Text style={styles.ratingLabel}>{RATING_LABELS[rating - 1]}</Text>
            )}
            {errors.rating && <Text style={styles.errorText}>{errors.rating.message}</Text>}
          </View>

          <Controller
            control={control}
            name="comment"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Comment"
                placeholder="Share your experience with this product..."
                value={value}
                onChangeText={onChange}
                error={errors.comment?.message}
                multiline
                numberOfLines={4}
                style={{ height: 100, textAlignVertical: 'top' }}
              />
            )}
          />

          <AppButton
            title="Submit Review"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            size="lg"
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    ...Shadow.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  ratingSection: {
    alignItems: 'center',
    marginBottom: Spacing.base,
    padding: Spacing.base,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
  },
  ratingLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.star,
    marginTop: Spacing.sm,
  },
  errorText: { fontSize: FontSize.xs, color: Colors.error, marginTop: 4 },
});

export default AddReviewModal;
