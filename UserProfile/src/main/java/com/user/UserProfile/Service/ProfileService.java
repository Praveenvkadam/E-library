package com.user.UserProfile.Service;

import com.user.UserProfile.DTO.*;

import java.util.List;

public interface ProfileService {

    ProfileResponseDTO createProfile(ProfileEventDTO event);
    ProfileResponseDTO createProfile(String userId, ProfileRequestDTO dto);
    ProfileResponseDTO getProfileByUserId(String userId);
    ProfileResponseDTO updateProfile(String userId, ProfileRequestDTO dto);
    void deleteProfile(String userId);

    void updateReadingProgress(String userId, ReadingProgressUpdateDTO dto);
    List<ProfileResponseDTO.ReadingHistoryDTO> getReadingHistory(String userId);

    BookmarkResponseDTO addBookmark(String userId, String bookId, Integer page, String note);
    void removeBookmark(String userId, String bookmarkId);
    List<BookmarkResponseDTO> getBookmarks(String userId);

    WishlistItemDTO addToWishlist(String userId, String bookId);
    void removeFromWishlist(String userId, String wishlistItemId);
    List<WishlistItemDTO> getWishlist(String userId);
}