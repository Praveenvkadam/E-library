package com.user.UserProfile.Repository;

import com.user.UserProfile.Entity.Profile;
import com.user.UserProfile.Entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<WishlistItem, String> {

    List<WishlistItem> findByProfile(Profile profile);

    Optional<WishlistItem> findByProfileAndBookId(Profile profile, String bookId);

    boolean existsByProfileAndBookId(Profile profile, String bookId);

    int countByProfile(Profile profile);

    void deleteAllByProfile(Profile profile);

    void deleteAllByBookId(String bookId);
}