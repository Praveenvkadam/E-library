package com.BookUpload.BookUpload.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long B_id;

    private String B_name;
    private String B_author;
    private String B_description;
    private String B_imageUrl;
    private String B_pdfUrl;
    private Date releaseDate;
    private String B_Category;
    private String B_Language;

}
