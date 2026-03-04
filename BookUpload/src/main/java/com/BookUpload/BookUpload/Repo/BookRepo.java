package com.BookUpload.BookUpload.Repo;

import com.BookUpload.BookUpload.Entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;

public interface BookRepo extends JpaRepository<Book, Long> {

    @Query("""
            SELECT b FROM Book b
            WHERE (:B_name     IS NULL OR LOWER(b.B_name)     LIKE LOWER(CONCAT('%', :B_name,     '%')))
              AND (:B_author   IS NULL OR LOWER(b.B_author)   LIKE LOWER(CONCAT('%', :B_author,   '%')))
              AND (:B_Category IS NULL OR LOWER(b.B_Category) LIKE LOWER(CONCAT('%', :B_Category, '%')))
              AND (:releaseDate IS NULL OR b.releaseDate       = :releaseDate)
              AND (:B_Language IS NULL OR LOWER(b.B_Language) LIKE LOWER(CONCAT('%', :B_Language, '%')))
            """)
    List<Book> searchBooks(@Param("B_name")      String B_name,
                           @Param("B_author")    String B_author,
                           @Param("releaseDate") Date releaseDate,
                           @Param("B_Category")  String B_Category);
}
