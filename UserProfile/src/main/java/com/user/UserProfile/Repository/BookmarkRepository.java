package com.user.UserProfile.Repository;

import com.user.UserProfile.Entity.Bookmark;
import com.user.UserProfile.Entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, String> {

    List<Bookmark> findByProfile(Profile profile);

    List<Bookmark> findByProfileAndBookId(Profile profile, String bookId);

    Optional<Bookmark> findByProfileAndBookIdAndPageNumber(Profile profile, String bookId, Integer pageNumber);

    boolean existsByProfileAndBookIdAndPageNumber(Profile profile, String bookId, Integer pageNumber);

    int countByProfile(Profile profile);

    void deleteAllByProfile(Profile profile);

    void deleteAllByBookId(String bookId);
}