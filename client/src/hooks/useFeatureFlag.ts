import { useFeatureFlagsContext } from '../context/FeatureFlagContext';

export interface UseFeatureFlagResult {
  enabled: boolean;
  isLoading: boolean;
}

export const useFeatureFlag = (flagKey: string, defaultValue = false): UseFeatureFlagResult => {
  const { isEnabled, isLoading } = useFeatureFlagsContext();

  return {
    enabled: isEnabled(flagKey, defaultValue),
    isLoading
  };
};
