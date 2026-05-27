import type { UserProfile } from "@/types/profile";

export type ProfileField =
  | "name"
  | "gender"
  | "age"
  | "weight"
  | "height"
  | "level";

type ProfileValidationValue = string | number;

const PROFILE_VALIDATION_RULES: Record<
  ProfileField,
  (value: ProfileValidationValue) => boolean
> = {
  name: (value) => {
    const normalized = value.toString().trim();
    return normalized.length < 2 || normalized.length > 15;
  },
  gender: (value) => !value,
  age: (value) => !value || Number(value) < 14 || Number(value) > 100,
  weight: (value) => !value || Number(value) < 30 || Number(value) > 300,
  height: (value) => !value || Number(value) < 100 || Number(value) > 250,
  level: (value) => !value,
};

export function getInvalidProfileFields(
  profile: Partial<Record<ProfileField, ProfileValidationValue>>
): ProfileField[] {
  return (Object.keys(PROFILE_VALIDATION_RULES) as ProfileField[]).filter(
    (field) => PROFILE_VALIDATION_RULES[field](profile[field] ?? "")
  );
}

export function getInvalidUserProfileFields(profile: UserProfile): ProfileField[] {
  return getInvalidProfileFields(profile);
}
