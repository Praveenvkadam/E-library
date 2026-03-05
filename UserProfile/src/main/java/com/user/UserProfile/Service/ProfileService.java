package com.user.UserProfile.Service;

import com.user.UserProfile.DTO.ProfileRequestDTO;
import com.user.UserProfile.DTO.ProfileResponseDTO;

public interface ProfileService {
    ProfileResponseDTO createProfile(String userId, ProfileRequestDTO dto);
    ProfileResponseDTO getProfileByUserId(String userId);
    ProfileResponseDTO updateProfile(String userId, ProfileRequestDTO dto);
    void deleteProfile(String userId);
}