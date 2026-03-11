package com.user.UserProfile.Repository;

import com.user.UserProfile.Entity.Profile;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, String> {

    Optional<Profile> findByEmail(String email);

    boolean existsByEmail(String email);

    // ✅ Basic — no collections (used for create / update / delete)
    @Query("SELECT p FROM Profile p WHERE p.userId = :userId")
    Optional<Profile> findByIdOnly(@Param("userId") String userId);

    // ✅ Profile + readingHistory only — no cartesian product
    @EntityGraph(attributePaths = {"readingHistory"})
    @Query("SELECT p FROM Profile p WHERE p.userId = :userId")
    Optional<Profile> findWithReadingHistoryByUserId(@Param("userId") String userId);

    // ✅ Profile + bookmarks only
    @EntityGraph(attributePaths = {"bookmarks"})
    @Query("SELECT p FROM Profile p WHERE p.userId = :userId")
    Optional<Profile> findWithBookmarksByUserId(@Param("userId") String userId);

    // ✅ Profile + wishlist only
    @EntityGraph(attributePaths = {"wishlist"})
    @Query("SELECT p FROM Profile p WHERE p.userId = :userId")
    Optional<Profile> findWithWishlistByUserId(@Param("userId") String userId);

    // ✅ Full profile — all 3 collections in one query (used by mapToResponse)
    @EntityGraph(attributePaths = {"readingHistory", "bookmarks", "wishlist"})
    @Query("SELECT p FROM Profile p WHERE p.userId = :userId")
    Optional<Profile> findFullProfileByUserId(@Param("userId") String userId);
}