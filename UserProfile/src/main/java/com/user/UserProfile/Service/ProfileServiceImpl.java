package com.user.UserProfile.Service;

import com.user.UserProfile.DTO.ProfileEventDTO;
import com.user.UserProfile.DTO.ProfileRequestDTO;
import com.user.UserProfile.DTO.ProfileResponseDTO;
import com.user.UserProfile.Entity.Profile;
import com.user.UserProfile.Exception.ProfileAlreadyExistsException;
import com.user.UserProfile.Exception.ProfileNotFoundException;
import com.user.UserProfile.Kafka.ProfileEventProducer;
import com.user.UserProfile.Repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Date;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final ProfileRepository profileRepository;
    private final ProfileEventProducer eventProducer;

    @Override
    public ProfileResponseDTO createProfile(String userId, ProfileRequestDTO dto) {
        if (profileRepository.existsByUserId(userId)) {
            throw new ProfileAlreadyExistsException("Profile already exists for userId: " + userId);
        }

        Profile profile = Profile.builder()
                .userId(userId)
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .bookMarked(0)
                .readHistory("")
                .updatedDate(new Date())
                .build();

        Profile saved = profileRepository.save(profile);
        log.info("✅ Profile saved to DB for userId: [{}]", userId);

        // ✅ Kafka failure won't crash the API
        try {
            eventProducer.sendProfileCreated(ProfileEventDTO.builder()
                    .userId(saved.getUserId())
                    .eventType("CREATED")
                    .email(saved.getEmail())
                    .firstName(saved.getFirstName())
                    .lastName(saved.getLastName())
                    .eventTime(LocalDateTime.now())
                    .build());
        } catch (Exception e) {
            log.warn("⚠️ Kafka event failed for CREATED — userId: [{}] reason: {}", userId, e.getMessage());
        }

        return mapToResponse(saved);
    }

    @Override
    public ProfileResponseDTO getProfileByUserId(String userId) {
        Profile profile = profileRepository.findById(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Profile not found for userId: " + userId));
        return mapToResponse(profile);
    }

    @Override
    public ProfileResponseDTO updateProfile(String userId, ProfileRequestDTO dto) {
        Profile profile = profileRepository.findById(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Profile not found for userId: " + userId));

        profile.setFirstName(dto.getFirstName());
        profile.setLastName(dto.getLastName());
        profile.setPhone(dto.getPhone());
        profile.setBookMarked(dto.getBookMarked());
        profile.setReadHistory(dto.getReadHistory());
        profile.setUpdatedDate(new Date());

        Profile updated = profileRepository.save(profile);
        log.info("✅ Profile updated in DB for userId: [{}]", userId);

        // ✅ Kafka failure won't crash the API
        try {
            eventProducer.sendProfileUpdated(ProfileEventDTO.builder()
                    .userId(updated.getUserId())
                    .eventType("UPDATED")
                    .email(updated.getEmail())
                    .firstName(updated.getFirstName())
                    .lastName(updated.getLastName())
                    .eventTime(LocalDateTime.now())
                    .build());
        } catch (Exception e) {
            log.warn("⚠️ Kafka event failed for UPDATED — userId: [{}] reason: {}", userId, e.getMessage());
        }

        return mapToResponse(updated);
    }

    @Override
    public void deleteProfile(String userId) {
        Profile profile = profileRepository.findById(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Profile not found for userId: " + userId));

        profileRepository.delete(profile);
        log.info("✅ Profile deleted from DB for userId: [{}]", userId);

        // ✅ Kafka failure won't crash the API
        try {
            eventProducer.sendProfileDeleted(ProfileEventDTO.builder()
                    .userId(userId)
                    .eventType("DELETED")
                    .email(profile.getEmail())
                    .firstName(profile.getFirstName())
                    .lastName(profile.getLastName())
                    .eventTime(LocalDateTime.now())
                    .build());
        } catch (Exception e) {
            log.warn("⚠️ Kafka event failed for DELETED — userId: [{}] reason: {}", userId, e.getMessage());
        }
    }

    // ── private mapper ────────────────────────────────────────
    private ProfileResponseDTO mapToResponse(Profile profile) {
        return ProfileResponseDTO.builder()
                .userId(profile.getUserId())
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .email(profile.getEmail())
                .phone(profile.getPhone())
                .bookMarked(profile.getBookMarked())
                .readHistory(profile.getReadHistory())
                .updatedDate(profile.getUpdatedDate())
                .build();
    }
}